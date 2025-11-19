# Monitoring Stack - Quick Reference

## 🚀 Get Started in 3 Steps

```bash
# 1. Start the stack
docker-compose up -d

# 2. Wait for services to start (30 seconds)
docker-compose ps

# 3. Open Grafana
open http://localhost:3001
# Username: admin | Password: admin
```

## 📊 Dashboards & Ports

| Component | Port | URL |
|-----------|------|-----|
| **Your App** | 3000 | http://localhost:3000 |
| **Grafana** | 3001 | http://localhost:3001 |
| **Prometheus** | 9090 | http://localhost:9090 |
| **InfluxDB** | 8086 | http://localhost:8086 |
| **Monika** | 3100 | http://localhost:3100 |
| **cAdvisor** | 8080 | http://localhost:8080 |

## 📈 Key Metrics Collected

### HTTP/Performance
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (5xx, 4xx)
- Success rate (%)

### Business
- Cart operations (add/remove)
- Product views
- Checkout attempts (success/failed/started)

### Infrastructure
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

### Monitoring
- Service uptime
- Endpoint availability
- SSL certificate expiration

## 🔍 Grafana Dashboards

### Dashboard 1: Application Metrics
- Request rate and trends
- Response time distribution
- Error tracking
- Cart & checkout metrics
- Database performance

### Dashboard 2: Uptime & Availability
- Service health status
- Success rate over 24h
- Response time trends
- Endpoint monitoring

## 💻 Common Commands

### Start/Stop Services
```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart grafana
docker-compose restart monika
```

### Check Health
```bash
# Application health
curl http://localhost:3000/api/health

# View metrics
curl http://localhost:3000/api/metrics | head -30

# Prometheus targets
open http://localhost:9090/targets
```

### Generate Test Metrics
```bash
# Visit your app
curl http://localhost:3000
curl http://localhost:3000/products
curl http://localhost:3000/api/products

# Then check Grafana after 30 seconds
```

## 🚨 Alerts Configured

### Monika Probes

| Endpoint | Interval | Alert Threshold |
|----------|----------|-----------------|
| Homepage | 60s | Response > 5s OR Status ≠ 200 |
| API | 30s | Response > 3s OR Status ≠ 200 |
| Products | 60s | Status ≠ 200 |
| Checkout | 120s | Status ≠ 200 |
| Admin | 300s | Status ≠ 200 |
| SSL | 24h | Expires < 30 days |

## 📝 Files Structure

### New Files Created
```
monika/
  └── monika.json              # Probe configuration

grafana/provisioning/
  ├── datasources/
  │   └── prometheus.yml       # Data sources
  └── dashboards/
      ├── application.json     # App metrics dashboard
      ├── uptime.json          # Uptime dashboard
      └── dashboards.yml       # Provisioning config

app/api/
  ├── metrics/route.ts         # Metrics endpoint
  └── health/route.ts          # Health check

lib/
  └── metrics.ts               # Metrics library
```

### Updated Files
```
docker-compose.yml             # Added services
prometheus.yml                 # Added targets
package.json                   # Added dependencies
```

## 🔧 Configuration

### Change Monika Email Alerts

Edit `monika/monika.json`:
```json
"notifications": [
  {
    "data": {
      "from": "alerts@yourcompany.com",
      "to": ["devops@yourcompany.com"]
    }
  }
]
```

### Customize Prometheus Scrape Interval

Edit `prometheus.yml`:
```yaml
global:
  scrape_interval: 15s  # Change this
```

### Add More Monitoring Probes

Edit `monika/monika.json`:
```json
"probes": [
  {
    "id": "new-endpoint",
    "name": "My Endpoint",
    "interval": 60,
    "requests": [
      { "url": "http://app:3000/my-endpoint" }
    ]
  }
]
```

## 📊 Sample PromQL Queries

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# P95 response time
histogram_quantile(0.95, http_request_duration_seconds_bucket)

# Success rate
(rate(http_requests_total{status=~"2.."}[5m]) / rate(http_requests_total[5m])) * 100

# Cart success rate
rate(cart_operations_total{status="success"}[5m]) / rate(cart_operations_total[5m]) * 100

# Checkout conversion
rate(checkout_attempts_total{status="success"}[5m]) / rate(checkout_attempts_total[5m]) * 100
```

## 🐛 Troubleshooting

### No metrics in Grafana?
1. Check app is running: `curl http://localhost:3000`
2. Check metrics endpoint: `curl http://localhost:3000/api/metrics`
3. Check Prometheus targets: http://localhost:9090/targets
4. Wait 30 seconds and refresh Grafana

### Monika not monitoring?
1. Check Monika is running: `docker-compose logs monika`
2. Verify app is accessible: `docker-compose exec monika curl http://app:3000`
3. Check `monika/monika.json` syntax
4. Restart: `docker-compose restart monika`

### InfluxDB not working?
1. Check InfluxDB health: `curl http://localhost:8086/api/v2/ready`
2. View logs: `docker-compose logs influxdb`
3. Restart: `docker-compose restart influxdb`

## 📚 Documentation

- **Full Guide**: `MONITORING.md` (detailed documentation)
- **Setup Guide**: `MONITORING_SETUP.md` (step-by-step)
- **Instrumentation**: `METRICS_INSTRUMENTATION.md` (custom metrics)
- **Integration**: `INTEGRATION_SUMMARY.md` (overview)

## 🎯 Next Steps

1. ✅ Start the stack
2. ✅ Visit Grafana dashboard
3. ✅ Generate traffic on your app
4. ✅ Review metrics
5. ⚡ Configure email alerts
6. 📊 Create custom dashboards
7. 🚨 Set up alert rules

## 💡 Pro Tips

- **Bookmark Grafana**: Set it as a favorite
- **Use keyboard shortcuts**: Ctrl+K in Grafana for quick search
- **Create saved searches**: In Prometheus for recurring queries
- **Export dashboards**: Grafana → Dashboard → Share → Export JSON
- **Version control dashboards**: Commit JSON to git for team sharing
- **Set up notifications**: Configure Slack, PagerDuty, etc. in Grafana alerts

## 🆘 Need Help?

Check these files in order:
1. This file (you are here)
2. `MONITORING_SETUP.md` (quick start)
3. `MONITORING.md` (complete guide)
4. Official docs:
   - https://monika.hyperjump.tech/
   - https://grafana.com/docs/
   - https://prometheus.io/docs/

---

**Happy Monitoring! 📈**
