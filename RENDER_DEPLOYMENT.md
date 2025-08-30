# 🚀 Render Deployment Guide for Ru2ya Website

## ✨ **Automatic Low-Memory Mode Setup**

Your website is now configured to automatically run in low-memory mode on Render! No manual configuration needed.

## 🎯 **What Happens Automatically**

1. **Memory optimization script** runs before every build
2. **Low-memory build** (256MB limit) runs automatically
3. **Low-memory runtime** (256MB limit) starts automatically
4. **All environment variables** are set automatically

## 📋 **Deployment Steps**

### **Step 1: Connect to Render**

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `ru2ya` repository

### **Step 2: Automatic Configuration**

The `render.yaml` file will automatically configure:
- **Build Command**: `npm run build:render`
- **Start Command**: `npm run start:render`
- **Environment**: `starter` plan (512MB RAM)
- **Memory Limits**: 256MB build, 256MB runtime

### **Step 3: Deploy**

1. Click "Create Web Service"
2. Render will automatically:
   - Run memory optimization script
   - Build with 256MB limit
   - Start with 256MB limit
   - Set all environment variables

## 🔧 **Manual Configuration (Alternative)**

If you prefer manual setup, use these settings:

### **Build Command:**
```bash
npm run build:render
```

### **Start Command:**
```bash
npm run start:render
```

### **Environment Variables:**
```bash
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=256
NEXT_TELEMETRY_DISABLED=1
NEXT_IMAGE_OPTIMIZATION_MEMORY_LIMIT=128
NEXT_BUILD_MEMORY_LIMIT=256
NEXT_RUNTIME_MEMORY_LIMIT=128
SQLITE_CACHE_SIZE=2000
SQLITE_TEMP_STORE=memory
SQLITE_MMAP_SIZE=268435456
```

## 📊 **Memory Usage on Render**

- **Build Process**: Limited to 256MB
- **Runtime**: Limited to 256MB
- **Database**: Optimized for low memory
- **Images**: Limited concurrent processing
- **Bundles**: Optimized chunk sizes

## 🚨 **Troubleshooting**

### **Build Fails with Memory Error:**
- The build is already limited to 256MB
- Check if you have very large images
- Consider reducing image sizes

### **Runtime Memory Issues:**
- Runtime is limited to 256MB
- Check for memory leaks in components
- Monitor with `node scripts/monitor-memory.js`

### **Database Issues:**
- SQLite is optimized for low memory
- Database file is stored locally
- No external database connections

## 📈 **Performance Monitoring**

### **Render Dashboard:**
- Monitor memory usage
- Check build logs
- View runtime metrics

### **Local Monitoring:**
```bash
# Run locally to test memory usage
npm run build:render
npm run start:render

# Monitor memory
node scripts/monitor-memory.js
```

## 🎉 **Success Indicators**

✅ **Build completes** without memory errors  
✅ **Website starts** and loads properly  
✅ **Memory usage** stays under 256MB  
✅ **All features** work as expected  
✅ **Images load** without issues  

## 🔄 **Automatic Updates**

Every time you push to `master`:
1. Render automatically detects changes
2. Runs memory optimization script
3. Builds with low-memory settings
4. Deploys the optimized version

## 💡 **Pro Tips**

1. **Keep images under 2MB** for optimal performance
2. **Monitor build logs** for any warnings
3. **Test locally** with `npm run build:render`
4. **Use the memory monitor** script regularly

---

**Your website is now fully optimized for Render's 512MB RAM environment! 🚀**
