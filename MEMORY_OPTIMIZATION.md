# Memory Optimization Guide for Ru2ya Website

## For Low-Resource Hosting (512MB RAM)

### 1. Build Commands
Use these commands to reduce memory usage:

```bash
# Build with limited memory
npm run build:low-memory

# Start with limited memory
npm run start:low-memory

# Development with limited memory
npm run dev:low-memory
```

### 2. Environment Variables
Set these in your hosting environment:

```bash
NODE_OPTIONS="--max-old-space-size=256 --optimize-for-size"
NEXT_TELEMETRY_DISABLED=1
NEXT_IMAGE_OPTIMIZATION_MEMORY_LIMIT=128
NEXT_BUILD_MEMORY_LIMIT=256
```

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
```bash
# Check memory usage
ps aux | grep node
# or
top -p $(pgrep node)
```

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
