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
      if (mysqlProds.length > 0) return res.json(mysqlProds);
    }

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
    res.json(products.map(enrichProduct));
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
      const mysqlProds = await mysqlGetProducts(filter);
      if (mysqlProds && mysqlProds.length > 0) {
        return res.json(limit ? mysqlProds.slice(0, parseInt(limit, 10)) : mysqlProds);
      }
    }

    const filter = {};
    if (category) filter.category = category;
    if (bestseller === 'true') filter.bestseller = true;

    let query = Product.find(filter)
      .select('-imageData -imageContentType -images.data')
      .populate('category', 'name slug')
      .sort({ salesCount: -1, createdAt: -1 });
    if (limit) query = query.limit(parseInt(limit, 10));

    const products = await query;
    res.json(products.map(enrichProduct));
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

    const product = await Product.findOne({ slug: req.params.slug })
      .select('-imageData -imageContentType -images.data')
      .populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(enrichProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
