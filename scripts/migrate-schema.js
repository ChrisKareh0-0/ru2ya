const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('🔄 Starting database schema migration...');

function migrateDatabase() {
  const dbPath = path.join(__dirname, '..', 'data', 'ru2ya.db');

  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database file not found at:', dbPath);
    return;
  }

  const db = new Database(dbPath);

  try {
    // Check if we need to migrate from old schema
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const tableNames = tables.map(t => t.name);

    console.log('📋 Found tables:', tableNames);

    // Check if old orders table exists with old schema
    const oldOrdersExists = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders'").get();

    if (oldOrdersExists && oldOrdersExists.sql.includes('customer_name')) {
      console.log('🔄 Migrating orders table from old schema...');

      // Create new orders table with correct schema
      db.exec(`
        CREATE TABLE IF NOT EXISTS orders_new (
          id TEXT PRIMARY KEY,
          customerName TEXT NOT NULL,
          customerEmail TEXT NOT NULL,
          customerPhone TEXT NOT NULL,
          customerAddress TEXT,
          totalAmount REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Migrate existing data if any
      const oldOrders = db.prepare('SELECT * FROM orders').all();
      if (oldOrders.length > 0) {
        console.log(`📦 Migrating ${oldOrders.length} existing orders...`);

        const insertNew = db.prepare(`
          INSERT INTO orders_new (id, customerName, customerEmail, customerPhone, customerAddress, totalAmount, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const order of oldOrders) {
          const newId = order.id.toString() || (Date.now().toString() + Math.random().toString(36).substr(2, 9));
          insertNew.run(
            newId,
            order.customer_name || '',
            order.customer_email || '',
            order.customer_phone || '',
            '', // No address in old schema
            order.total_amount || 0,
            order.status || 'pending',
            order.created_at || new Date().toISOString()
          );
        }
      }

      // Drop old table and rename new one
      db.exec('DROP TABLE orders');
      db.exec('ALTER TABLE orders_new RENAME TO orders');

      console.log('✅ Orders table migration completed');
    }

    // Create order_items table if it doesn't exist
    const orderItemsExists = tableNames.includes('order_items');
    if (!orderItemsExists) {
      console.log('🔄 Creating order_items table...');
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
        );
      `);
      console.log('✅ order_items table created');
    }

    console.log('✅ Database schema migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run migration
migrateDatabase();