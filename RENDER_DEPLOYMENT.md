# Deploying Ru2ya to Render

## Quick Answer

**Short version**: Push to GitHub, Render auto-deploys the app. Done! 🚀

**But**: Docker Compose services (Prometheus, Grafana, InfluxDB, Monika) won't run on Render since it doesn't support Docker Compose.

## What Actually Happens

When you push to GitHub:

✅ Render detects Dockerfile
✅ Builds Docker image
✅ Deploys to https://ru2ya-xxx.onrender.com
✅ Auto-restarts if it crashes
✅ Shows metrics in Render dashboard

❌ Prometheus, Grafana, InfluxDB, Monika don't deploy
❌ Docker Compose not supported
✅ But that's OK - your app has `/api/metrics` and `/api/health` endpoints

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
cd /Users/chris/dev/NextGem/ru2ya
git add .
git commit -m "Add monitoring and ready for Render"
git push origin main
```

### 2. Create Render Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Select your GitHub repository
4. Configure:
   - **Name**: ru2ya
   - **Environment**: Docker
   - **Region**: Choose closest to you
   - **Branch**: main

### 3. Add Settings

**Health Check:**
- Path: `/api/health`
- Interval: 30s
- Timeout: 10s

**Environment Variables:**
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=768
```

### 4. Select Plan

- Free: $0 (750 hrs/month, auto-pauses when inactive)
- Standard: $7/month (recommended, always running)

### 5. Deploy

Click "Create Web Service" - done! Render handles everything.

Takes ~5 minutes. Your app is now live!

## Test It

```bash
# Get your URL from Render dashboard
curl https://ru2ya-xxx.onrender.com/api/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":123}
```

## Database: Important!

SQLite won't persist between Render deployments.

### Option A: Use PostgreSQL (Recommended)

1. In Render: Click "New +" → "PostgreSQL"
2. Create instance
3. Copy connection string
4. Add to Web Service: `DATABASE_URL=postgresql://...`
5. Redeploy

### Option B: Keep SQLite (Data Lost on Deploy)

Easier but data disappears each deploy. OK for dev/testing only.

## Auto-Deploy from GitHub

After initial setup:

```bash
git push origin main
# Render automatically redeploys in ~1 minute!
```

You can push, wait 1 minute, and it's live. No manual steps needed.

## Monitoring Your Live App

### Option 1: Render's Built-in Monitoring

In Render Dashboard:
- Service → Metrics tab
- See CPU, memory, request rate, error rate
- Automatic uptime tracking

### Option 2: Monitor with Local Monika

```bash
# Edit monika/monika.json to add your live app:
{
  "probes": [
    {
      "id": "prod-app",
      "name": "Production App",
      "interval": 300,
      "requests": [{"url": "https://ru2ya-xxx.onrender.com"}]
    }
  ]
}

# Run locally
docker-compose up monika
```

### Option 3: Use External Monitoring

- Grafana Cloud (free tier)
- Datadog (free tier)
- New Relic (free tier)

Point them to your app's `/api/metrics` endpoint.

## Cost

| Service | Cost |
|---------|------|
| Web Service | $7/month (Standard) |
| PostgreSQL | $15/month |
| **Total** | **$22/month** |

Much cheaper than AWS, Heroku, or DigitalOcean!

## Environment Variables

In Render Dashboard → Environment:

```env
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=768
DATABASE_URL=postgresql://user:pass@host/db
```

## Troubleshooting

### App won't start

1. Check logs: Dashboard → Logs
2. Look for error messages
3. Push fix to GitHub
4. Render auto-redeploys

### Database not working

1. Check DATABASE_URL is set
2. Verify PostgreSQL service is created
3. Connection string correct
4. Redeploy

### Can't access app

1. Wait 5 minutes (first deploy takes time)
2. Check your Render URL
3. Try health endpoint: `/api/health`
4. Check logs for errors

## What Gets Deployed

✅ Your Next.js app
✅ All API endpoints
✅ `/api/metrics` endpoint
✅ `/api/health` endpoint
✅ All code and assets

❌ Prometheus (won't deploy)
❌ Grafana (won't deploy)
❌ InfluxDB (won't deploy)
❌ Monika (won't deploy)
❌ Docker Compose (not supported)

**This is fine** - your app works perfectly without them on Render!

## Production Checklist

- [ ] Code pushed to GitHub
- [ ] Dockerfile present in root
- [ ] Environment variables set in Render
- [ ] Database configured (PostgreSQL recommended)
- [ ] Health check set to `/api/health`
- [ ] App accessible at public URL
- [ ] Logs show no errors
- [ ] Test health endpoint works
- [ ] Auto-deploy working (push → deploy)
- [ ] Monitoring set up (if needed)

## Next Steps

1. **Push code**: `git push origin main`
2. **Create Render service**: Follow steps above
3. **Wait 5 minutes**
4. **Test app**: Visit your Render URL
5. **Set up monitoring** (optional): See options above

## Docs

- [Render Docs](https://render.com/docs)
- [Deploy Next.js](https://render.com/docs/deploy-nextjs)
- [PostgreSQL](https://render.com/docs/databases)

---

That's it! Your app is production-ready. 🚀
