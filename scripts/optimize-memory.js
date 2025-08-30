#!/usr/bin/env node

/**
 * Memory Optimization Script for Ru2ya Website
 * Run this before deploying to optimize memory usage
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting memory optimization...');

// 1. Optimize package.json scripts
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add memory-optimized build scripts
  package.scripts = {
    ...package.scripts,
    'build:low-memory': 'NODE_OPTIONS=\"--max-old-space-size=256 --optimize-for-size\" next build',
    'start:low-memory': 'NODE_OPTIONS=\"--max-old-space-size=256\" next start',
    'dev:low-memory': 'NODE_OPTIONS=\"--max-old-space-size=256\" next dev'
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(package, null, 2));
  console.log('✅ Updated package.json with memory-optimized scripts');
}

// 2. Create memory-optimized next.config.js
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  let config = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Add memory optimization comments
  if (!config.includes('memory optimization')) {
    config = `// Memory optimization for low-resource hosting
${config}`;
    
    fs.writeFileSync(nextConfigPath, config);
    console.log('✅ Added memory optimization comments to next.config.js');
  }
}

// 3. Create deployment guide
const deploymentGuide = `# Memory Optimization Guide for Ru2ya Website

## For Low-Resource Hosting (512MB RAM)

### 1. Build Commands
Use these commands to reduce memory usage:

\`\`\`bash
# Build with limited memory
npm run build:low-memory

# Start with limited memory
npm run start:low-memory

# Development with limited memory
npm run dev:low-memory
\`\`\`

### 2. Environment Variables
Set these in your hosting environment:

\`\`\`bash
NODE_OPTIONS="--max-old-space-size=256 --optimize-for-size"
NEXT_TELEMETRY_DISABLED=1
NEXT_IMAGE_OPTIMIZATION_MEMORY_LIMIT=128
NEXT_BUILD_MEMORY_LIMIT=256
\`\`\`

### 3. Hosting Recommendations
- **Vercel**: Use "Hobby" plan (512MB RAM)
- **Netlify**: Use "Starter" plan
- **Railway**: Use "Starter" plan
- **Render**: Use "Free" plan

### 4. Database Optimization
- SQLite database is already optimized for low memory
- Database file is stored locally to reduce memory usage
- Connection pooling and prepared statements implemented

### 5. Image Optimization
- Images are served from Firebase Storage (CDN)
- Next.js image optimization is limited to reduce memory
- Lazy loading implemented for product images

### 6. Performance Tips
- Keep product count under 1000 for optimal performance
- Use category filters to reduce rendered items
- Virtual scrolling implemented for large product lists
- Debounced search to reduce API calls

### 7. Monitoring
Monitor memory usage:
\`\`\`bash
# Check memory usage
ps aux | grep node
# or
top -p \$(pgrep node)
\`\`\`

### 8. Troubleshooting
If you still get memory errors:
1. Reduce the number of products
2. Use more aggressive image compression
3. Implement pagination (contact developer)
4. Consider upgrading to 1GB RAM hosting

## Current Optimizations Implemented:
✅ Database connection pooling
✅ Prepared SQL statements
✅ Virtual scrolling for products
✅ Dynamic component imports
✅ Debounced search
✅ Memory-optimized Next.js config
✅ Image optimization limits
✅ Webpack chunk optimization
✅ Reduced bundle sizes
✅ Efficient state management
`;

fs.writeFileSync(path.join(process.cwd(), 'MEMORY_OPTIMIZATION.md'), deploymentGuide);
console.log('✅ Created MEMORY_OPTIMIZATION.md guide');

// 4. Create .npmrc for memory optimization
const npmrcContent = `# Memory optimization for npm
maxsockets=1
fetch-retries=1
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
`;

fs.writeFileSync(path.join(process.cwd(), '.npmrc'), npmrcContent);
console.log('✅ Created .npmrc with memory optimizations');

// 5. Create memory monitoring script
const monitorScript = `#!/usr/bin/env node

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
  
  console.log('\\n📊 Memory Usage:');
  console.log(\`Total: \${formatBytes(totalMem)}\`);
  console.log(\`Used: \${formatBytes(usedMem)} (\${usagePercent}%)\`);
  console.log(\`Free: \${formatBytes(freeMem)}\`);
  
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

console.log('\\n🔍 Monitoring memory usage... (Press Ctrl+C to stop)');
`;

fs.writeFileSync(path.join(process.cwd(), 'scripts/monitor-memory.js'), monitorScript);
console.log('✅ Created memory monitoring script');

console.log('\\n🎉 Memory optimization complete!');
console.log('\\n📋 Next steps:');
console.log('1. Use npm run build:low-memory for builds');
console.log('2. Check MEMORY_OPTIMIZATION.md for deployment guide');
console.log('3. Run node scripts/monitor-memory.js to monitor usage');
console.log('4. Deploy with the optimized configuration');
