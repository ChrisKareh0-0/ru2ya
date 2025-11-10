# Monika & Grafana Integration Summary

## What Was Integrated

A complete observability stack has been integrated into your Ru2ya e-commerce application:

### Core Components

1. **Monika** - Open-source uptime monitoring tool
   - Monitors 6 critical endpoints
   - 30-second to 24-hour check intervals
   - Email alerts via SendGrid
   - Running on port 3100

2. **Prometheus** - Metrics collection & storage
   - Scrapes application metrics every 30 seconds
   - Collects container metrics from cAdvisor
   - Web UI on port 9090
   - 15-day default retention

3. **InfluxDB** - Time-series database
   - Stores high-volume metrics
   - Better performance for large datasets
   - Database UI on port 8086
   - Integrated with Grafana

4. **Grafana** - Visualization platform
   - Pre-built dashboards included
   - Port 3001 (remapped from 3000)
   - Beautiful visualizations and alerts

## Files Created

### Monitoring Configuration
```
monika/
  └── monika.json               # Uptime probe configuration
  └── logs/                     # Monika log output

grafana/provisioning/
  ├── datasources/
  │   └── prometheus.yml        # Datasource config
  └── dashboards/
      ├── application.json      # Application metrics dashboard
      ├── uptime.json           # Uptime dashboard
      └── dashboards.yml        # Dashboard provisioning
```

### Application Code
```
app/api/
  ├── metrics/route.ts          # Prometheus metrics endpoint (/api/metrics)
  └── health/route.ts           # Health check endpoint (/api/health)

lib/
  └── metrics.ts                # Metrics collection library with:
      - HTTP metrics
      - Business metrics (cart, checkout, products)
      - Database metrics
      - Prometheus & InfluxDB integration
```

### Documentation
```
MONITORING.md                  # Complete monitoring guide (detailed)
MONITORING_SETUP.md            # Quick start guide (this approach)
INTEGRATION_SUMMARY.md         # This file
```

## Metrics Collected

### HTTP/Request Metrics
- Total requests by method, route, status
- Request duration (histogram with percentiles)
- Request rate (requests/sec)
- Error rate (5xx responses)

### Business Metrics
- Cart operations (add/remove)
- Product views
- Checkout attempts (success/failed/started)

### Infrastructure Metrics
- CPU usage
- Memory usage
- Network I/O
- Container metrics (from cAdvisor)

### Database Metrics
- Query duration by type
- Active connections

## Endpoints Monitored by Monika

1. **Homepage** (`/`) - Every 60 seconds
2. **API** (`/api/products`) - Every 30 seconds
3. **Products Page** (`/products`) - Every 60 seconds
4. **Checkout** (`/checkout`) - Every 120 seconds
5. **Admin Dashboard** (`/x7k9m2p`) - Every 300 seconds
6. **SSL Certificate** - Every 24 hours

## Docker Compose Updates

### New Services
```yaml
influxdb:       # Time-series metrics database
monika:         # Uptime monitoring
grafana:        # Updated with volumes for persistence
```

### Updated Services
```yaml
prometheus:     # Now includes app metrics scraping
app:            # Exposes /api/metrics endpoint
```

### New Ports
- 3100: Monika dashboard
- 8086: InfluxDB
- 3001: Grafana (remapped from 3000)

## Package Dependencies Added

```json
{
  "prom-client": "^15.1.0",      // Prometheus metrics client
  "influx": "^5.9.3"              // InfluxDB client
}
```

## How to Use

### Start the Stack
```bash
docker-compose up -d
```

### Access the Dashboards
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **InfluxDB**: http://localhost:8086
- **Monika**: http://localhost:3100

### Generate Metrics
```bash
# Visit your app to generate metrics
curl http://localhost:3000
curl http://localhost:3000/products
curl http://localhost:3000/api/metrics  # View collected metrics
```

### View Metrics
- Go to Grafana dashboard at http://localhost:3001
- Explore metrics in Prometheus at http://localhost:9090

## Key Features

✅ **Automatic Dashboard Provisioning**
- 2 pre-built dashboards included
- Prometheus and InfluxDB datasources auto-configured

✅ **Zero-Config Metrics Collection**
- Application automatically exposes metrics at `/api/metrics`
- Prometheus scrapes every 30 seconds
- No manual instrumentation needed for basic metrics

✅ **Production-Ready Alerts**
- Monika monitors critical endpoints
- Email alerts configured (with SendGrid)
- SLA monitoring built-in

✅ **Multiple Datasources**
- Prometheus for application & infrastructure metrics
- InfluxDB for custom/high-volume metrics
- Both visualized in single Grafana instance

✅ **Health Checks**
- Application `/api/health` endpoint
- Container health checks in Docker Compose
- Service readiness monitoring in Monika

## Configuration Highlights

### Monika Probes
- **Homepage Check**: Alerts if response time > 5s or status ≠ 200
- **API Health**: Alerts if response time > 3s or status ≠ 200
- **Checkout**: Tracks checkout availability
- **SSL Certificate**: Daily check for expiration < 30 days

### Prometheus Scraping
- Application metrics: Every 30 seconds
- cAdvisor metrics: Every 15 seconds
- Custom jobs for Prometheus, InfluxDB

### Grafana Dashboards
- **Application Metrics**: Request rate, response times, errors, business metrics
- **Uptime**: Service status, success rate, response time distribution

## Environment Variables

Optional for enhanced features:

```bash
# InfluxDB Integration (optional)
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_TOKEN=your_token
INFLUXDB_ORG=ru2ya
INFLUXDB_BUCKET=metrics

# Monika Alerts (optional)
SENDGRID_API_KEY=your_sendgrid_key
```

## Next Steps

1. **Start the stack**: `docker-compose up -d`
2. **Access Grafana**: http://localhost:3001
3. **Generate traffic**: Visit your app's pages
4. **Review metrics**: Wait 30 seconds, refresh Grafana
5. **Configure alerts**: Update email in monika/monika.json
6. **Customize dashboards**: Create new dashboards in Grafana UI

## Architecture Benefits

✨ **Complete Visibility**
- Application performance metrics
- Infrastructure metrics
- Uptime monitoring
- All in one place

✨ **Scalability**
- Prometheus for standard metrics
- InfluxDB for high-volume data
- Grafana for any data source

✨ **Production Ready**
- Health checks
- Alert notifications
- Metric retention policies
- Container orchestration support

✨ **Developer Friendly**
- Simple metrics library (prom-client)
- Pre-built dashboards
- Easy to extend with custom metrics
- Well-documented setup

## Support & References

- **Monika**: https://monika.hyperjump.tech/
- **Grafana**: https://grafana.com/docs/
- **Prometheus**: https://prometheus.io/docs/
- **InfluxDB**: https://docs.influxdata.com/
- **prom-client**: https://github.com/siimon/prom-client

See `MONITORING.md` for complete documentation and advanced topics.
