import mysql from 'mysql2/promise';

let pool = null;

export function getMySQLPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'aslam_ki_dukan',
      port: Number(process.env.MYSQL_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function initMySQLDatabase() {
  try {
    // 1. Initial connection to create database if it doesn't exist
    const rootConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      port: Number(process.env.MYSQL_PORT) || 3306,
    });

    const dbName = process.env.MYSQL_DATABASE || 'aslam_ki_dukan';
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await rootConnection.end();

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
        photoUrl TEXT,
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
        image TEXT,
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
        image TEXT,
        stock INT DEFAULT 100,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        paymentStatus ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        orderStatus ENUM('processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'processing',
        razorpayOrderId VARCHAR(255),
        razorpayPaymentId VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Ensure default admin and demo user exist in MySQL
    const [existingAdmin] = await db.query('SELECT * FROM users WHERE email = ?', ['admin@glowora.com']);
    if (existingAdmin.length === 0) {
      // In production, bcrypt hash 'admin123'
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['AAAN Admin', 'admin@glowora.com', '$2a$10$wT0lV3zXNqTq8O3zZq8hOuXlQ9Qk6.6kM2Kk4tE8L4Y7v8P0i4lXe', 'admin']
      );
      console.log('✓ MySQL default admin user seeded (admin@glowora.com)');
    }

    console.log(`✓ MySQL Database & Tables initialized successfully: [${dbName}]`);
  } catch (err) {
    console.error('MySQL initialization warning:', err.message);
    console.log('To use local MySQL, ensure MySQL server is running (e.g. XAMPP/WAMP or mysql service).');
  }
}
