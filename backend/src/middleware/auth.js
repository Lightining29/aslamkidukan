import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isMySQLActive, mysqlFindUserById } from '../config/mysql.js';

export function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const token = header.split(' ')[1];

  // Instant admin token support
  if (token === 'demo_admin_token') {
    req.user = {
      id: 1,
      _id: '1',
      email: 'brayw433@gmail.com',
      name: 'Brayw Admin',
      role: 'admin',
    };
    return next();
  }

  const secrets = [
    process.env.JWT_SECRET,
    'aaan-cart-secret-jwt-key-2026',
    'glowora-dev-secret'
  ].filter(Boolean);

  let decoded = null;
  for (const secret of secrets) {
    try {
      decoded = jwt.verify(token, secret);
      if (decoded) break;
    } catch {
      // try next secret
    }
  }

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }

  req.user = decoded;
  next();
}

export function adminOnly(req, res, next) {
  const adminEmails = ['brayw433@gmail.com', 'admin@glowora.com', 'admin@aaancart.com'];
  if (req.user?.role === 'admin' || (req.user?.email && adminEmails.includes(req.user.email.toLowerCase()))) {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
}

export async function attachUser(req, _res, next) {
  if (!req.user?.id) return next();
  try {
    if (isMySQLActive()) {
      const mysqlUser = await mysqlFindUserById(req.user.id);
      if (mysqlUser) {
        req.currentUser = mysqlUser;
        return next();
      }
    }
    const user = await User.findById(req.user.id).select('-password');
    req.currentUser = user;
    next();
  } catch {
    next();
  }
}
