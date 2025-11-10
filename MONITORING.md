# Ru2ya Monitoring & Observability Guide

This document explains the complete monitoring setup for the Ru2ya e-commerce platform using Monika, Grafana, Prometheus, and InfluxDB.

## Overview

The monitoring stack consists of:
- **Monika**: Uptime monitoring and synthetic testing
- **Grafana**: Visualization dashboard (port 3001)
- **Prometheus**: Metrics collection and storage
- **InfluxDB**: Time-series database for high-volume metrics
- **cAdvisor**: Container metrics collection

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Ru2ya Application                      │
│         (Metrics exposed at /api/metrics)                 │
└────────────┬────────────────────────────────────────────┘
             │
             ├──► Prometheus (port 9090)
             │    - Scrapes /api/metrics every 30s
             │    - Stores metrics for 15 days
             │
             ├──► InfluxDB (port 8086)
             │    - Custom metric ingestion
             │    - High-volume time-series data
             │
             ├──► Monika (port 3100)
             │    - Uptime monitoring
             │    - Synthetic tests
             │    - Alert notifications
             │
             └──► cAdvisor (port 8080)
                  - Container metrics
                  - Resource utilization

             All visualized in Grafana (port 3001)
```

## Services & Ports

| Service | Port | Purpose |
|---------|------|---------|
| Application | 3000 | Main Ru2ya app |
| Grafana | 3001 | Dashboards |
| Prometheus | 9090 | Metrics storage & API |
| InfluxDB | 8086 | Time-series database |
| Monika | 3100 | Uptime monitoring |
| cAdvisor | 8080 | Container metrics |

## Monitoring Endpoints

### Application Metrics
- **URL**: `http://localhost:3000/api/metrics`
- **Format**: Prometheus text format
- **Scrape Interval**: 30 seconds
- **Content**: Application and business metrics

### Health Check
- **URL**: `http://localhost:3000/api/health`
- **Method**: GET
- **Response**: JSON with system health status

## Metrics Collected

### Application Metrics

#### HTTP Metrics
- `http_requests_total`: Total HTTP requests by method, route, and status
- `http_request_duration_seconds`: Request duration histogram
- Request rate (calculated from above)

#### Business Metrics
- `cart_operations_total`: Shopping cart add/remove operations
- `product_views_total`: Product view counts by product ID
- `checkout_attempts_total`: Checkout attempts by status (success/failed/started)

#### Database Metrics
- `database_query_duration_seconds`: Query execution time histogram
- `database_connections`: Active database connection count

### Infrastructure Metrics (from cAdvisor)
- Container CPU usage
- Container memory usage
- Network I/O metrics
- Filesystem metrics

## Monika Uptime Monitoring

Monika monitors the following endpoints:

### Probes Configured

1. **Homepage Availability**
   - Interval: 60 seconds
   - Checks: `GET http://app:3000`
   - Alerts: Status != 200, Response time > 5s

2. **API Health**
   - Interval: 30 seconds
   - Checks: `GET http://app:3000/api/products`
   - Alerts: Status != 200, Response time > 3s

3. **Products Page**
   - Interval: 60 seconds
   - Checks: `GET http://app:3000/products`

4. **Checkout Page**
   - Interval: 120 seconds
   - Checks: `GET http://app:3000/checkout`

5. **Admin Dashboard**
   - Interval: 300 seconds
   - Checks: `GET http://app:3000/x7k9m2p`

6. **SSL Certificate**
   - Interval: 86400 seconds (daily)
   - Alerts: Certificate expires in < 30 days

## Grafana Dashboards

### Dashboard 1: Application Metrics (`/d/ru2ya-app-metrics`)

Shows:
- **Request Rate**: Requests per second by route
- **Error Requests**: 5xx error count and trends
- **Response Time**: P95 and P99 response time percentiles
- **Cart Operations**: Shopping cart activity
- **Checkout Status**: Pie chart of checkout outcomes
- **Database Performance**: Query duration by type

### Dashboard 2: Uptime & Availability (`/d/ru2ya-uptime`)

Shows:
- **Service Status Gauges**: Prometheus, cAdvisor, App status
- **Success Rate**: Overall service success percentage
- **Response Time Distribution**: P50, P95, P99 response times
- **24-hour Uptime Timeline**: Visual representation of availability

## Accessing the Monitoring Stack

### After Starting Docker Containers

```bash
docker-compose up -d
```

Once running:

1. **Grafana**: http://localhost:3001
   - Default username: `admin`
   - Default password: `admin`
   - First login will prompt to change password

2. **Prometheus**: http://localhost:9090
   - Metrics explorer
   - Query interface
   - Target health status

3. **InfluxDB**: http://localhost:8086
   - Web UI for database management
   - Admin user: `admin`
   - Password: `admin`

4. **Monika**: http://localhost:3100
   - Monitoring dashboard
   - Alert history
   - Probe status

5. **cAdvisor**: http://localhost:8080
   - Container metrics
   - Performance statistics

## Configuration Files

### Monika Configuration
- **File**: `./monika/monika.json`
- **Purpose**: Define uptime probes, monitoring intervals, and alerts
- **Edit to**: Add/remove endpoints, change alert thresholds

### Prometheus Configuration
- **File**: `./prometheus.yml`
- **Purpose**: Define scrape jobs and alert rules
- **Edit to**: Change scrape intervals, add new targets

### Grafana Provisioning
- **Datasources**: `./grafana/provisioning/datasources/prometheus.yml`
- **Dashboards**: `./grafana/provisioning/dashboards/*.json`
- **Purpose**: Auto-configure datasources and dashboards on startup

## Environment Variables

For InfluxDB integration (optional):

```bash
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_TOKEN=your_token_here
INFLUXDB_ORG=ru2ya
INFLUXDB_BUCKET=metrics
```

## Common Queries

### Prometheus PromQL Examples

Get request rate:
```
rate(http_requests_total[5m])
```

Get error rate:
```
rate(http_requests_total{status=~"5.."}[5m])
```

Get P95 response time:
```
histogram_quantile(0.95, http_request_duration_seconds_bucket)
```

Get success rate percentage:
```
(rate(http_requests_total{status=~"2.."}[5m]) / rate(http_requests_total[5m])) * 100
```

Get cart operation success rate:
```
rate(cart_operations_total{status="success"}[5m]) / rate(cart_operations_total[5m]) * 100
```

## Alerts & Notifications

### Alert Channels Configured

- **Email (SendGrid)**: Requires `SENDGRID_API_KEY` environment variable
- **Console**: Logs alerts to standard output

### Setting Up Email Alerts

1. Get SendGrid API key from https://app.sendgrid.com/settings/api_keys
2. Set environment variable:
   ```bash
   export SENDGRID_API_KEY=your_key_here
   ```
3. Update `monika/monika.json` with your email addresses

## Troubleshooting

### Metrics not appearing in Grafana

1. Check if metrics endpoint is accessible:
   ```bash
   curl http://localhost:3000/api/metrics | head -20
   ```

2. Verify Prometheus scrape target:
   - Go to http://localhost:9090/targets
   - Check if 'app' target is healthy

3. Check logs:
   ```bash
   docker-compose logs prometheus
   docker-compose logs app
   ```

### Monika not monitoring endpoints

1. Verify Monika container is running:
   ```bash
   docker-compose logs monika
   ```

2. Check `monika/monika.json` configuration syntax

3. Ensure endpoints are accessible from Monika container:
   ```bash
   docker-compose exec monika curl http://app:3000
   ```

### InfluxDB connection issues

1. Verify InfluxDB is running:
   ```bash
   docker-compose logs influxdb
   ```

2. Check connection parameters in application code

3. Test connection:
   ```bash
   curl http://localhost:8086/api/v2/ready
   ```

## Performance Tuning

### For High-Volume Metrics

1. **Increase Prometheus retention**:
   - Edit `prometheus.yml`
   - Add: `--storage.tsdb.retention.time=30d`

2. **Use InfluxDB for custom metrics**:
   - Implement `writeMetricToInfluxDB()` in application code
   - Better for time-series with many labels

3. **Adjust scrape intervals**:
   - Decrease for real-time monitoring (but increases load)
   - Increase for less frequent monitoring

### Memory Optimization

- Prometheus: Default 2GB, can reduce with `--storage.tsdb.max-block-duration=1h`
- Grafana: Default 512MB, adjust as needed
- InfluxDB: Default 1GB, tune based on retention policy

## Next Steps

1. **Customize Monika probes**: Add more endpoints to monitor in `monika/monika.json`
2. **Create custom dashboards**: Build dashboards in Grafana UI
3. **Set up alerts**: Configure Monika to send alerts for SLA violations
4. **Export metrics**: Integrate with external monitoring services
5. **Implement custom metrics**: Add business-specific metrics to your application

## References

- [Monika Documentation](https://monika.hyperjump.tech/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [InfluxDB Documentation](https://docs.influxdata.com/)
- [prom-client (Node.js)](https://github.com/siimon/prom-client)
