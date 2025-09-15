import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function POST() {
  try {
    const db = getDatabase();
    
    console.log('🔄 Starting database migration...');
    
    // Check current orders table structure
    const ordersTableInfo = db.prepare("PRAGMA table_info(orders)").all() as Array<{
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: any;
      pk: number;
    }>;
    
    const hasCustomerName = ordersTableInfo.some(col => col.name === 'customerName');
    const hasCustomerEmail = ordersTableInfo.some(col => col.name === 'customerEmail');
    
    if (!hasCustomerName || !hasCustomerEmail) {
      console.log('📝 Migrating orders table to camelCase schema...');
      
      // Create new orders table with camelCase columns
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
      
      // Try to migrate existing data if any
      try {
        // Check if old table has snake_case columns
        const hasSnakeCase = ordersTableInfo.some(col => col.name === 'customer_name');
        
        if (hasSnakeCase) {
          // Migrate from snake_case to camelCase
          db.exec(`
            INSERT INTO orders_new (id, customerName, customerEmail, customerPhone, customerAddress, totalAmount, status, createdAt, updatedAt)
            SELECT 
              COALESCE(id, rowid) as id,
              customer_name as customerName, 
              customer_email as customerEmail, 
              customer_phone as customerPhone, 
              COALESCE(items, '') as customerAddress,
              total_amount as totalAmount, 
              status, 
              COALESCE(created_at, CURRENT_TIMESTAMP) as createdAt,
              COALESCE(created_at, CURRENT_TIMESTAMP) as updatedAt
            FROM orders
          `);
        }
      } catch (e) {
        console.log('ℹ️  No existing orders to migrate or migration not needed');
      }
      
      // Replace old table
      db.exec('DROP TABLE IF EXISTS orders');
      db.exec('ALTER TABLE orders_new RENAME TO orders');
      
      console.log('✅ Orders table migrated successfully!');
    } else {
      console.log('ℹ️  Orders table already has correct schema');
    }
    
    // Create order_items table if it doesn't exist
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
    
    console.log('✅ Database migration completed successfully!');
    
    // Return current schema
    const finalOrdersSchema = db.prepare("PRAGMA table_info(orders)").all();
    const finalOrderItemsSchema = db.prepare("PRAGMA table_info(order_items)").all();
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      schemas: {
        orders: finalOrdersSchema,
        order_items: finalOrderItemsSchema
      }
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}