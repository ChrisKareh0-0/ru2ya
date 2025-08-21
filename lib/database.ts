import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(path.join(dataDir, 'ru2ya.db'));
    
    // Create products table with correct schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        category TEXT,
        featured BOOLEAN DEFAULT 0,
        bestseller BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create orders table
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customerName TEXT NOT NULL,
        customerEmail TEXT NOT NULL,
        customerPhone TEXT NOT NULL,
        customerAddress TEXT NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId TEXT NOT NULL,
        productId INTEGER NOT NULL,
        productName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders (id),
        FOREIGN KEY (productId) REFERENCES products (id)
      )
    `);

    // Check if products table is empty and insert default data
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    
    if (productCount.count === 0) {
      const insertProduct = db.prepare(`
        INSERT INTO products (name, description, price, image, category, featured, bestseller) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertProduct.run('Classic Aviator', 'Timeless aviator sunglasses with premium lenses', 89.99, '/images/aviator.jpg', 'Sunglasses', 1, 1);
      insertProduct.run('Modern Round', 'Contemporary round frames for a sophisticated look', 129.99, '/images/round.jpg', 'Eyeglasses', 1, 1);
      insertProduct.run('Sport Performance', 'Lightweight sports eyewear with UV protection', 149.99, '/images/sport.jpg', 'Sunglasses', 0, 0);
      insertProduct.run('Vintage Square', 'Retro square frames with modern comfort', 99.99, '/images/square.jpg', 'Eyeglasses', 0, 0);
      insertProduct.run('Premium Metal', 'Luxury metal frames with premium materials', 199.99, '/images/metal.jpg', 'Eyeglasses', 1, 0);
    }
  }
  return db;
}

export { db };
export default getDatabase;
