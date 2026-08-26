import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

let pool = null;
let isConnected = false;

export function isMySQLActive() {
  return isConnected && pool !== null;
}

export function getMySQLPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
      user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
      password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'aslam_ki_dukan',
      port: Number(process.env.MYSQL_PORT || process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}

export async function initMySQLDatabase() {
  try {
    const dbName = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'aslam_ki_dukan';

    // 1. Initial connection (attempt database creation if privileges exist)
    try {
      const rootConnection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
        user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
        password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
        port: Number(process.env.MYSQL_PORT || process.env.DB_PORT) || 3306,
      });
      await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await rootConnection.end();
    } catch {
      // Database already exists or user lacks CREATE DATABASE privileges on shared hosting
    }

    const db = getMySQLPool();

    // 2. Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        phone VARCHAR(50) DEFAULT '',
        address TEXT,
        city VARCHAR(100) DEFAULT '',
        state VARCHAR(100) DEFAULT '',
        zipCode VARCHAR(20) DEFAULT '',
        photoUrl LONGTEXT,
        otpHash VARCHAR(255) DEFAULT NULL,
        otpExpires DATETIME DEFAULT NULL,
        otpCooldownUntil DATETIME DEFAULT NULL,
        isEmailVerified BOOLEAN DEFAULT FALSE,
        resetPasswordToken VARCHAR(255) DEFAULT NULL,
        resetPasswordExpires DATETIME DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Categories Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Products Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        originalPrice DECIMAL(10, 2),
        categorySlug VARCHAR(255),
        description TEXT,
        tagline VARCHAR(255),
        badge VARCHAR(100),
        image LONGTEXT,
        stock INT DEFAULT 100,
        salesCount INT DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 4.9,
        reviewCount INT DEFAULT 24,
        discountPercent INT DEFAULT 0,
        bestseller BOOLEAN DEFAULT FALSE,
        flashSale BOOLEAN DEFAULT FALSE,
        flashSalePrice DECIMAL(10, 2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Orders Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderNumber VARCHAR(100) UNIQUE NOT NULL,
        userId INT DEFAULT NULL,
        customerName VARCHAR(255),
        customerEmail VARCHAR(255),
        customerPhone VARCHAR(50),
        shippingAddress TEXT,
        subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        totalAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        items LONGTEXT,
        paymentStatus ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        orderStatus ENUM('processing', 'paid', 'approved', 'shipped', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'processing',
        razorpayOrderId VARCHAR(255),
        razorpayPaymentId VARCHAR(255),
        razorpaySignature VARCHAR(255),
        receiptSent BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Contacts / Inquiries Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        subject VARCHAR(255) DEFAULT '',
        message TEXT NOT NULL,
        status ENUM('new', 'in_progress', 'resolved') DEFAULT 'new',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Reviews Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productId VARCHAR(255) NOT NULL,
        userName VARCHAR(255) NOT NULL,
        userEmail VARCHAR(255) DEFAULT '',
        rating INT NOT NULL DEFAULT 5,
        comment TEXT NOT NULL,
        verified BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Blogs Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        metaDescription TEXT,
        content LONGTEXT NOT NULL,
        author VARCHAR(255) DEFAULT 'AAAN Cart',
        image LONGTEXT,
        tags VARCHAR(255) DEFAULT '',
        publishedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Promo Banners Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS promo_banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) DEFAULT '',
        discountText VARCHAR(100) DEFAULT '',
        couponCode VARCHAR(50) DEFAULT '',
        active BOOLEAN DEFAULT TRUE,
        image LONGTEXT,
        linkUrl VARCHAR(255) DEFAULT '/shop',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default categories if empty
    const [existingCategories] = await db.query('SELECT COUNT(*) as cnt FROM categories');
    if (existingCategories[0].cnt === 0) {
      await db.query(`
        INSERT INTO categories (name, slug, description, image) VALUES
        ('Botanical Plants', 'botanical', 'Lush 3D Monstera, Palm, and Botanical wall decals', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80'),
        ('3D Wall Niches', 'niches', 'Optical illusion acrylic recessed wall niche decor', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop&q=80'),
        ('3D Butterflies', 'butterflies', 'Vivid realistic metallic & holographic 3D butterfly wall sets', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&auto=format&fit=crop&q=80'),
        ('Geometric Art', 'geometric', 'Modern honeycomb and geometric acrylic mirror decals', 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=500&auto=format&fit=crop&q=80')
      `);
      console.log('✓ Seeded default 3D wall art categories in MySQL');
    }

    // Seed default 3D products if empty
    const [existingProducts] = await db.query('SELECT COUNT(*) as cnt FROM products');
    if (existingProducts[0].cnt === 0) {
      await db.query(`
        INSERT INTO products 
        (name, slug, price, originalPrice, categorySlug, description, tagline, badge, image, stock, discountPercent, bestseller, rating, reviewCount)
        VALUES
        ('Botanical Monstera 3D Wall Niche', 'botanical-monstera-3d-wall-niche', 499.00, 899.00, 'botanical', 'Hyper-realistic 3D optical illusion recessed monstera wall niche decal. Precision acrylic adhesive for residue-free mounting.', 'Best Selling 3D Wall Art', 'Bestseller', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80', 100, 44, 1, 4.9, 128),
        ('Acrylic Mirror Arch Niche', 'acrylic-mirror-arch-niche', 599.00, 1099.00, 'niches', 'Elegant arched 3D acrylic illusion niche with reflective mirror depth and botanical shelf styling.', 'Modern Luxury Decor', 'Popular', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop&q=80', 80, 45, 1, 4.8, 94),
        ('3D Metallic Butterfly Set (12 Pcs)', '3d-metallic-butterfly-set-12pcs', 349.00, 699.00, 'butterflies', 'Set of 12 multi-dimensional metallic butterfly wall decals in golden, rose gold and iridescent silver.', '3D Shimmering Wings', 'Hot Drop', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&auto=format&fit=crop&q=80', 150, 50, 1, 5.0, 210),
        ('Emerald Leaf Shelf Decal', 'emerald-leaf-shelf-decal', 449.00, 799.00, 'botanical', 'Lush hanging emerald leaf decal designed to sit over floating shelves or bedside headboards.', 'Natural Green Aesthetic', 'Top Rated', 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=500&auto=format&fit=crop&q=80', 95, 43, 0, 4.7, 76),
        ('Geometric 3D Hexagon Decal', 'modern-geometric-3d-hexagon-panels', 649.00, 1199.00, 'geometric', 'Set of 10 modern honeycomb acrylic mirror panels for living room and bedroom accent walls.', 'Minimalist Architecture', 'New', 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=500&auto=format&fit=crop&q=80', 70, 45, 0, 4.9, 142),
        ('Golden Sunburst Acrylic Wall Art', 'golden-sunburst-acrylic-wall-art', 799.00, 1499.00, 'niches', 'Stunning golden sunburst optical art centerpiece crafted from laser-cut mirror acrylic.', 'Statement Piece', 'VIP Choice', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80', 50, 46, 1, 4.9, 88)
      `);
      console.log('✓ Seeded default 3D Wall Art products in MySQL');
    }

    // Seed default admin user if empty
    const [existingUsers] = await db.query('SELECT COUNT(*) as cnt FROM users');
    if (existingUsers[0].cnt === 0) {
      const hashedAdminPassword = await bcrypt.hash('admin123456', 10);
      await db.query(`
        INSERT INTO users (name, email, password, role, isEmailVerified)
        VALUES ('Admin', 'admin@glowora.com', ?, 'admin', 1)
      `, [hashedAdminPassword]);
      console.log('✓ Seeded default Admin user in MySQL');
    }

    isConnected = true;
    console.log(`✓ Hostinger MySQL Database Connected & Fully Initialized: [${dbName}]`);
  } catch (err) {
    isConnected = false;
    console.warn('MySQL Notice:', err.message);
  }
}

// -----------------------------------------------------------------------------
// 1. PRODUCTS QUERIES
// -----------------------------------------------------------------------------
export async function mysqlGetProducts(filter = {}) {
  const db = getMySQLPool();
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (filter.category) {
    sql += ' AND categorySlug = ?';
    params.push(filter.category);
  }
  if (filter.bestseller === true || filter.bestseller === 'true') {
    sql += ' AND bestseller = 1';
  }
  if (filter.flashSale === true || filter.flashSale === 'true') {
    sql += ' AND flashSale = 1';
  }
  sql += ' ORDER BY createdAt DESC';

  if (filter.limit) {
    sql += ' LIMIT ?';
    params.push(parseInt(filter.limit, 10));
  }

  const [rows] = await db.query(sql, params);
  return rows.map(formatMySQLProduct);
}

export async function mysqlGetProductBySlug(slug) {
  const db = getMySQLPool();
  const [rows] = await db.query('SELECT * FROM products WHERE slug = ? OR id = ?', [slug, slug]);
  if (rows.length === 0) return null;
  return formatMySQLProduct(rows[0]);
}

export async function mysqlCreateProduct(data) {
  const db = getMySQLPool();
  const {
    name, slug, price, originalPrice, categorySlug,
    description, tagline, badge, image, stock, discountPercent, bestseller,
  } = data;

  const [res] = await db.query(
    `INSERT INTO products 
      (name, slug, price, originalPrice, categorySlug, description, tagline, badge, image, stock, discountPercent, bestseller)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name, slug, price, originalPrice || null, categorySlug || 'botanical',
      description || '', tagline || '', badge || '', image || '',
      stock || 50, discountPercent || 0, bestseller ? 1 : 0
    ]
  );

  return { id: res.insertId, _id: String(res.insertId), ...data };
}

export async function mysqlUpdateProduct(id, data) {
  const db = getMySQLPool();
  const fields = [];
  const params = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== 'id' && key !== '_id') {
      fields.push(`\`${key}\` = ?`);
      params.push(value);
    }
  }

  if (fields.length === 0) return null;
  params.push(id);

  await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ? OR slug = ?`, params);
  const [rows] = await db.query('SELECT * FROM products WHERE id = ? OR slug = ?', [id, id]);
  return rows.length ? formatMySQLProduct(rows[0]) : null;
}

export async function mysqlDeleteProduct(id) {
  const db = getMySQLPool();
  const [res] = await db.query('DELETE FROM products WHERE id = ? OR slug = ?', [id, id]);
  return res.affectedRows > 0;
}

function formatMySQLProduct(p) {
  return {
    _id: String(p.id),
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    category: { slug: p.categorySlug, name: p.categorySlug?.replace(/-/g, ' ').toUpperCase() },
    categorySlug: p.categorySlug,
    description: p.description,
    tagline: p.tagline,
    badge: p.badge,
    imageUrl: p.image || `/api/images/product/${p.id}`,
    image: p.image,
    stockQuantity: p.stock || 50,
    salesCount: p.salesCount || 0,
    rating: Number(p.rating || 4.9),
    reviewCount: Number(p.reviewCount || 24),
    discountPercent: p.discountPercent || 0,
    bestseller: Boolean(p.bestseller),
    flashSale: Boolean(p.flashSale),
    flashSalePrice: Number(p.flashSalePrice || 0),
    inStock: (p.stock || 50) > 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// -----------------------------------------------------------------------------
// 2. CATEGORIES QUERIES
// -----------------------------------------------------------------------------
export async function mysqlGetCategories() {
  const db = getMySQLPool();
  const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
  return rows.map((c) => ({
    _id: String(c.id),
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    createdAt: c.createdAt,
  }));
}

export async function mysqlCreateCategory(data) {
  const db = getMySQLPool();
  const { name, slug, description, image } = data;
  const [res] = await db.query(
    'INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)',
    [name, slug, description || '', image || '']
  );
  return { id: res.insertId, _id: String(res.insertId), ...data };
}

export async function mysqlUpdateCategory(id, data) {
  const db = getMySQLPool();
  const fields = [];
  const params = [];

  for (const [k, v] of Object.entries(data)) {
    if (k !== 'id' && k !== '_id') {
      fields.push(`\`${k}\` = ?`);
      params.push(v);
    }
  }
  if (fields.length === 0) return null;
  params.push(id);
  await db.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ? OR slug = ?`, params);
  const [rows] = await db.query('SELECT * FROM categories WHERE id = ? OR slug = ?', [id, id]);
  return rows.length ? rows[0] : null;
}

export async function mysqlDeleteCategory(id) {
  const db = getMySQLPool();
  const [res] = await db.query('DELETE FROM categories WHERE id = ? OR slug = ?', [id, id]);
  return res.affectedRows > 0;
}

// -----------------------------------------------------------------------------
// 3. USERS & AUTH QUERIES
// -----------------------------------------------------------------------------
export async function mysqlFindUserByEmail(email) {
  const db = getMySQLPool();
  const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
  if (rows.length === 0) return null;
  return formatMySQLUser(rows[0]);
}

export async function mysqlFindUserById(id) {
  const db = getMySQLPool();
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return formatMySQLUser(rows[0]);
}

export async function mysqlCreateUser(data) {
  const db = getMySQLPool();
  const { name, email, password, role = 'user', phone = '', address = '', city = '', state = '', zipCode = '', photoUrl = '', isEmailVerified = false } = data;
  const [res] = await db.query(
    `INSERT INTO users (name, email, password, role, phone, address, city, state, zipCode, photoUrl, isEmailVerified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email.toLowerCase(), password, role, phone, address, city, state, zipCode, photoUrl, isEmailVerified ? 1 : 0]
  );
  return mysqlFindUserById(res.insertId);
}

export async function mysqlUpdateUser(id, updates) {
  const db = getMySQLPool();
  const fields = [];
  const params = [];

  for (const [k, v] of Object.entries(updates)) {
    if (k !== 'id' && k !== '_id') {
      fields.push(`\`${k}\` = ?`);
      params.push(v);
    }
  }

  if (fields.length === 0) return mysqlFindUserById(id);
  params.push(id);

  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  return mysqlFindUserById(id);
}

function formatMySQLUser(u) {
  return {
    _id: String(u.id),
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    role: u.role || 'user',
    phone: u.phone || '',
    address: u.address || '',
    city: u.city || '',
    state: u.state || '',
    zipCode: u.zipCode || '',
    photoUrl: u.photoUrl || null,
    isEmailVerified: Boolean(u.isEmailVerified),
    otpHash: u.otpHash,
    otpExpires: u.otpExpires,
    otpCooldownUntil: u.otpCooldownUntil,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

// -----------------------------------------------------------------------------
// 4. ORDERS QUERIES
// -----------------------------------------------------------------------------
export async function mysqlCreateOrder(data) {
  const db = getMySQLPool();
  const {
    orderNumber, userId, customerName, customerEmail, customerPhone,
    shippingAddress, subtotal, totalAmount, items, razorpayOrderId
  } = data;

  const [res] = await db.query(
    `INSERT INTO orders 
      (orderNumber, userId, customerName, customerEmail, customerPhone, shippingAddress, subtotal, totalAmount, items, paymentStatus, orderStatus, razorpayOrderId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'processing', ?)`,
    [
      orderNumber,
      userId || null,
      customerName || '',
      customerEmail || '',
      customerPhone || '',
      typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : (shippingAddress || ''),
      subtotal || 0,
      totalAmount || 0,
      typeof items === 'object' ? JSON.stringify(items) : (items || '[]'),
      razorpayOrderId || null
    ]
  );

  return mysqlGetOrderById(res.insertId);
}

export async function mysqlGetOrderById(id) {
  const db = getMySQLPool();
  const [rows] = await db.query('SELECT * FROM orders WHERE id = ? OR orderNumber = ?', [id, id]);
  if (rows.length === 0) return null;
  return formatMySQLOrder(rows[0]);
}

export async function mysqlGetOrderByRazorpayId(razorpayOrderId) {
  const db = getMySQLPool();
  const [rows] = await db.query('SELECT * FROM orders WHERE razorpayOrderId = ?', [razorpayOrderId]);
  if (rows.length === 0) return null;
  return formatMySQLOrder(rows[0]);
}

export async function mysqlGetOrdersByUserId(userId) {
  const db = getMySQLPool();
  const [rows] = await db.query('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [userId]);
  return rows.map(formatMySQLOrder);
}

export async function mysqlGetAllOrders() {
  const db = getMySQLPool();
  const [rows] = await db.query('SELECT * FROM orders ORDER BY createdAt DESC');
  return rows.map(formatMySQLOrder);
}

export async function mysqlUpdateOrder(id, updates) {
  const db = getMySQLPool();
  const fields = [];
  const params = [];

  for (const [k, v] of Object.entries(updates)) {
    if (k !== 'id' && k !== '_id') {
      fields.push(`\`${k}\` = ?`);
      params.push(typeof v === 'object' ? JSON.stringify(v) : v);
    }
  }

  if (fields.length === 0) return mysqlGetOrderById(id);
  params.push(id);

  await db.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ? OR orderNumber = ? OR razorpayOrderId = ?`, params);
  return mysqlGetOrderById(id);
}

function formatMySQLOrder(o) {
  let parsedItems = [];
  try {
    parsedItems = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
  } catch {
    parsedItems = [];
  }

  let parsedAddress = {};
  try {
    parsedAddress = typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : (o.shippingAddress || {});
  } catch {
    parsedAddress = { address: o.shippingAddress };
  }

  return {
    _id: String(o.id),
    id: o.id,
    orderNumber: o.orderNumber,
    user: o.userId ? { _id: String(o.userId), name: o.customerName, email: o.customerEmail } : null,
    userId: o.userId,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    shippingAddress: parsedAddress,
    items: parsedItems,
    subtotal: Number(o.subtotal || o.totalAmount),
    total: Number(o.totalAmount),
    totalAmount: Number(o.totalAmount),
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    status: o.paymentStatus === 'paid' ? 'paid' : (o.orderStatus || 'pending_payment'),
    razorpayOrderId: o.razorpayOrderId,
    razorpayPaymentId: o.razorpayPaymentId,
    razorpaySignature: o.razorpaySignature,
    receiptSent: Boolean(o.receiptSent),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

// -----------------------------------------------------------------------------
// 5. CONTACTS / INQUIRIES QUERIES
// -----------------------------------------------------------------------------
export async function mysqlCreateContact(data) {
  const db = getMySQLPool();
  const { name, email, phone, subject, message } = data;
  const [res] = await db.query(
    'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone || '', subject || 'Inquiry', message]
  );
  return { id: res.insertId, _id: String(res.insertId), ...data };
}

export async function mysqlGetContacts() {
  const db = getMySQLPool();
  const [rows] = await db.query('SELECT * FROM contacts ORDER BY createdAt DESC');
  return rows.map((c) => ({
    _id: String(c.id),
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    subject: c.subject,
    message: c.message,
    status: c.status,
    createdAt: c.createdAt,
  }));
}
