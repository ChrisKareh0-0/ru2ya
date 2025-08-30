#!/usr/bin/env node

/**
 * Remove Demo Products Script
 * This script removes the demo products from the database
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

console.log('🗑️ Starting demo products removal...');

try {
  // Determine database path
  let dbPath;
  if (process.env.NODE_ENV === 'production') {
    dbPath = '/data/ru2ya.db';
  } else {
    // Development: use local data directory
    dbPath = path.join(process.cwd(), 'data', 'ru2ya.db');
  }
  
  console.log('🗄️ Database path:', dbPath);
  
  // Check if database exists
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database not found at:', dbPath);
    console.log('💡 Make sure you have run the application at least once to create the database');
    process.exit(1);
  }
  
  // Open database connection
  const db = new Database(dbPath);
  
  // List of demo product names to remove
  const demoProductNames = [
    'Classic Aviator',
    'Modern Round', 
    'Sport Performance',
    'Vintage Square',
    'Premium Metal'
  ];
  
  console.log('📋 Demo products to remove:', demoProductNames);
  
  // Remove each demo product
  let removedCount = 0;
  
  for (const productName of demoProductNames) {
    const stmt = db.prepare('DELETE FROM products WHERE name = ?');
    const result = stmt.run(productName);
    
    if (result.changes > 0) {
      console.log(`✅ Removed: ${productName}`);
      removedCount++;
    } else {
      console.log(`ℹ️  Not found: ${productName}`);
    }
  }
  
  console.log(`\n🎉 Demo products removal complete!`);
  console.log(`📊 Total products removed: ${removedCount}`);
  
  // Show remaining products
  const remainingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
  console.log(`📦 Products remaining in database: ${remainingProducts.count}`);
  
  if (remainingProducts.count > 0) {
    const products = db.prepare('SELECT name, category FROM products ORDER BY createdAt DESC').all();
    console.log('\n📋 Remaining products:');
    products.forEach(product => {
      console.log(`  • ${product.name} (${product.category})`);
    });
  }
  
  // Close database connection
  db.close();
  
} catch (error) {
  console.error('❌ Error removing demo products:', error);
  process.exit(1);
}
