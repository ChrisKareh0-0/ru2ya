# Monitoring Stack Checklist

Use this checklist to verify your monitoring setup is working correctly.

## ✅ Pre-Deployment Checklist

- [ ] `docker-compose.yml` updated with new services
- [ ] `prometheus.yml` updated with app metrics scraping
- [ ] `package.json` dependencies added (prom-client, influx)
- [ ] Monika configuration in `monika/monika.json` created
- [ ] Grafana provisioning files created:
  - [ ] `grafana/provisioning/datasources/prometheus.yml`
  - [ ] `grafana/provisioning/dashboards/application.json`
  - [ ] `grafana/provisioning/dashboards/uptime.json`
  - [ ] `grafana/provisioning/dashboards/dashboards.yml`
- [ ] API routes created:
  - [ ] `app/api/metrics/route.ts`
  - [ ] `app/api/health/route.ts`
- [ ] Metrics library created: `lib/metrics.ts`
- [ ] Documentation files created:
  - [ ] QUICK_REFERENCE.md
  - [ ] MONITORING.md
  - [ ] MONITORING_SETUP.md
  - [ ] INTEGRATION_SUMMARY.md
  - [ ] METRICS_INSTRUMENTATION.md

## ✅ Deployment Checklist

- [ ] Run `npm install` to install new dependencies
- [ ] Run `docker-compose up -d` to start services
- [ ] Wait 30 seconds for all services to start
- [ ] Run `docker-compose ps` and verify all containers are running:
  - [ ] app (Healthy)
  - [ ] prometheus (Up)
  - [ ] grafana (Up)
  - [ ] influxdb (Healthy)
  - [ ] monika (Healthy)
  - [ ] cadvisor (Up)

## ✅ Verification Checklist

### Application Endpoints
- [ ] Application running: `curl http://localhost:3000` → Should return HTML
- [ ] Metrics endpoint: `curl http://localhost:3000/api/metrics` → Should return Prometheus format
- [ ] Health endpoint: `curl http://localhost:3000/api/health` → Should return JSON with status

### Prometheus
- [ ] Access http://localhost:9090
- [ ] Go to Status → Targets
- [ ] Verify all targets are "UP" (green):
  - [ ] prometheus job (localhost:9090)
  - [ ] cadvisor job (cadvisor:8080)
  - [ ] app job (app:3000)
  - [ ] influxdb job (influxdb:8086)

### Grafana
- [ ] Access http://localhost:3001
- [ ] Login with admin/admin
- [ ] Verify Grafana dashboard loads
- [ ] Check Dashboards section:
  - [ ] "Ru2ya Application Metrics" dashboard exists
  - [ ] "Ru2ya Uptime & Availability" dashboard exists
- [ ] Click on a dashboard and verify data is loading:
  - [ ] Panels show graphs (not "No data")
  - [ ] Timestamps are recent (within last 5 minutes)

### InfluxDB
- [ ] Access http://localhost:8086
- [ ] Login with admin/admin
- [ ] Database "ru2ya" is created
- [ ] Can see data being written (Data Explorer)

### Monika
- [ ] Access http://localhost:3100
- [ ] Verify monitoring dashboard loads
- [ ] Check probe status:
  - [ ] Homepage probe (Active)
  - [ ] API Health probe (Active)
  - [ ] Products page probe (Active)
  - [ ] Checkout probe (Active)
  - [ ] Admin dashboard probe (Active)

## ✅ Metrics Collection Checklist

- [ ] Generate traffic to application:
  - [ ] `curl http://localhost:3000`
  - [ ] `curl http://localhost:3000/products`
  - [ ] `curl http://localhost:3000/api/products`

- [ ] Wait 30+ seconds for Prometheus to scrape

- [ ] Verify metrics in Prometheus:
  - [ ] http://localhost:9090 → Graph
  - [ ] Search: `http_requests_total`
  - [ ] Should see metrics from requests made above

- [ ] Verify metrics in Grafana:
  - [ ] Open "Ru2ya Application Metrics" dashboard
  - [ ] Refresh page (F5)
  - [ ] Should see graphs with data

## ✅ Monitoring Configuration Checklist

### Monika Configuration
- [ ] Reviewed `monika/monika.json`
- [ ] All probes are configured:
  - [ ] Homepage probe
  - [ ] API probe
  - [ ] Products page probe
  - [ ] Checkout page probe
  - [ ] Admin dashboard probe
  - [ ] SSL certificate probe
- [ ] Alert thresholds make sense for your use case
- [ ] Notification channels configured (if using email):
  - [ ] SendGrid API key available
  - [ ] Email addresses updated

### Prometheus Configuration
- [ ] Reviewed `prometheus.yml`
- [ ] Scrape intervals are appropriate:
  - [ ] App metrics: 30 seconds
  - [ ] cAdvisor: 15 seconds
- [ ] All target jobs are defined

### Grafana Configuration
- [ ] Reviewed dashboard JSON files
- [ ] Dashboards configured with:
  - [ ] Prometheus datasource
  - [ ] InfluxDB datasource (optional)
  - [ ] Appropriate time ranges and refresh intervals

## ✅ Alert Configuration Checklist (Optional)

- [ ] SendGrid API key obtained (if using email alerts)
- [ ] `monika/monika.json` updated with:
  - [ ] SENDGRID_API_KEY environment variable
  - [ ] Email addresses in notification channel
- [ ] Test email alerts:
  - [ ] Restart Monika: `docker-compose restart monika`
  - [ ] Monitor log output: `docker-compose logs monika -f`
  - [ ] Check if alert test emails are sent

## ✅ Custom Metrics Checklist (Optional)

- [ ] Reviewed `METRICS_INSTRUMENTATION.md`
- [ ] Decided which custom metrics to add:
  - [ ] Cart operations
  - [ ] Product views
  - [ ] Checkout tracking
  - [ ] Database queries
  - [ ] Custom business metrics
- [ ] Added metrics to relevant API routes
- [ ] Created Grafana panels for custom metrics
- [ ] Verified custom metrics appear in:
  - [ ] Prometheus (http://localhost:9090)
  - [ ] Grafana dashboards

## ✅ Documentation Checklist

- [ ] Read QUICK_REFERENCE.md (overview)
- [ ] Read MONITORING_SETUP.md (step-by-step)
- [ ] Reviewed MONITORING.md (complete guide)
- [ ] Reviewed INTEGRATION_SUMMARY.md (what was added)
- [ ] Reviewed METRICS_INSTRUMENTATION.md (custom metrics)
- [ ] Saved documentation links for team reference

## ✅ Team Handoff Checklist

- [ ] Documented Grafana dashboard locations
- [ ] Created runbook for common issues
- [ ] Set up Slack/email notifications
- [ ] Documented alert escalation procedures
- [ ] Created on-call schedule
- [ ] Added monitoring dashboards to monitoring page
- [ ] Documented SLA targets and thresholds
- [ ] Shared documentation with team

## ✅ Maintenance Checklist

- [ ] Set up log rotation for Monika logs
- [ ] Plan for Prometheus data retention
- [ ] Monitor disk usage for metrics storage
- [ ] Review alerts regularly for accuracy
- [ ] Update Monika probes when adding new endpoints
- [ ] Backup Grafana dashboards regularly
- [ ] Test alert notification channels monthly

## 🔧 Troubleshooting Checklist

If something isn't working:

- [ ] Check Docker containers are running: `docker-compose ps`
- [ ] Check container logs: `docker-compose logs <service_name>`
- [ ] Verify network connectivity: `docker-compose exec <service> ping <other_service>`
- [ ] Check firewall rules for port access
- [ ] Verify environment variables are set
- [ ] Review JSON configuration files for syntax errors
- [ ] Clear browser cache and refresh page
- [ ] Restart affected services: `docker-compose restart <service_name>`
- [ ] Check official documentation for the service
- [ ] Ask in project chat or create an issue

## 📋 Post-Launch Checklist

- [ ] Monitor metrics for first 24 hours
- [ ] Verify all alert channels are working
- [ ] Check for any "No data" panels in Grafana
- [ ] Adjust alert thresholds based on baseline metrics
- [ ] Document any customizations made
- [ ] Add monitoring setup to runbook
- [ ] Schedule regular dashboard reviews
- [ ] Plan for scaling metrics storage if needed

## 🎯 Success Criteria

Your monitoring stack is working correctly when:

✅ All Docker containers are running and healthy
✅ Prometheus is scraping metrics from the app
✅ Grafana dashboards are displaying real-time data
✅ Monika is actively monitoring endpoints
✅ InfluxDB is storing custom metrics
✅ Email alerts (if configured) are being delivered
✅ Logs show no errors or warnings
✅ Team can access dashboards and understand the data

## 📞 Support

If you encounter issues:

1. Check the QUICK_REFERENCE.md troubleshooting section
2. Review MONITORING_SETUP.md for setup issues
3. Consult MONITORING.md for detailed explanations
4. Check service logs: `docker-compose logs`
5. Verify endpoints are accessible
6. Review Docker Compose network configuration
7. Check official documentation for each tool

---

**Last Updated**: November 10, 2025
**Status**: ✅ Complete
