#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Starting database restore process...');

// Get database paths
const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'ru2ya.db');
const backupPath = path.join(dataDir, 'ru2ya.backup.db');

// Check if backup exists
if (fs.existsSync(backupPath)) {
  console.log('📦 Backup found, restoring database...');
  
  try {
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created data directory');
    }
    
    // Restore database
    fs.copyFileSync(backupPath, dbPath);
    console.log('✅ Database restored from backup');
    
    // Verify restoration
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`📏 Restored database size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log('🎯 Database restore completed successfully!');
    } else {
      console.error('❌ Database file not found after restore');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Failed to restore database:', error);
    process.exit(1);
  }
} else {
  console.log('⚠️  No backup found to restore from');
  console.log('💡 Expected backup at:', backupPath);
}

console.log('🏁 Restore process completed!');
