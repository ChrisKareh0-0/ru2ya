# Quick Start: Monitoring Setup

This guide will get your monitoring stack running in minutes.

## Prerequisites

- Docker and Docker Compose installed
- The updated `docker-compose.yml` file
- The monitoring configuration files

## Step 1: Start the Monitoring Stack

```bash
cd /Users/chris/dev/NextGem/ru2ya

# Build and start all services
docker-compose up -d

# Watch the startup logs
docker-compose logs -f
```

## Step 2: Wait for Services to Start

Give services ~30 seconds to fully initialize:

```bash
# Check container status
docker-compose ps
```

Expected output:
```
NAME              STATUS
app               Up (healthy)
cadvisor          Up
prometheus        Up
grafana           Up
influxdb          Up (healthy)
monika            Up (healthy)
```

## Step 3: Verify Metrics Collection

### Check Prometheus is scraping metrics

1. Open http://localhost:9090/targets
2. Verify all targets show as "UP" (green)
3. If app target is down, wait a few more seconds and refresh

### Check application metrics endpoint

```bash
curl http://localhost:3000/api/metrics | head -30
```

Should return Prometheus metrics like:
```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/",status="200"} 42
```

## Step 4: Access the Dashboards

### Grafana (Main Dashboard)
- **URL**: http://localhost:3001
- **Username**: admin
- **Password**: admin (change on first login)
- **Dashboards**:
  - Ru2ya Application Metrics
  - Ru2ya Uptime & Availability

### Prometheus (Metrics Explorer)
- **URL**: http://localhost:9090
- **Try this query**: `rate(http_requests_total[5m])`

### InfluxDB (Database)
- **URL**: http://localhost:8086
- **Username**: admin
- **Password**: admin

### Monika (Uptime Monitoring)
- **URL**: http://localhost:3100
- **Check probe status**: All should show as "Active"

## Step 5: Generate Some Metrics

Visit your application to generate metrics:

```bash
# Visit homepage
curl http://localhost:3000

# Browse products
curl http://localhost:3000/products

# Add to cart (simulating interactions)
curl http://localhost:3000
```

Then refresh Grafana dashboards to see the metrics appear!

## Step 6: Configure Email Alerts (Optional)

To receive email alerts from Monika:

1. Get a SendGrid API key:
   - Go to https://app.sendgrid.com/settings/api_keys
   - Create a new API key

2. Set environment variable:
   ```bash
   export SENDGRID_API_KEY=your_key_here
   ```

3. Update `monika/monika.json`:
   - Replace `${SENDGRID_API_KEY}` with your actual key
   - Update email addresses in the `to` field

4. Restart Monika:
   ```bash
   docker-compose restart monika
   ```

## Common Tasks

### View logs from a service

```bash
# Application logs
docker-compose logs app -f

# Prometheus logs
docker-compose logs prometheus -f

# Monika logs
docker-compose logs monika -f

# All logs
docker-compose logs -f
```

### Stop monitoring stack

```bash
docker-compose down
```

### Stop monitoring stack and remove volumes

```bash
# WARNING: This deletes all historical metrics
docker-compose down -v
```

### Restart a specific service

```bash
docker-compose restart monika
docker-compose restart grafana
docker-compose restart prometheus
```

## Troubleshooting

### "Connection refused" when accessing Grafana

The service might still be starting. Wait 10 seconds and try again:
```bash
sleep 10
# Then visit http://localhost:3001
```

### No metrics showing in Grafana

1. Verify app is running and accessible:
   ```bash
   curl http://localhost:3000
   curl http://localhost:3000/api/metrics
   ```

2. Check Prometheus targets:
   - Go to http://localhost:9090/targets
   - Look for `app` job - should be "UP"

3. Generate some traffic first:
   ```bash
   curl http://localhost:3000/products
   ```

4. Wait 30 seconds for Prometheus to scrape metrics

### Monika not showing probe status

1. Check Monika is healthy:
   ```bash
   docker-compose logs monika | tail -20
   ```

2. Verify app is accessible from Monika:
   ```bash
   docker-compose exec monika curl http://app:3000
   ```

3. Restart Monika:
   ```bash
   docker-compose restart monika
   ```

### InfluxDB connection issues

```bash
# Check InfluxDB is running
docker-compose logs influxdb | tail -20

# Test connection
curl http://localhost:8086/api/v2/ready
```

## Next Steps

1. **Explore Prometheus queries**:
   - Go to http://localhost:9090
   - Try queries like:
     - `http_requests_total`
     - `rate(http_requests_total[5m])`
     - `histogram_quantile(0.95, http_request_duration_seconds_bucket)`

2. **Create custom dashboards** in Grafana:
   - Click "+" → "Dashboard"
   - Add panels with your own queries
   - Save and share dashboards

3. **Set up Monika alerts**:
   - Edit `monika/monika.json`
   - Add alert thresholds for your SLOs
   - Configure notification channels

4. **Monitor production**:
   - Deploy this stack to your production environment
   - Set up alerting to your ops team
   - Create runbooks for common issues

## Support

For issues or questions:
1. Check `MONITORING.md` for detailed documentation
2. Review Docker Compose logs: `docker-compose logs`
3. Check service health endpoints:
   - App: http://localhost:3000/api/health
   - InfluxDB: http://localhost:8086/api/v2/ready
   - Monika: http://localhost:3100/api/status

## Files Modified/Created

### New Files
- `app/api/metrics/route.ts` - Metrics endpoint
- `app/api/health/route.ts` - Health check endpoint
- `lib/metrics.ts` - Metrics collection utilities
- `monika/monika.json` - Monika configuration
- `grafana/provisioning/datasources/prometheus.yml` - Datasources config
- `grafana/provisioning/dashboards/*.json` - Dashboard definitions
- `MONITORING.md` - Complete monitoring documentation

### Modified Files
- `docker-compose.yml` - Added InfluxDB, Monika, Grafana volumes
- `prometheus.yml` - Added app metrics scraping
- `package.json` - Added prom-client and influx packages

### Directory Structure
```
ru2ya/
├── monika/
│   └── monika.json          # Monika configuration
├── grafana/provisioning/
│   ├── datasources/
│   │   └── prometheus.yml    # Grafana datasources
│   └── dashboards/
│       ├── application.json  # Application metrics dashboard
│       ├── uptime.json       # Uptime monitoring dashboard
│       └── dashboards.yml    # Dashboard provisioning config
├── app/api/
│   ├── metrics/route.ts      # Metrics endpoint
│   └── health/route.ts       # Health check endpoint
├── lib/
│   └── metrics.ts            # Metrics utilities
├── MONITORING.md             # Full documentation
├── MONITORING_SETUP.md       # This file
├── docker-compose.yml        # Updated
└── prometheus.yml            # Updated
```

Enjoy monitoring your application! 🚀
