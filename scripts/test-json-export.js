#!/usr/bin/env node

/**
 * Test JSON Export Script
 * This script tests the exportProductsToJSON functionality
 */

const { exportProductsToJSON } = require('../lib/database');

console.log('🧪 Testing JSON export functionality...');

try {
  // Test the export function
  const success = exportProductsToJSON();
  
  if (success) {
    console.log('✅ JSON export test passed!');
    console.log('📁 Check data/products.json to see the exported products');
  } else {
    console.log('❌ JSON export test failed!');
  }
  
} catch (error) {
  console.error('❌ Error during test:', error);
}
