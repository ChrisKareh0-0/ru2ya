#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting deployment backup process...');

// Get database paths
const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'ru2ya.db');
const backupPath = path.join(dataDir, 'ru2ya.backup.db');

// Check if database exists
if (fs.existsSync(dbPath)) {
  console.log('📊 Database found, creating backup...');
  
  try {
    // Create backup
    fs.copyFileSync(dbPath, backupPath);
    console.log('✅ Database backed up to:', backupPath);
    
    // Get file size for verification
    const stats = fs.statSync(backupPath);
    console.log(`📏 Backup size: ${(stats.size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Failed to backup database:', error);
    process.exit(1);
  }
} else {
  console.log('⚠️  No database found to backup');
}

console.log('🎯 Deployment backup process completed!');
console.log('💡 After deployment, run: npm run restore-db');
