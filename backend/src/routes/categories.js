import express from 'express';
import { isMySQLActive, mysqlGetCategories, mysqlCreateCategory } from '../config/mysql.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    if (isMySQLActive()) {
      const mysqlCats = await mysqlGetCategories();
      if (mysqlCats && mysqlCats.length > 0) {
        return res.json(mysqlCats);
      }
    }

    try {
      const categories = await Category.find().select('-imageData -imageContentType');
      return res.json(categories);
    } catch {
      const mysqlCats = await mysqlGetCategories();
      return res.json(mysqlCats);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    if (isMySQLActive()) {
      const mysqlCats = await mysqlGetCategories();
      const cat = mysqlCats.find((c) => c.slug === req.params.slug);
      if (cat) return res.json(cat);
    }

    try {
      const category = await Category.findOne({ slug: req.params.slug })
        .select('-imageData -imageContentType');
      if (category) return res.json(category);
    } catch {
      // Fallback
    }

    const mysqlCats = await mysqlGetCategories();
    const cat = mysqlCats.find((c) => c.slug === req.params.slug);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    return res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
