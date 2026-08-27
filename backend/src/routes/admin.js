import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  getMySQLPool,
  isMySQLActive,
  mysqlGetProducts,
  mysqlGetProductBySlug,
  mysqlCreateProduct,
  mysqlUpdateProduct,
  mysqlDeleteProduct,
  mysqlGetCategories,
  mysqlCreateCategory,
  mysqlUpdateCategory,
  mysqlDeleteCategory,
  mysqlGetAllOrders,
  mysqlGetOrderById,
  mysqlUpdateOrder,
  mysqlGetContacts,
} from '../config/mysql.js';

const router = express.Router();
router.use(protect, adminOnly);

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ─── 1. ANALYTICS ─────────────────────────────────────────────────── */
router.get('/analytics', async (_req, res) => {
  try {
    const db = getMySQLPool();
    const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) as totalOrders FROM orders');
    const [[{ totalProducts }]] = await db.query('SELECT COUNT(*) as totalProducts FROM products');
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users WHERE role = "user"');
    const [[{ totalRevenue }]] = await db.query('SELECT COALESCE(SUM(totalAmount), 0) as totalRevenue FROM orders WHERE paymentStatus = "paid"');
    const [[{ pendingApproval }]] = await db.query('SELECT COUNT(*) as pendingApproval FROM orders WHERE paymentStatus = "paid" AND orderStatus = "processing"');
    const [recentOrdersRows] = await db.query('SELECT * FROM orders ORDER BY createdAt DESC LIMIT 5');
    const [topProductsRows] = await db.query('SELECT name, price, salesCount as sold, (price * salesCount) as revenue FROM products ORDER BY salesCount DESC LIMIT 5');
    const [lowStockRows] = await db.query('SELECT name, stock as stockQuantity FROM products WHERE stock <= 10 LIMIT 5');

    const recentOrders = recentOrdersRows.map((o) => {
      let items = [];
      try { items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []); } catch {}
      return {
        _id: String(o.id),
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        total: Number(o.totalAmount),
        status: o.paymentStatus === 'paid' ? 'paid' : o.orderStatus,
        createdAt: o.createdAt,
        items,
      };
    });

    res.json({
      totalOrders: totalOrders || 0,
      totalProducts: totalProducts || 0,
      totalUsers: totalUsers || 0,
      totalRevenue: Number(totalRevenue) || 0,
      pendingApproval: pendingApproval || 0,
      recentOrders,
      topProducts: topProductsRows || [],
      lowStock: lowStockRows || [],
    });
  } catch (err) {
    res.json({
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      totalRevenue: 0,
      pendingApproval: 0,
      recentOrders: [],
      topProducts: [],
      lowStock: [],
    });
  }
});

/* ─── 2. PRODUCTS ───────────────────────────────────────────────────── */
router.get('/products', async (req, res) => {
  try {
    const products = await mysqlGetProducts();
    if (req.query.simple === 'true') {
      return res.json(products.map((p) => ({ _id: p._id, id: p.id, name: p.name, slug: p.slug })));
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/products', upload.array('images', 10), async (req, res) => {
  try {
    const {
      name, description, price, originalPrice,
      category, stockQuantity, discountPercent, bestseller, tagline, badge, image, images
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const slug = slugify(name);
    const qty = parseInt(stockQuantity ?? 50, 10);
    
    let imageList = [];
    if (req.files && req.files.length > 0) {
      imageList = req.files.map((f) => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
    } else if (Array.isArray(images) && images.length > 0) {
      imageList = images;
    } else if (image) {
      imageList = [image];
    }

    const primaryImage = imageList[0] || image || '';

    const newProduct = await mysqlCreateProduct({
      name,
      slug,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      categorySlug: typeof category === 'string' ? category : category?.slug || 'home-decor',
      description: description || '',
      tagline: tagline || '',
      badge: badge || '',
      image: primaryImage,
      images: imageList,
      stock: qty,
      discountPercent: parseInt(discountPercent ?? 0, 10),
      bestseller: bestseller === 'true' || bestseller === true,
    });

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/products/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.name) {
      updateData.slug = slugify(updateData.name);
    }
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.stockQuantity !== undefined) updateData.stock = parseInt(updateData.stockQuantity, 10);
    if (updateData.discountPercent !== undefined) updateData.discountPercent = parseInt(updateData.discountPercent, 10);
    if (updateData.bestseller !== undefined) updateData.bestseller = updateData.bestseller === 'true' || updateData.bestseller === true;
    if (updateData.category) {
      updateData.categorySlug = typeof updateData.category === 'string' ? updateData.category : updateData.category?.slug;
      delete updateData.category;
    }

    delete updateData.deleteImageIndex;
    delete updateData.replaceImages;
    delete updateData.stockQuantity;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
      updateData.image = newImages[0];
      updateData.images = newImages;
    }

    const updated = await mysqlUpdateProduct(id, updateData);
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await mysqlDeleteProduct(id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── 3. CATEGORIES ───────────────────────────────────────────────── */
router.get('/categories', async (_req, res) => {
  try {
    const categories = await mysqlGetCategories();
    res.json(categories || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/categories', upload.single('image'), async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const slug = slugify(name);

    let categoryImage = image || '';
    if (req.file) {
      categoryImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const newCat = await mysqlCreateCategory({
      name,
      slug,
      description: description || '',
      image: categoryImage,
    });

    return res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/categories/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const { id } = req.params;

    const updates = {};
    if (name) {
      updates.name = name;
      updates.slug = slugify(name);
    }
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;
    if (req.file) {
      updates.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const updated = await mysqlUpdateCategory(id, updates);
    return res.json(updated || { id, ...updates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlDeleteCategory(id);
    return res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── 4. ORDERS ───────────────────────────────────────────────────── */
router.get('/orders', async (_req, res) => {
  try {
    const orders = await mysqlGetAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const { id } = req.params;

    const updates = {};
    if (status) updates.orderStatus = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const updated = await mysqlUpdateOrder(id, updates);
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── 5. USERS / CUSTOMERS ────────────────────────────────────────── */
router.get('/users', async (_req, res) => {
  try {
    const db = getMySQLPool();
    const [rows] = await db.query('SELECT id, name, email, role, phone, address, city, state, zipCode, isEmailVerified, createdAt FROM users ORDER BY createdAt DESC');
    res.json(rows.map((u) => ({ _id: String(u.id), id: u.id, ...u })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── 6. CONTACTS ─────────────────────────────────────────────────── */
router.get('/contacts', async (_req, res) => {
  try {
    const contacts = await mysqlGetContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
