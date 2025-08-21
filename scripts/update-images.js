const Database = require('better-sqlite3');
const path = require('path');

// Path to the database file
const dbPath = path.join(__dirname, '..', 'data', 'ru2ya.db');

try {
  console.log('🔄 Updating product images in database...');
  
  // Connect to database
  const db = new Database(dbPath);
  
  // Update image paths from .jpg to .svg
  const updateStmt = db.prepare(`
    UPDATE products 
    SET image = REPLACE(image, '.jpg', '.svg'), 
        updatedAt = CURRENT_TIMESTAMP
    WHERE image LIKE '%.jpg'
  `);
  
  const result = updateStmt.run();
  console.log(`✅ Updated ${result.changes} product images`);
  
  // Show current products
  const products = db.prepare('SELECT id, name, image FROM products').all();
  console.log('\n📊 Current products:');
  products.forEach(p => {
    console.log(`  ${p.id}: ${p.name} - Image: ${p.image}`);
  });
  
  console.log('\n🎉 Database images updated successfully!');
  db.close();
  
} catch (error) {
  console.error('❌ Database update failed:', error.message);
  process.exit(1);
}
