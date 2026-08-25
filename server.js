import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import compression from 'compression';
import { Server } from 'socket.io';
import Razorpay from 'razorpay';
import crypto from 'crypto';

import { connectDB } from './backend/src/config/database.js';
import { initMySQLDatabase } from './backend/src/config/mysql.js';
import categoryRoutes from './backend/src/routes/categories.js';
import productRoutes from './backend/src/routes/products.js';
import authRoutes from './backend/src/routes/auth.js';
import userRoutes from './backend/src/routes/users.js';
import orderRoutes, { razorpayWebhookHandler, fulfillOrder } from './backend/src/routes/orders.js';
import adminRoutes from './backend/src/routes/admin.js';
import bannerRoutes from './backend/src/routes/banner.js';
import reviewRoutes from './backend/src/routes/reviews.js';
import imageRoutes from './backend/src/routes/images.js';
import contactRoutes from './backend/src/routes/contact.js';
import settingsRoutes from './backend/src/routes/settings.js';
import blogRoutes from './backend/src/routes/blogs.js';
import stockRoutes from './backend/src/routes/stock.js';
import { promoBannersPublic, promoBannersAdmin } from './backend/src/routes/promoBanners.js';
import Banner from './backend/src/models/Banner.js';
import Product from './backend/src/models/Product.js';
import Category from './backend/src/models/Category.js';
import Blog from './backend/src/models/Blog.js';
import Order from './backend/src/models/Order.js';

// Setup directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.IO setup with permissive CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(compression());

// Webhooks
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), razorpayWebhookHandler);
app.post('/razorpay/webhook', express.raw({ type: 'application/json' }), razorpayWebhookHandler);
app.post('/api/razorpay/webhook', express.raw({ type: 'application/json' }), razorpayWebhookHandler);

app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'AAAN Cart API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
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
    if (amount === undefined || amount === null || amount < 100) {
      return res.status(400).json({ message: 'Amount must be at least 100 paise' });
    }

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
    return res.status(500).json({ message: err.message || 'Razorpay order creation failed' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required payment verification fields' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Razorpay API credentials not configured' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature mismatch' });
    }

    try {
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (order && order.status === 'pending_payment') {
        order.status = 'paid';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();
        await fulfillOrder(order);
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

// Robots.txt
app.get('/robots.txt', (_req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: https://www.afshaenterprises.com/sitemap.xml`);
});

// Sitemap.xml
app.get('/sitemap.xml', async (_req, res) => {
  try {
    const domain = 'https://www.afshaenterprises.com';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${domain}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${domain}/contact</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
    xml += `  <url><loc>${domain}/blogs</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch {
    res.status(500).end();
  }
});

// -----------------------------------------------------------------------------
// FRONTEND STATIC SERVING & SPA FALLBACK (Checks all candidate paths)
// -----------------------------------------------------------------------------
const candidateDistPaths = [
  path.join(__dirname, 'frontend/dist'),
  path.join(__dirname, 'backend/public'),
  path.join(__dirname, 'public'),
  path.join(__dirname, 'dist'),
];

let activeStaticPath = candidateDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) || candidateDistPaths[0];

if (fs.existsSync(activeStaticPath)) {
  console.log(`✓ Serving frontend static files from: [${activeStaticPath}]`);
  app.use(express.static(activeStaticPath));
}

// SPA fallback for all customer & admin routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }

  const foundPath = candidateDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html')));
  if (foundPath) {
    return res.sendFile(path.join(foundPath, 'index.html'));
  }

  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>AAAN Cart - 3D Wall Decor</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #0B0F19; color: #F8FAFC; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
        .card { background: #1E293B; padding: 2.5rem; border-radius: 1rem; border: 1px solid #334155; max-width: 480px; }
        h1 { color: #10B981; margin-top: 0; }
        p { color: #94A3B8; line-height: 1.6; }
        code { background: #0F172A; padding: 0.2rem 0.5rem; border-radius: 0.25rem; color: #38BDF8; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>AAAN Cart Server Active</h1>
        <p>Backend API and WebSocket engine are fully operational.</p>
        <p>To view the frontend UI, run <code>npm run build</code> in the frontend folder.</p>
      </div>
    </body>
    </html>
  `);
});

// Database connections (safe failover, never crashes)
connectDB();
initMySQLDatabase();

// Global crash guards to prevent Hostinger 503 error
process.on('uncaughtException', (err) => {
  console.error('Caught uncaughtException:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Hostinger & Passenger compatible listener
server.listen(PORT, () => {
  console.log(`✓ AAAN Cart Fullstack Server running on port ${PORT}`);
});
