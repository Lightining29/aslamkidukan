import express from 'express';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { getFinalPrice } from '../utils/pricing.js';
import { sendOrderReceipt } from '../services/email.js';
import { verifyOrderSignature, verifyWebhookSignature } from '../utils/razorpaySignature.js';
import {
  isMySQLActive,
  mysqlCreateOrder,
  mysqlGetOrderById,
  mysqlGetOrderByRazorpayId,
  mysqlGetOrdersByUserId,
  mysqlUpdateOrder,
  mysqlGetProductBySlug
} from '../config/mysql.js';

const router = express.Router();

let razorpay = null;
function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID?.trim()?.replace(/^["']|["']$/g, '');
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim()?.replace(/^["']|["']$/g, '');
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

function getProductId(product) {
  if (!product) return '';
  if (typeof product === 'string') return product;
  if (product._id) return product._id.toString();
  if (product.toString) return product.toString();
  return '';
}

function getProductImageUrl(product) {
  const productId = getProductId(product);
  if (!productId) return '';
  const version = product.updatedAt ? `?v=${product.updatedAt.getTime()}` : '';
  return `/api/images/product/${productId}${version}`;
}

function withItemImageFallback(order) {
  if (order.toObject) {
    const obj = order.toObject();
    obj.items = (obj.items || []).map((item) => ({
      ...item,
      image: item.image || getProductImageUrl(item.product),
    }));
    return obj;
  }
  return order;
}

export async function fulfillOrder(order) {
  if (order.items && Array.isArray(order.items)) {
    for (const item of order.items) {
      try {
        const product = await Product.findById(item.product || item.productId);
        if (product) {
          product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
          product.inStock = product.stockQuantity > 0;
          product.salesCount = (product.salesCount || 0) + item.quantity;
          await product.save();
        }
      } catch {
        // MySQL fallback
      }
    }
  }

  if (!order.receiptSent) {
    const targetEmail = order.shippingAddress?.email || order.customerEmail;
    await sendOrderReceipt(order, targetEmail);
    if (isMySQLActive()) {
      await mysqlUpdateOrder(order.id || order._id, { receiptSent: 1 });
    }
    if (order.save) {
      order.receiptSent = true;
      await order.save();
    }
  }
}

async function sendReceiptIfNeeded(order) {
  if (!order.receiptSent) {
    const targetEmail = order.shippingAddress?.email || order.customerEmail;
    await sendOrderReceipt(order, targetEmail);
    if (isMySQLActive()) {
      await mysqlUpdateOrder(order.id || order._id, { receiptSent: 1 });
    }
    if (order.save) {
      order.receiptSent = true;
      await order.save();
    }
  }
}

function hasConfirmedPayment(order) {
  return ['paid', 'approved', 'shipped'].includes(order.paymentStatus || order.status);
}

/** Razorpay webhook — raw body registered in index.js. Idempotent safety net. */
export async function razorpayWebhookHandler(req, res) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const rawBody = req.body?.toString?.() || '';
  const signature = req.headers['x-razorpay-signature'];

  if (!secret || !verifyWebhookSignature(rawBody, signature, secret)) {
    return res.status(400).send('Invalid signature');
  }

  try {
    const event = JSON.parse(rawBody);
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;
      if (orderId) {
        if (isMySQLActive()) {
          const order = await mysqlGetOrderByRazorpayId(orderId);
          if (order && order.paymentStatus === 'pending') {
            await mysqlUpdateOrder(order.id, {
              paymentStatus: 'paid',
              orderStatus: 'paid',
              razorpayPaymentId: payment.id,
            });
            await fulfillOrder(order);
          }
        }

        try {
          const mongoOrder = await Order.findOne({ razorpayOrderId: orderId });
          if (mongoOrder && mongoOrder.status === 'pending_payment') {
            mongoOrder.status = 'paid';
            mongoOrder.razorpayPaymentId = payment.id;
            await mongoOrder.save();
            await fulfillOrder(mongoOrder);
          }
        } catch {
          // Mongo skipped
        }
      }
    }
  } catch (err) {
    console.error('Razorpay webhook error:', err.message);
  }

  return res.json({ received: true });
}

// Create order + Razorpay order
router.post('/checkout', protect, async (req, res) => {
  try {
    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(500).json({ message: 'Razorpay API credentials not configured.' });
    }

    const { items, shippingAddress } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Cart is empty' });
    if (!shippingAddress?.fullName || !shippingAddress?.email || !shippingAddress?.address) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const price = Number(item.price || item.flashSalePrice || 499);
      const qty = Number(item.quantity || 1);
      orderItems.push({
        product: item.productId || item._id || item.id,
        productId: item.productId || item._id || item.id,
        name: item.name || '3D Wall Sticker',
        image: item.image || item.imageUrl || '',
        price,
        quantity: qty,
      });
      subtotal += price * qty;
    }

    const orderNumber = `ORD-AAAN-${Date.now().toString().slice(-6)}`;

    // Create in MySQL
    let orderRecord = null;
    if (isMySQLActive()) {
      orderRecord = await mysqlCreateOrder({
        orderNumber,
        userId: req.user.id || req.user._id,
        customerName: shippingAddress.fullName,
        customerEmail: shippingAddress.email,
        customerPhone: shippingAddress.phone || '',
        shippingAddress,
        subtotal,
        totalAmount: subtotal,
        items: orderItems,
      });
    }

    // Also attempt MongoDB if active
    let mongoOrder = null;
    try {
      mongoOrder = await Order.create({
        user: req.user.id,
        items: orderItems,
        subtotal,
        total: subtotal,
        shippingAddress,
        status: 'pending_payment',
      });
    } catch {
      // Mongo fallback to MySQL
    }

    const effectiveId = orderRecord ? String(orderRecord.id) : (mongoOrder ? mongoOrder._id.toString() : String(Date.now()));

    // Create Razorpay Order
    const razorpayOrder = await rzp.orders.create({
      amount: Math.round(subtotal * 100), // paise
      currency: 'INR',
      receipt: orderNumber,
      notes: { orderId: effectiveId },
    });

    if (isMySQLActive() && orderRecord) {
      await mysqlUpdateOrder(orderRecord.id, { razorpayOrderId: razorpayOrder.id });
    }
    if (mongoOrder) {
      mongoOrder.razorpayOrderId = razorpayOrder.id;
      await mongoOrder.save();
    }

    return res.json({
      orderId: effectiveId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID?.trim()?.replace(/^["']|["']$/g, ''),
    });
  } catch (err) {
    console.error('Checkout error:', err);
    const errorMsg = err?.error?.description || err?.message || 'Razorpay checkout failed';
    res.status(500).json({ message: errorMsg });
  }
});

// Verify payment signature
router.post('/verify/:orderId', protect, async (req, res) => {
  try {
    const { razorpayPaymentId, razorpaySignature } = req.body;
    const { orderId } = req.params;

    let order = null;
    if (isMySQLActive()) {
      order = await mysqlGetOrderById(orderId);
    }
    if (!order) {
      try {
        order = await Order.findOne({ _id: orderId });
      } catch {
        // Not in mongo
      }
    }

    if (!order) return res.status(404).json({ message: 'Order not found' });
    const razorpayOrderId = order.razorpayOrderId;
    if (!razorpayOrderId) return res.status(400).json({ message: 'Order has no Razorpay session' });

    const valid = verifyOrderSignature(
      { razorpayOrderId, razorpayPaymentId, signature: razorpaySignature },
      process.env.RAZORPAY_KEY_SECRET
    );
    if (!valid) return res.status(400).json({ message: 'Invalid signature' });

    if (isMySQLActive()) {
      await mysqlUpdateOrder(order.id || order._id, {
        paymentStatus: 'paid',
        orderStatus: 'paid',
        razorpayPaymentId,
        razorpaySignature,
      });
    }

    if (order.save) {
      order.status = 'paid';
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;
      await order.save();
    }

    await fulfillOrder(order);
    return res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (isMySQLActive()) {
      const mysqlOrders = await mysqlGetOrdersByUserId(userId);
      if (mysqlOrders && mysqlOrders.length > 0) {
        return res.json(mysqlOrders);
      }
    }

    try {
      const orders = await Order.find({ user: userId })
        .populate('items.product', 'updatedAt')
        .sort({ createdAt: -1 });
      if (orders && orders.length > 0) {
        return res.json(orders.map(withItemImageFallback));
      }
    } catch {
      // Mongo fallback
    }

    const mysqlOrders = await mysqlGetOrdersByUserId(userId);
    return res.json(mysqlOrders || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (isMySQLActive()) {
      const order = await mysqlGetOrderById(id);
      if (order) return res.json(order);
    }

    try {
      const order = await Order.findOne({ _id: id, user: req.user.id })
        .populate('items.product', 'updatedAt');
      if (order) return res.json(withItemImageFallback(order));
    } catch {
      // Fallback
    }

    const order = await mysqlGetOrderById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
