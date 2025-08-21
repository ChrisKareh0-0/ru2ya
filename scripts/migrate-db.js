const Database = require('better-sqlite3');
const path = require('path');

// Path to the database file
const dbPath = path.join(__dirname, '..', 'data', 'ru2ya.db');

try {
  // Open the database
  const db = new Database(dbPath);
  
  console.log('🔄 Starting database migration...');
  
  // Check if bestseller column exists
  const tableInfo = db.prepare("PRAGMA table_info(products)").all();
  const hasBestseller = tableInfo.some(col => col.name === 'bestseller');
  
  if (!hasBestseller) {
    console.log('📝 Adding bestseller column to products table...');
    
    // Add bestseller column
    db.exec('ALTER TABLE products ADD COLUMN bestseller BOOLEAN DEFAULT 0');
    
    // Update existing products to have some bestsellers
    db.exec(`
      UPDATE products 
      SET bestseller = 1 
      WHERE featured = 1 
      LIMIT 2
    `);
    
    console.log('✅ Bestseller column added successfully!');
  } else {
    console.log('ℹ️  Bestseller column already exists');
  }
  
  // Check if orders table has the correct structure
  const ordersTableInfo = db.prepare("PRAGMA table_info(orders)").all();
  const hasCustomerEmail = ordersTableInfo.some(col => col.name === 'customerEmail');
  
  if (!hasCustomerEmail) {
    console.log('📝 Updating orders table structure...');
    
    // Create new orders table with correct structure
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders_new (
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
    
    // Copy data if old table exists
    try {
      db.exec(`
        INSERT INTO orders_new (id, customerName, customerEmail, customerPhone, customerAddress, totalAmount, status, createdAt, updatedAt)
        SELECT id, customerName, email, phone, address, totalAmount, status, createdAt, updatedAt
        FROM orders
      `);
      db.exec('DROP TABLE orders');
      db.exec('ALTER TABLE orders_new RENAME TO orders');
      console.log('✅ Orders table updated successfully!');
    } catch (e) {
      console.log('ℹ️  No existing orders to migrate');
    }
  }
  
  // Show current products
  const products = db.prepare('SELECT id, name, featured, bestseller FROM products').all();
  console.log('\n📊 Current products:');
  products.forEach(p => {
    console.log(`  ${p.id}: ${p.name} - Featured: ${p.featured ? 'Yes' : 'No'}, Bestseller: ${p.bestseller ? 'Yes' : 'No'}`);
  });
  
  console.log('\n🎉 Database migration completed successfully!');
  db.close();
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
