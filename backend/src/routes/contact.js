import express from 'express';
import { isMySQLActive, mysqlCreateContact } from '../config/mysql.js';
import Contact from '../models/Contact.js';

const router = express.Router();

// Public: Submit a contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    if (isMySQLActive()) {
      const saved = await mysqlCreateContact({ name, email, phone, subject, message });
      return res.status(201).json({ message: 'Message received', id: saved.id || saved._id });
    }

    try {
      const contact = await Contact.create({ name, email, phone, subject, message, ip: req.ip });
      return res.status(201).json({ message: 'Message received', id: contact._id });
    } catch {
      const saved = await mysqlCreateContact({ name, email, phone, subject, message });
      return res.status(201).json({ message: 'Message received', id: saved.id || saved._id });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
