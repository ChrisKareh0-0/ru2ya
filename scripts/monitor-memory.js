#!/usr/bin/env node

/**
 * Memory Monitor for Ru2ya Website
 * Run this to monitor memory usage
 */

const os = require('os');

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function getMemoryInfo() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usagePercent = ((usedMem / totalMem) * 100).toFixed(2);
  
  console.log('\n📊 Memory Usage:');
  console.log(`Total: ${formatBytes(totalMem)}`);
  console.log(`Used: ${formatBytes(usedMem)} (${usagePercent}%)`);
  console.log(`Free: ${formatBytes(freeMem)}`);
  
  if (usagePercent > 80) {
    console.log('⚠️  Warning: High memory usage detected!');
  } else if (usagePercent > 60) {
    console.log('⚠️  Caution: Moderate memory usage');
  } else {
    console.log('✅ Memory usage is healthy');
  }
}

// Monitor every 30 seconds
setInterval(getMemoryInfo, 30000);
getMemoryInfo();

console.log('\n🔍 Monitoring memory usage... (Press Ctrl+C to stop)');
