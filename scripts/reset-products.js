#!/usr/bin/env node

/**
 * Reset Products Script
 * This script clears the products table and reloads from the JSON file
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

console.log('🔄 Starting products reset...');

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
  
  // Load products from JSON
  const jsonPath = path.join(process.cwd(), 'data', 'products.json');
  if (!fs.existsSync(jsonPath)) {
    console.log('❌ Products JSON file not found at:', jsonPath);
    console.log('💡 Make sure data/products.json exists');
    process.exit(1);
  }
  
  console.log('📁 Reading JSON file from:', jsonPath);
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  console.log('📄 JSON file content length:', jsonData.length, 'characters');
  
  const data = JSON.parse(jsonData);
  console.log('🔍 Parsed JSON data keys:', Object.keys(data));
  
  // Handle both array format and object with products array format
  let products;
  if (Array.isArray(data)) {
    // Direct array format
    products = data;
    console.log('📋 JSON is direct array format');
  } else if (data.products && Array.isArray(data.products)) {
    // Wrapped in products object format
    products = data.products;
    console.log('📋 JSON is wrapped in products object format');
  } else {
    console.log('❌ Invalid JSON structure. Expected array of products or object with "products" array');
    console.log('📋 Actual structure:', JSON.stringify(data, null, 2));
    process.exit(1);
  }
  
  console.log(`📦 Found ${products.length} products in JSON file`);
  
  // Clear existing products
  console.log('🗑️  Clearing existing products...');
  const clearStmt = db.prepare('DELETE FROM products');
  const clearResult = clearStmt.run();
  console.log(`✅ Cleared ${clearResult.changes} existing products`);
  
  // Insert products from JSON
  console.log('📥 Inserting products from JSON...');
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, image, category, featured, bestseller) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Begin transaction for faster insertion
  const transaction = db.transaction(() => {
    for (const product of products) {
      insertProduct.run(
        product.name,
        product.description,
        product.price,
        product.image,
        product.category,
        product.featured ? 1 : 0,
        product.bestseller ? 1 : 0
      );
    }
  });
  
  transaction();
  console.log(`✅ Successfully inserted ${products.length} products from JSON`);
  
  // Verify insertion
  const countResult = db.prepare('SELECT COUNT(*) as count FROM products').get();
  console.log(`📊 Total products in database: ${countResult.count}`);
  
  // Show sample products
  const sampleProducts = db.prepare('SELECT name, category, featured, bestseller FROM products ORDER BY createdAt DESC LIMIT 5').all();
  console.log('\n📋 Sample products loaded:');
  sampleProducts.forEach(product => {
    const featured = product.featured ? '⭐' : '';
    const bestseller = product.bestseller ? '🔥' : '';
    console.log(`  • ${product.name} (${product.category}) ${featured}${bestseller}`);
  });
  
  // Close database connection
  db.close();
  
  console.log('\n🎉 Products reset complete!');
  console.log('💡 The server will now automatically load these products on startup');
  
} catch (error) {
  console.error('❌ Error resetting products:', error);
  process.exit(1);
}
