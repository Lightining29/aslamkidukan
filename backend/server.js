import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { Server } from 'socket.io';
import { connectDB } from './src/config/database.js';
import { initMySQLDatabase } from './src/config/mysql.js';
import categoryRoutes from './src/routes/categories.js';
import productRoutes from './src/routes/products.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import orderRoutes, { razorpayWebhookHandler } from './src/routes/orders.js';
import adminRoutes from './src/routes/admin.js';
import bannerRoutes from './src/routes/banner.js';
import reviewRoutes from './src/routes/reviews.js';
import imageRoutes from './src/routes/images.js';
import contactRoutes from './src/routes/contact.js';
import stockRoutes from './src/routes/stock.js';
import settingsRoutes from './src/routes/settings.js';
import Banner from './src/models/Banner.js';
import compression from 'compression';
import blogRoutes from './src/routes/blogs.js';
import { promoBannersPublic, promoBannersAdmin } from './src/routes/promoBanners.js';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';
import Blog from './src/models/Blog.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from './src/models/Order.js';
import { fulfillOrder } from './src/routes/orders.js';


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(compression());

app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), razorpayWebhookHandler);
app.post('/razorpay/webhook', express.raw({ type: 'application/json' }), razorpayWebhookHandler);
app.post('/api/razorpay/webhook', express.raw({ type: 'application/json' }), razorpayWebhookHandler);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Glowora API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/promo-banners', promoBannersPublic);
app.use('/api/admin/promo-banners', promoBannersAdmin);

// Razorpay checkout endpoints
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    // Validate amount >= 100 paise
    if (amount === undefined || amount === null) {
      return res.status(400).json({ message: 'Amount is required' });
    }
    if (amount < 100) {
      return res.status(400).json({ message: 'Amount must be at least 100 paise' });
    }

    // Handle auth failures (return 401)
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(401).json({ message: 'Razorpay API credentials not configured' });
    }

    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(amount),
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    });

    return res.json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    console.error('Create order error:', err);
    if (err.statusCode === 401) {
      return res.status(401).json({ message: 'Razorpay authentication failure' });
    }
    return res.status(500).json({ message: err.message || 'Razorpay order creation failed' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Missing fields: return 400
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required payment verification fields' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Razorpay API credentials not configured' });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare generated signature with razorpay_signature
    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch: return 400, do NOT mark as paid
      return res.status(400).json({ message: 'Invalid payment signature mismatch' });
    }

    // If order exists in DB, update it
    try {
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (order) {
        if (order.status === 'pending_payment') {
          order.status = 'paid';
          order.razorpayPaymentId = razorpay_payment_id;
          order.razorpaySignature = razorpay_signature;
          await order.save();
          await fulfillOrder(order);
        }
      }
    } catch (dbErr) {
      console.error('Failed to update database order:', dbErr);
    }

    return res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ message: err.message || 'Payment verification failed' });
  }
});

// Manual test payment simulation (bypasses checkout modal)
// Creates a real Razorpay order, generates a synthetic payment ID,
// computes the real HMAC-SHA256 signature, then verifies it.
app.post('/api/test-simulate-payment', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(401).json({ message: 'Razorpay API credentials not configured' });
    }

    // Step 1: Create a real Razorpay order
    const razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount || 100),
      currency: currency || 'INR',
      receipt: `test_rcpt_${Date.now()}`,
    });

    // Step 2: Generate a synthetic payment ID (mimics what Razorpay returns after payment)
    const syntheticPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Step 3: Compute the real HMAC-SHA256 signature exactly as Razorpay does
    const signature = crypto
      .createHmac('sha256', keySecret)
      .update(`${order.id}|${syntheticPaymentId}`)
      .digest('hex');

    return res.json({
      success: true,
      order_id: order.id,
      payment_id: syntheticPaymentId,
      signature: signature,
      amount: order.amount,
      currency: order.currency,
      note: 'Test simulation: real order + synthetic payment_id + valid HMAC signature',
    });
  } catch (err) {
    console.error('Test simulate payment error:', err);
    return res.status(500).json({ message: err.message || 'Test payment simulation failed' });
  }
});

// Robots.txt Route
app.get('/robots.txt', (_req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: https://www.afshaenterprises.com/sitemap.xml`);
});

// Sitemap.xml Route
app.get('/sitemap.xml', async (req, res) => {
  try {
    const categories = await Category.find().select('slug updatedAt');
    const products = await Product.find().select('slug updatedAt');
    const blogs = await Blog.find().select('slug updatedAt');

    const domain = 'https://www.afshaenterprises.com';

    // Static pages
    const staticUrls = [
      { loc: `${domain}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${domain}/contact`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${domain}/blogs`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${domain}/locations/delhi`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${domain}/locations/mumbai`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${domain}/locations/bangalore`, priority: '0.7', changefreq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Append static URLs
    staticUrls.forEach((url) => {
      xml += `  <url>\n`;
      xml += `    <loc>${url.loc}</loc>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Append Category URLs
    categories.forEach((c) => {
      const date = c.updatedAt ? c.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${domain}/category/${c.slug}</loc>\n`;
      xml += `    <lastmod>${date}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Append Product URLs
    products.forEach((p) => {
      const date = p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${domain}/products/${p.slug}</loc>\n`;
      xml += `    <lastmod>${date}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });

    // Append Blog URLs
    blogs.forEach((b) => {
      const date = b.updatedAt ? b.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${domain}/blog/${b.slug}</loc>\n`;
      xml += `    <lastmod>${date}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).end();
  }
});

// Serve frontend static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// SPA catch-all: serve index.html for any non-API route
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

connectDB();
initMySQLDatabase();

// Socket.IO real-time banner updates using MongoDB change streams
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Watch Banner collection for changes and broadcast to all connected clients
async function setupBannerChangeStream() {
  try {
    if (!Banner.db || !Banner.db.db) {
      setupBannerPolling();
      return;
    }
    // Check if the MongoDB deployment supports change streams (requires replica set or mongos)
    const admin = Banner.db.db.admin();
    const serverStatus = await admin.command({ isMaster: 1 });
    const isReplicaSetOrMongos = !!(serverStatus.setName || serverStatus.msg === 'isdbgrid');

    if (!isReplicaSetOrMongos) {
      console.log('MongoDB is running as a standalone instance — change streams are not supported.');
      console.log('Using polling fallback for banner updates.');
      setupBannerPolling();
      return;
    }

    const bannerCollection = Banner.collection;
    if (!bannerCollection) {
      setupBannerPolling();
      return;
    }
    const changeStream = bannerCollection.watch([
      { $match: { 'operationType': { $in: ['insert', 'update', 'replace'] }, 'fullDocument.singleton': true } },
    ]);

    changeStream.on('change', async (change) => {
      try {
        const banner = await Banner.findOne({ singleton: true });
        if (banner) {
          const v = banner.updatedAt ? banner.updatedAt.getTime() : Date.now();
          const imageUrl = banner.imageData ? `/api/images/banner/hero?v=${v}` : null;
          const promoImageUrl = banner.promoImageData ? `/api/images/banner/promo?v=${v}` : null;
          
          io.emit('banner-updated', { imageUrl, promoImageUrl, updatedAt: banner.updatedAt });
          console.log('Broadcasting banner update:', { imageUrl, promoImageUrl });
        }
      } catch (err) {
        console.error('Error in change stream handler:', err.message);
      }
    });

    changeStream.on('error', (err) => {
      console.error('Change stream error:', err.message);
      // Reconnect after 5 seconds
      setTimeout(setupBannerChangeStream, 5000);
    });

    console.log('Banner change stream active (replica set detected).');
  } catch (err) {
    console.log('Falling back to polling for banner updates.');
    setupBannerPolling();
  }
}

// Polling fallback: check for banner changes every 10 seconds
let lastBannerUpdate = null;
function setupBannerPolling() {
  setInterval(async () => {
    try {
      const banner = await Banner.findOne({ singleton: true });
      if (banner) {
        const updatedAt = banner.updatedAt ? banner.updatedAt.toISOString() : null;
        if (updatedAt && updatedAt !== lastBannerUpdate) {
          lastBannerUpdate = updatedAt;
          const v = banner.updatedAt ? banner.updatedAt.getTime() : Date.now();
          const imageUrl = banner.imageData ? `/api/images/banner/hero?v=${v}` : null;
          const promoImageUrl = banner.promoImageData ? `/api/images/banner/promo?v=${v}` : null;
          io.emit('banner-updated', { imageUrl, promoImageUrl, updatedAt: banner.updatedAt });
        }
      }
    } catch (err) {
      // Silently ignore polling errors
    }
  }, 10000);
}

// Start change stream listener after DB connects
setTimeout(setupBannerChangeStream, 2000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
