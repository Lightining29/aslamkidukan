import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Banner from '../models/Banner.js';
import PromoBanner from '../models/PromoBanner.js';
import Contact from '../models/Contact.js';
import Review from '../models/Review.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { enrichProduct } from '../utils/pricing.js';
import {
  isMySQLActive,
  mysqlGetProducts,
  mysqlCreateProduct,
  mysqlUpdateProduct,
  mysqlDeleteProduct,
  mysqlGetCategories,
  mysqlCreateCategory,
  mysqlUpdateCategory,
  mysqlDeleteCategory,
} from '../config/mysql.js';

const router = express.Router();
router.use(protect, adminOnly);

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
  const updatedAt = product?.updatedAt ? new Date(product.updatedAt).getTime() : '';
  return `/api/images/product/${productId}${updatedAt ? `?v=${updatedAt}` : ''}`;
}

/* ─── ANALYTICS ─────────────────────────────────────────────────── */
router.get('/analytics', async (_req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers, revenueAgg, recentOrders, topProducts] =
      await Promise.all([
        Order.countDocuments({ status: { $in: ['paid', 'approved', 'shipped'] } }),
        Product.countDocuments(),
        User.countDocuments({ role: 'user' }),
        Order.aggregate([
          { $match: { status: { $in: ['paid', 'approved', 'shipped'] } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
        Order.aggregate([
          { $match: { status: { $in: ['paid', 'approved', 'shipped'] } } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              name: { $first: '$items.name' },
              sold: { $sum: '$items.quantity' },
              revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            },
          },
          { $sort: { sold: -1 } },
          { $limit: 5 },
        ]),
      ]);

    const pendingApproval = await Order.countDocuments({ status: 'paid' });
    const lowStock = await Product.find({ stockQuantity: { $lte: 10 } })
      .select('name stockQuantity')
      .limit(5);

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingApproval,
      recentOrders,
      topProducts,
      lowStock,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── PRODUCTS ───────────────────────────────────────────────────── */
router.get('/products', async (req, res) => {
  try {
    if (isMySQLActive()) {
      const mysqlProds = await mysqlGetProducts();
      if (mysqlProds && mysqlProds.length > 0) {
        return res.json(mysqlProds);
      }
    }
    if (req.query.simple === 'true') {
      const products = await Product.find({}, 'name slug').sort({ name: 1 });
      return res.json(products);
    }
    const products = await Product.find()
      .select('-imageData -imageContentType -images.data') // never send binary to listing
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
    res.json(products.map(enrichProduct));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product — accepts multipart/form-data with up to 5 "images" files
router.post('/products', upload.array('images', 5), async (req, res) => {
  try {
    const {
      name, description, price, originalPrice,
      category, stockQuantity, discountPercent, bestseller, tagline, badge,
    } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    const slug = slugify(name);
    const qty = parseInt(stockQuantity ?? 50, 10);
    const primaryImg = req.files[0];
    const imageBase64 = `data:${primaryImg.mimetype};base64,${primaryImg.buffer.toString('base64')}`;

    // 1. If MySQL is active, save directly to Hostinger MySQL
    if (isMySQLActive()) {
      try {
        const mysqlProduct = await mysqlCreateProduct({
          name,
          slug,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          categorySlug: typeof category === 'string' ? category : category?.slug || 'plant-decals',
          description,
          tagline: tagline || '',
          badge: badge || '',
          image: imageBase64,
          stock: qty,
          discountPercent: parseInt(discountPercent ?? 0, 10),
          bestseller: bestseller === 'true' || bestseller === true,
        });

        // Also sync to MongoDB if connected
        try {
          const images = req.files.map((f) => ({ data: f.buffer, contentType: f.mimetype }));
          await Product.create({
            name, slug, description,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
            imageData: images[0].data,
            imageContentType: images[0].contentType,
            images, category, stockQuantity: qty,
            discountPercent: parseInt(discountPercent ?? 0, 10),
            bestseller: bestseller === 'true' || bestseller === true,
            inStock: qty > 0,
          });
        } catch {
          // Ignore Mongo error when MySQL succeeds
        }

        return res.status(201).json(mysqlProduct);
      } catch (mysqlErr) {
        console.error('MySQL create product error:', mysqlErr);
      }
    }

    // 2. Fallback MongoDB creation
    const exists = await Product.findOne({ slug }).select('_id');
    if (exists) return res.status(400).json({ message: 'Product with similar name exists' });

    const images = req.files.map((f) => ({ data: f.buffer, contentType: f.mimetype }));
    const product = await Product.create({
      name,
      slug,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      imageData: images[0].data,
      imageContentType: images[0].contentType,
      images,
      category,
      stockQuantity: qty,
      discountPercent: parseInt(discountPercent ?? 0, 10),
      bestseller: bestseller === 'true' || bestseller === true,
      inStock: qty > 0,
    });

    res.status(201).json(enrichProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product — images optional (upload.array, up to 5)
router.put('/products/:id', upload.array('images', 5), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Parse numeric fields sent as form strings
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.stockQuantity !== undefined) updateData.stockQuantity = parseInt(updateData.stockQuantity, 10);
    if (updateData.discountPercent !== undefined) updateData.discountPercent = parseInt(updateData.discountPercent, 10);
    if (updateData.bestseller !== undefined) updateData.bestseller = updateData.bestseller === 'true' || updateData.bestseller === true;

    // Strip image-control fields — they're handled below, not passed to findByIdAndUpdate.
    // deleteImageIndex may arrive as a single string (one value) or an array
    // (multiple repeated form fields); normalize to an array of ints.
    const rawDelete = updateData.deleteImageIndex;
    const deleteIndices = []
      .concat(rawDelete || [])
      .map((v) => parseInt(v, 10))
      .filter((v) => !Number.isNaN(v));
    delete updateData.deleteImageIndex;
    delete updateData.replaceImages;
    delete updateData.images;

    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Apply text fields
    Object.entries(updateData).forEach(([k, v]) => { product.set(k, v); });

    // --- Image handling ---
    // Backfill images[] from the legacy primary if it was never set
    // (e.g. products created before multi-image support).
    if ((!product.images || product.images.length === 0) && product.imageData) {
      product.images = [{ data: product.imageData, contentType: product.imageContentType }];
    }

    // Case A: new files uploaded → replace the whole set.
    if (req.files && req.files.length > 0) {
      product.images = req.files.map((f) => ({ data: f.buffer, contentType: f.mimetype }));
    }
    // Case B: one or more image removals (no new files). Sort descending so
    // splicing earlier indices doesn't shift later ones mid-loop.
    else if (deleteIndices.length > 0) {
      const toRemove = [...new Set(deleteIndices)].sort((a, b) => b - a);
      for (const idx of toRemove) {
        if (product.images && idx >= 0 && idx < product.images.length) {
          product.images.splice(idx, 1);
        }
      }
    }

    // Enforce the 5-image cap.
    if (product.images && product.images.length > 5) {
      return res.status(400).json({ message: 'A product can have at most 5 images' });
    }

    // Re-mirror primary (images[0]) into the legacy fields so existing
    // product.image consumers keep working. Clears them if no images remain.
    if (product.images && product.images.length > 0) {
      product.imageData = product.images[0].data;
      product.imageContentType = product.images[0].contentType;
    } else {
      product.imageData = undefined;
      product.imageContentType = undefined;
    }

    if (product.stockQuantity !== undefined) {
      product.inStock = product.stockQuantity > 0;
    }

    await product.save();
    res.json(enrichProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/products/:id/stock', async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    if (stockQuantity === undefined || stockQuantity < 0) {
      return res.status(400).json({ message: 'Valid stock quantity required' });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stockQuantity, inStock: stockQuantity > 0 },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(enrichProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/products/:id/discount', async (req, res) => {
  try {
    const { discountPercent } = req.body;
    if (discountPercent === undefined || discountPercent < 0 || discountPercent > 100) {
      return res.status(400).json({ message: 'Discount must be 0–100' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (discountPercent > 0 && !product.originalPrice) {
      product.originalPrice = product.price;
    }
    product.discountPercent = discountPercent;
    await product.save();
    res.json(enrichProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    if (isMySQLActive()) {
      await mysqlDeleteProduct(req.params.id);
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product && !isMySQLActive()) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── CATEGORIES ─────────────────────────────────────────────────── */
router.get('/categories', async (_req, res) => {
  try {
    const mysqlCats = await mysqlGetCategories();
    if (mysqlCats && mysqlCats.length > 0) return res.json(mysqlCats);

    if (mongoose.connection?.readyState === 1) {
      const categories = await Category.find().sort({ name: 1 });
      const mapped = categories.map((c) => {
        const obj = c.toObject();
        const v = c.updatedAt ? c.updatedAt.getTime() : Date.now();
        obj.imageUrl = c.imageData ? `/api/images/category/${c._id}?v=${v}` : (c.image || null);
        delete obj.imageData;
        delete obj.imageContentType;
        return obj;
      });
      return res.json(mapped);
    }
    return res.json(mysqlCats || []);
  } catch (err) {
    const mysqlCats = await mysqlGetCategories().catch(() => []);
    res.json(mysqlCats || []);
  }
});

// Create category (accepts optional image upload)
router.post('/categories', upload.single('image'), async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const slug = slugify(name);

    // 1. Save directly to MySQL
    let newCat = null;
    try {
      newCat = await mysqlCreateCategory({
        name,
        slug,
        description: description || '',
        image: image || (req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : '')
      });
    } catch (mysqlErr) {
      console.warn('MySQL category insert notice:', mysqlErr.message);
    }

    // 2. Sync to MongoDB only if active
    if (mongoose.connection?.readyState === 1) {
      try {
        const exists = await Category.findOne({ slug });
        if (!exists) {
          const category = new Category({ name, slug, description });
          if (req.file) {
            category.imageData = req.file.buffer;
            category.imageContentType = req.file.mimetype;
          }
          await category.save();
        }
      } catch {
        // Mongo sync error ignored
      }
    }

    return res.status(201).json(newCat || { id: Date.now(), _id: String(Date.now()), name, slug, description: description || '' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update category
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

    let updated = null;
    try {
      updated = await mysqlUpdateCategory(id, updates);
    } catch {
      // MySQL error
    }

    if (mongoose.connection?.readyState === 1) {
      try {
        const category = await Category.findById(id);
        if (category) {
          if (name) {
            category.name = name;
            category.slug = slugify(name);
          }
          if (description !== undefined) category.description = description;
          if (req.file) {
            category.imageData = req.file.buffer;
            category.imageContentType = req.file.mimetype;
          }
          category.updatedAt = new Date();
          await category.save();
        }
      } catch {
        // Mongo error
      }
    }

    return res.json(updated || { id, ...updates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await mysqlDeleteCategory(id);
    } catch {
      // MySQL error
    }

    if (mongoose.connection?.readyState === 1) {
      try {
        await Category.findByIdAndDelete(id);
      } catch {
        // Mongo error
      }
    }

    return res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── ORDERS ─────────────────────────────────────────────────────── */
router.get('/orders', async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'updatedAt')
      .sort({ createdAt: -1 });

    res.json(orders.map((order) => {
      const obj = order.toObject();
      obj.items = (obj.items || []).map((item) => ({
        ...item,
        image: item.image || getProductImageUrl(item.product),
      }));
      return obj;
    }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/orders/offline', async (req, res) => {
  try {
    const { items, paymentMethod, customerName, customerPhone, customerEmail } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }
    if (!paymentMethod || !['cash', 'UPI'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Valid payment method (cash/UPI) is required' });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: item.price ?? product.price,
        quantity: item.quantity,
        image: getProductImageUrl(product),
      });

      subtotal += (item.price ?? product.price) * item.quantity;

      // Decrement stock
      product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
      product.inStock = product.stockQuantity > 0;
      await product.save();
    }

    const order = await Order.create({
      items: orderItems,
      subtotal,
      total: subtotal,
      status: 'paid', // Offline sales are paid immediately
      paymentMethod,
      shippingAddress: {
        fullName: customerName || 'Walk-in Customer',
        phone: customerPhone || '',
        email: customerEmail || '',
        address: 'Offline Sale (In-Store)',
        city: 'Walk-in',
      },
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/orders/:id/approve', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'paid') {
      return res.status(400).json({ message: 'Only paid orders can be approved' });
    }
    order.status = 'approved';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/orders/:id/ship', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved orders can be shipped' });
    }
    order.status = 'shipped';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── CONTACTS ─────────────────────────────────────────────────── */
router.get('/contacts', async (_req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/contacts/:id/read', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    contact.read = true;
    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── BANNER ─────────────────────────────────────────────────────── */
function bannerImageUrls(banner) {
  const v = banner.updatedAt ? banner.updatedAt.getTime() : Date.now();
  return {
    imageUrl:      banner.imageContentType      ? `/api/images/banner/hero?v=${v}`  : null,
    promoImageUrl: banner.promoImageContentType ? `/api/images/banner/promo?v=${v}` : null,
  };
}

router.get('/banner', async (_req, res) => {
  try {
    let banner = await Banner.findOne({ singleton: true }).select('-imageData -promoImageData');
    if (!banner) banner = await Banner.create({ singleton: true });
    const obj = banner.toObject();
    Object.assign(obj, bannerImageUrls(banner));
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update banner — accepts multipart/form-data with optional "image" and "promoImage" files
router.put(
  '/banner',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'promoImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Debug: log incoming files (helps diagnose missing uploads/file size issues)
      console.log('Admin banner upload - files:', Object.keys(req.files || {}).reduce((acc, k) => {
        const f = req.files[k] && req.files[k][0];
        acc[k] = f ? { originalname: f.originalname, size: f.size, mimetype: f.mimetype } : null;
        return acc;
      }, {}));

      const textFields = { ...req.body };
      // Remove any accidental buffer-related keys from body
      delete textFields.imageData;
      delete textFields.promoImageData;

      // Find or create banner document and assign fields so Mongoose handles Buffers/timestamps correctly
      let banner = await Banner.findOne({ singleton: true });
      if (!banner) banner = new Banner({ singleton: true });

      // Apply text fields
      Object.entries(textFields).forEach(([k, v]) => {
        // avoid setting empty string values for binary fields
        banner[k] = v;
      });

      if (req.files?.image?.[0]) {
        banner.imageData = req.files.image[0].buffer;
        banner.imageContentType = req.files.image[0].mimetype;
      }
      if (req.files?.promoImage?.[0]) {
        banner.promoImageData = req.files.promoImage[0].buffer;
        banner.promoImageContentType = req.files.promoImage[0].mimetype;
      }

      // Ensure updatedAt changes to bust caches
      banner.updatedAt = new Date();

      await banner.save();

      // Build response without binary data
      const obj = banner.toObject();
      delete obj.imageData;
      delete obj.promoImageData;
      Object.assign(obj, bannerImageUrls(banner));
      res.json(obj);
    } catch (err) {
      console.error('Failed saving banner:', err);
      res.status(500).json({ message: err.message });
    }
  }
);

/* ─── FLASH SALE ─────────────────────────────────────────────────── */

// GET all products with their flash sale status
router.get('/flash-sale', async (_req, res) => {
  try {
    const products = await Product.find()
      .select('-imageData -imageContentType -images.data')
      .populate('category', 'name slug')
      .sort({ flashSale: -1, salesCount: -1 });
    res.json(products.map(enrichProduct));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH — enable/update flash sale on a product
router.patch('/flash-sale/:id', async (req, res) => {
  try {
    const { flashSale, flashSalePrice, flashSaleEndsAt } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (flashSale !== undefined) product.flashSale = Boolean(flashSale);
    if (flashSalePrice !== undefined) product.flashSalePrice = parseFloat(flashSalePrice);
    if (flashSaleEndsAt !== undefined) {
      product.flashSaleEndsAt = flashSaleEndsAt ? new Date(flashSaleEndsAt) : null;
    }
    await product.save();
    res.json(enrichProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE — remove flash sale from a product
router.delete('/flash-sale/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.flashSale = false;
    product.flashSalePrice = undefined;
    product.flashSaleEndsAt = undefined;
    await product.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── REVIEWS ───────────────────────────────────────────────────── */
// Admin list of all reviews (newest first), with product name populated.
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name slug')
      .sort({ createdAt: -1 });
    res.json(
      reviews.map((r) => {
        const obj = r.toObject();
        obj.photos = (obj.photos || []).map((_, i) => `/api/images/review/${obj._id}/${i}`);
        return obj;
      })
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin delete a review (recomputes product rating via model hook).
router.delete('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── PROMO BANNERS ──────────────────────────────────────────────── */

// List all promo banners (admin sees all, including inactive)
router.get('/promo-banners', async (_req, res) => {
  try {
    const banners = await PromoBanner.find()
      .select('-imageData -imageContentType')
      .sort({ sortOrder: 1, createdAt: 1 });
    const mapped = banners.map((b) => {
      const obj = b.toObject();
      const v = b.updatedAt ? b.updatedAt.getTime() : Date.now();
      obj.imageUrl = `/api/images/promo-banner/${b._id}?v=${v}`;
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new promo banner (requires image upload)
router.post('/promo-banners', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Banner image is required' });
    const { altText, linkType, linkValue, position, sortOrder, active } = req.body;

    const banner = await PromoBanner.create({
      imageData:        req.file.buffer,
      imageContentType: req.file.mimetype,
      altText:   altText   || '',
      linkType:  linkType  || 'none',
      linkValue: linkValue || '',
      position:  position  || 'below_categories',
      sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
      active:    active !== undefined ? active !== 'false' : true,
    });

    const obj = banner.toObject();
    delete obj.imageData;
    delete obj.imageContentType;
    const v = banner.updatedAt ? banner.updatedAt.getTime() : Date.now();
    obj.imageUrl = `/api/images/promo-banner/${banner._id}?v=${v}`;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a promo banner (image optional)
router.put('/promo-banners/:id', upload.single('image'), async (req, res) => {
  try {
    const banner = await PromoBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    const { altText, linkType, linkValue, position, sortOrder, active } = req.body;
    if (altText   !== undefined) banner.altText   = altText;
    if (linkType  !== undefined) banner.linkType  = linkType;
    if (linkValue !== undefined) banner.linkValue = linkValue;
    if (position  !== undefined) banner.position  = position;
    if (sortOrder !== undefined) banner.sortOrder = parseInt(sortOrder, 10);
    if (active    !== undefined) banner.active    = active !== 'false';
    if (req.file) {
      banner.imageData        = req.file.buffer;
      banner.imageContentType = req.file.mimetype;
    }
    banner.updatedAt = new Date();
    await banner.save();

    const obj = banner.toObject();
    delete obj.imageData;
    delete obj.imageContentType;
    const v = banner.updatedAt.getTime();
    obj.imageUrl = `/api/images/promo-banner/${banner._id}?v=${v}`;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a promo banner
router.delete('/promo-banners/:id', async (req, res) => {
  try {
    const banner = await PromoBanner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
