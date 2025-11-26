# MongoDB Atlas Setup Guide

This guide walks you through setting up a **free MongoDB Atlas cluster** for the Ru2ya e-commerce application.

## Why MongoDB Atlas?

- ✅ **Free Tier**: 512MB storage, perfect for this project
- ✅ **Cloud-hosted**: No local MongoDB installation needed
- ✅ **Production-ready**: Same database for development and production
- ✅ **Automatic backups**: Built-in backup and restore
- ✅ **Global availability**: Fast access from anywhere
- ✅ **Works with Render**: Perfect for your deployment setup

## Step-by-Step Setup

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas Registration](https://www.mongodb.com/cloud/atlas/register)
2. Sign up using:
   - Email address, OR
   - Google account (faster)
3. Verify your email if required

### 2. Create a New Project

1. After login, click **"New Project"**
2. Project Name: `ru2ya-ecommerce`
3. Click **"Next"**
4. Skip adding members (click **"Create Project"**)

### 3. Build a Database Cluster

1. Click **"Build a Database"** (or **"Create"** button)
2. Choose **"Shared"** (FREE tier - M0)
3. Cloud Provider: **AWS** (recommended)
4. Region: Choose closest to your location:
   - For Europe: `eu-central-1` (Frankfurt) or `eu-west-1` (Ireland)
   - For US: `us-east-1` (N. Virginia)
   - For Middle East: `eu-central-1` (Frankfurt)
5. Cluster Name: `ru2ya-cluster`
6. Click **"Create"** (bottom right)

⏱️ Wait 1-3 minutes for cluster creation...

### 4. Configure Database Access (Create User)

1. You'll see a "Security Quickstart" screen
2. Under **"How would you like to authenticate your connection?"**:
   - Choose **"Username and Password"**
3. Create database user:
   - Username: `ru2ya_admin`
   - Password: Click **"Autogenerate Secure Password"**
   - **⚠️ IMPORTANT**: Copy and save this password somewhere safe!
4. Database User Privileges: `Atlas admin` (default is fine)
5. Click **"Create User"**

### 5. Configure Network Access

1. Still on the Security Quickstart screen
2. Under **"Where would you like to connect from?"**:
   - Choose **"My Local Environment"**
3. Add IP Address:
   - Click **"Add IP Address"**
   - Select **"Allow Access from Anywhere"**
   - IP Address: `0.0.0.0/0` (should auto-fill)
   - Description: `Allow all (for Render deployment)`
   - Click **"Add Entry"**

> **Note**: This allows connections from any IP. It's safe because:
> - Strong password authentication is required
> - Needed for Render (dynamic IPs)
> - MongoDB Atlas has built-in DDoS protection

4. Click **"Finish and Close"**
5. Click **"Go to Database"** on the popup

### 6. Get Your Connection String

1. On the Database Deployments page, find your cluster
2. Click **"Connect"** button
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **5.5 or later** (default)
6. Copy the connection string - it looks like:

```
mongodb+srv://ru2ya_admin:<password>@ru2ya-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Modify the connection string**:
   - Replace `<password>` with your actual password (from step 4)
   - Add database name before the `?`: `/ru2ya?`
   
   Final format:
   ```
   mongodb+srv://ru2ya_admin:YOUR_PASSWORD_HERE@ru2ya-cluster.xxxxx.mongodb.net/ru2ya?retryWrites=true&w=majority
   ```

### 7. Add to Local Environment

1. Open your project in terminal
2. Create/edit `.env.local` file:

```bash
cd /Users/chris/dev/NextGem/ru2ya
nano .env.local
```

3. Add this line (replace with your actual connection string):

```env
MONGODB_URI=mongodb+srv://ru2ya_admin:YOUR_PASSWORD_HERE@ru2ya-cluster.xxxxx.mongodb.net/ru2ya?retryWrites=true&w=majority
```

4. Save and exit (Ctrl+X, then Y, then Enter)

### 8. Test Connection Locally

```bash
npm run dev
```

Look for this message in the console:
```
✅ MongoDB connected successfully
```

If you see this, congratulations! Your MongoDB Atlas cluster is ready! 🎉

### 9. Add to Render (Production)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `ru2ya-website` service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   - Key: `MONGODB_URI`
   - Value: (paste your full connection string)
6. Click **"Save Changes"**
7. Render will automatically redeploy with the new environment variable

## Verification Checklist

- [ ] MongoDB Atlas account created
- [ ] Free cluster (M0) created successfully
- [ ] Database user created with secure password
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained and modified
- [ ] `MONGODB_URI` added to `.env.local`
- [ ] Local connection tested successfully
- [ ] `MONGODB_URI` added to Render environment variables
- [ ] Production deployment successful

## Troubleshooting

### "MongoServerError: bad auth"
- Check that you replaced `<password>` with your actual password
- Ensure no extra spaces in the connection string
- Verify the username is correct (`ru2ya_admin`)

### "Connection timeout"
- Check network access settings in MongoDB Atlas
- Ensure `0.0.0.0/0` is added to IP Access List
- Try whitelisting your current IP specifically

### "Database not found"
- Ensure `/ru2ya?` is in the connection string
- MongoDB will auto-create the database on first write

### Can't connect from Render
- Verify `MONGODB_URI` is set in Render environment variables
- Check Render logs for specific error messages
- Ensure connection string has `0.0.0.0/0` in Atlas network access

## Next Steps

After successful setup:

1. **Run migration script** to transfer data from SQLite:
   ```bash
   npm run migrate-to-mongodb
   ```

2. **Verify data** in MongoDB Atlas:
   - Go to Atlas dashboard
   - Click "Browse Collections"
   - Check `products` and `orders` collections

3. **Test admin panel**:
   - Local: `http://localhost:3000/x7k9m2p`
   - Production: `https://ru2ya-xxx.onrender.com/x7k9m2p`

## MongoDB Atlas Dashboard Features

### Collections Browser
- View all your data
- Edit documents manually
- Delete documents
- Export data

### Metrics
- Monitor database performance
- Track connections
- View operation statistics

### Backup
- Automatic daily backups (free tier)
- Point-in-time recovery (paid tiers)

### Alerts
- Set up email alerts for issues
- Monitor connection spikes
- Track storage usage

## Cost

**Current Setup: $0/month** (Free Forever)

Free tier includes:
- 512MB storage
- Shared RAM
- Shared vCPU
- Perfect for development and small production apps

Upgrade when needed:
- M10 tier: $0.08/hour (~$57/month) - 10GB storage
- M20 tier: $0.20/hour (~$145/month) - 20GB storage

For this project, the free tier should be sufficient for a long time!

---

**You're all set!** 🚀 Your MongoDB Atlas cluster is ready for the Ru2ya e-commerce application.
