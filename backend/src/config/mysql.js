import mysql from 'mysql2/promise';

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
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function initMySQLDatabase() {
  try {
    const dbName = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'aslam_ki_dukan';

    // 1. Initial connection
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
      // Database may already exist or user lacks CREATE DATABASE privileges on shared hosting
    }

    const db = getMySQLPool();

    // 2. Create Users Table
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
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Create Categories Table
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

    // 4. Create Products Table
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
        discountPercent INT DEFAULT 0,
        bestseller BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create Orders Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderNumber VARCHAR(100) UNIQUE NOT NULL,
        userId INT,
        customerName VARCHAR(255),
        customerEmail VARCHAR(255),
        customerPhone VARCHAR(50),
        shippingAddress TEXT,
        totalAmount DECIMAL(10, 2) NOT NULL,
        items LONGTEXT,
        paymentStatus ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        orderStatus ENUM('processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'processing',
        razorpayOrderId VARCHAR(255),
        razorpayPaymentId VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default categories in MySQL if empty
    const [existingCategories] = await db.query('SELECT COUNT(*) as cnt FROM categories');
    if (existingCategories[0].cnt === 0) {
      await db.query(`
        INSERT INTO categories (name, slug, description) VALUES
        ('Plant Decals', 'plant-decals', 'Botanical and lush 3D wall art stickers'),
        ('Butterfly Decals', 'butterfly-decals', 'Vivid realistic 3D holographic butterflies'),
        ('Floral & Flora', 'floral-flora', 'Elegant flower and orchid wall designs')
      `);
      console.log('✓ Seeded default categories in MySQL');
    }

    isConnected = true;
    console.log(`✓ Hostinger MySQL Database Connected & Ready: [${dbName}]`);
  } catch (err) {
    isConnected = false;
    console.warn('MySQL Notice:', err.message);
  }
}

// -----------------------------------------------------------------------------
// MySQL PRODUCT HELPERS
// -----------------------------------------------------------------------------
export async function mysqlGetProducts(filter = {}) {
  const db = getMySQLPool();
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (filter.category) {
    sql += ' AND categorySlug = ?';
    params.push(filter.category);
  }
  if (filter.bestseller) {
    sql += ' AND bestseller = 1';
  }
  sql += ' ORDER BY createdAt DESC';

  const [rows] = await db.query(sql, params);
  return rows.map(formatMySQLProduct);
}

export async function mysqlGetProductBySlug(slug) {
  const db = getMySQLPool();
  const [rows] = await db.query('SELECT * FROM products WHERE slug = ?', [slug]);
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
      name, slug, price, originalPrice || null, categorySlug || 'plant-decals',
      description || '', tagline || '', badge || '', image || '',
      stock || 50, discountPercent || 0, bestseller ? 1 : 0
    ]
  );

  return { id: res.insertId, ...data };
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

  await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
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
    discountPercent: p.discountPercent || 0,
    bestseller: Boolean(p.bestseller),
    inStock: (p.stock || 50) > 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
