const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Path to the database file
const dbPath = path.join(__dirname, '..', 'data', 'ru2ya.db');

try {
  // Remove existing database
  if (fs.existsSync(dbPath)) {
    console.log('🗑️  Removing existing database...');
    fs.unlinkSync(dbPath);
  }
  
  // Create data directory if it doesn't exist
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  console.log('🔄 Creating new database with correct schema...');
  
  // Create new database
  const db = new Database(dbPath);
  
  // Create products table with correct schema
  db.exec(`
    CREATE TABLE products (
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
    CREATE TABLE orders (
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
    CREATE TABLE order_items (
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
  
  // Insert default products
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, image, category, featured, bestseller) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertProduct.run('Classic Aviator', 'Timeless aviator sunglasses with premium lenses', 89.99, '/images/aviator.jpg', 'Sunglasses', 1, 1);
  insertProduct.run('Modern Round', 'Contemporary round frames for a sophisticated look', 129.99, '/images/round.jpg', 'Eyeglasses', 1, 1);
  insertProduct.run('Sport Performance', 'Lightweight sports eyewear with UV protection', 149.99, '/images/sport.jpg', 'Sunglasses', 0, 0);
  insertProduct.run('Vintage Square', 'Retro square frames with modern comfort', 99.99, '/images/square.jpg', 'Eyeglasses', 0, 0);
  insertProduct.run('Premium Metal', 'Luxury metal frames with premium materials', 199.99, '/images/metal.jpg', 'Eyeglasses', 1, 0);
  
  // Show created products
  const products = db.prepare('SELECT id, name, featured, bestseller FROM products').all();
  console.log('\n📊 Created products:');
  products.forEach(p => {
    console.log(`  ${p.id}: ${p.name} - Featured: ${p.featured ? 'Yes' : 'No'}, Bestseller: ${p.bestseller ? 'Yes' : 'No'}`);
  });
  
  console.log('\n🎉 Database recreated successfully with correct schema!');
  db.close();
  
} catch (error) {
  console.error('❌ Database recreation failed:', error.message);
  process.exit(1);
}
