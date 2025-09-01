const Database = require('better-sqlite3');
const path = require('path');

try {
  console.log('🔍 Testing database connection...');
  
  const dbPath = path.join(process.cwd(), 'data', 'ru2ya.db');
  console.log('📁 Database path:', dbPath);
  
  if (!require('fs').existsSync(dbPath)) {
    console.error('❌ Database file not found!');
    process.exit(1);
  }
  
  const db = new Database(dbPath);
  console.log('✅ Database connected successfully');
  
  // Test basic query
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  console.log('📦 Product count:', productCount.count);
  
  // Test product query
  const products = db.prepare('SELECT id, name, category FROM products LIMIT 3').all();
  console.log('📋 Sample products:', products);
  
  db.close();
  console.log('✅ Test completed successfully');
  
} catch (error) {
  console.error('❌ Error during test:', error);
  process.exit(1);
}

