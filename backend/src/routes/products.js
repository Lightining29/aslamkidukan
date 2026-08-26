import express from 'express';
import Product from '../models/Product.js';
import { enrichProduct } from '../utils/pricing.js';
import { isMySQLActive, mysqlGetProducts, mysqlGetProductBySlug } from '../config/mysql.js';

const router = express.Router();

// Public: active flash sale products
router.get('/flash-sale', async (_req, res) => {
  try {
    if (isMySQLActive()) {
      const mysqlProds = await mysqlGetProducts({ bestseller: true });
      if (mysqlProds && mysqlProds.length > 0) return res.json(mysqlProds);
    }

    try {
      const now = new Date();
      const products = await Product.find({
        flashSale: true,
        flashSalePrice: { $gt: 0 },
        $or: [
          { flashSaleEndsAt: { $gt: now } },
          { flashSaleEndsAt: null },
        ],
      })
        .select('-imageData -imageContentType -images.data')
        .populate('category', 'name slug')
        .sort({ salesCount: -1 });
      return res.json(products.map(enrichProduct));
    } catch {
      const mysqlProds = await mysqlGetProducts({ bestseller: true });
      return res.json(mysqlProds);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, bestseller, limit } = req.query;

    if (isMySQLActive()) {
      const filter = {};
      if (category) filter.category = category;
      if (bestseller === 'true') filter.bestseller = true;
      if (limit) filter.limit = limit;
      const mysqlProds = await mysqlGetProducts(filter);
      if (mysqlProds && mysqlProds.length > 0) {
        return res.json(mysqlProds);
      }
    }

    try {
      const filter = {};
      if (category) filter.category = category;
      if (bestseller === 'true') filter.bestseller = true;

      let query = Product.find(filter)
        .select('-imageData -imageContentType -images.data')
        .populate('category', 'name slug')
        .sort({ salesCount: -1, createdAt: -1 });
      if (limit) query = query.limit(parseInt(limit, 10));

      const products = await query;
      if (products && products.length > 0) {
        return res.json(products.map(enrichProduct));
      }
    } catch {
      // Fallback
    }

    const mysqlProds = await mysqlGetProducts({ category, bestseller: bestseller === 'true', limit });
    return res.json(mysqlProds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    if (isMySQLActive()) {
      const mysqlProd = await mysqlGetProductBySlug(req.params.slug);
      if (mysqlProd) return res.json(mysqlProd);
    }

    try {
      const product = await Product.findOne({ slug: req.params.slug })
        .select('-imageData -imageContentType -images.data')
        .populate('category', 'name slug');
      if (product) return res.json(enrichProduct(product));
    } catch {
      // Fallback
    }

    const mysqlProd = await mysqlGetProductBySlug(req.params.slug);
    if (!mysqlProd) return res.status(404).json({ message: 'Product not found' });
    return res.json(mysqlProd);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
