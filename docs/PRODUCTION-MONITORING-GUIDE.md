# Production Monitoring System Guide

## 📊 Overview

Complete monitoring and observability stack for Agence Immobiliere application using:
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Visualization and dashboards
- **Alertmanager** - Alert routing and notification
- **Loki** - Log aggregation and querying
- **Promtail** - Log collection agent

## 🚀 Quick Start

### 1. Start Monitoring Stack

```powershell
cd infrastructure/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Access Dashboards

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Grafana | http://localhost:3000 | admin / admin |
| Prometheus | http://localhost:9090 | No auth |
| Alertmanager | http://localhost:9093 | No auth |
| Loki | http://localhost:3100 | No auth |

### 3. Configure Alerting

Copy environment file and configure:
```powershell
cp .env.example .env
# Edit .env with your Slack/email/PagerDuty credentials
```

Required environment variables:
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
ALERT_EMAIL_FROM=alerts@agence-immobiliere.com
ALERT_EMAIL_CRITICAL=oncall@agence-immobiliere.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
GF_SECURITY_ADMIN_PASSWORD=your-secure-password
```

## 📈 Dashboards

### Application Overview Dashboard
**8 Panels:**
1. **Request Rate** - Requests per second over time
2. **Error Rate** - 5xx errors (alert if > 5%)
3. **Response Time P95** - 95th percentile latency (alert if > 2s)
4. **Memory Usage** - Application memory consumption (alert if > 85%)
5. **CPU Usage** - CPU utilization percentage
6. **Active Connections** - MongoDB and HTTP connections
7. **Top Endpoints** - Most frequently accessed API routes
8. **Slowest Endpoints** - Response time by route

**Access:** Grafana → Application folder → Application Overview

### Infrastructure Metrics Dashboard
**7 Panels:**
1. **Container CPU** - CPU usage per container
2. **Container Memory** - Memory usage per container
3. **Disk Usage** - Storage utilization (green < 80%, yellow < 90%, red ≥ 90%)
4. **Network I/O** - Network traffic in/out
5. **Pod Status** - Running/Failed/Pending pods (Kubernetes)
6. **Container Restarts** - Restart count tracking
7. **System Load** - Host system load average

**Access:** Grafana → Application folder → Infrastructure Metrics

### Business Metrics Dashboard
**10 Panels:**
1. **User Registrations** - New signups in 24h
2. **Active Users** - Users logged in last 24h
3. **Property Views** - Total property page views
4. **Contact Requests** - Contact form submissions
5. **Search Activity** - Search queries performed
6. **Login Success Rate** - Authentication success %
7. **Favorites Added** - Properties favorited
8. **Top Properties** - Most viewed listings
9. **Payment Transactions** - Successful payments
10. **Revenue (EUR)** - Total revenue in 24h

**Access:** Grafana → Application folder → Business Metrics

## 🔔 Alert Rules

### Application Alerts

#### 1. HighErrorRate (Critical)
- **Condition:** Error rate > 5% for 5 minutes
- **Description:** Application experiencing high error rate
- **Action:** Check application logs, verify database connectivity
- **Notification:** Slack #critical-alerts, Email, PagerDuty

#### 2. SlowResponseTime (Warning)
- **Condition:** P95 response time > 2 seconds for 5 minutes
- **Description:** API response time degraded
- **Action:** Review slow query logs, check database indexes
- **Notification:** Slack #monitoring-alerts

#### 3. HighMemoryUsage (Warning)
- **Condition:** Memory usage > 85% for 5 minutes
- **Description:** Application memory consumption high
- **Action:** Check for memory leaks, consider scaling
- **Notification:** Slack #monitoring-alerts

#### 4. HighCPUUsage (Warning)
- **Condition:** CPU usage > 80% for 5 minutes
- **Description:** CPU utilization high
- **Action:** Check for CPU-intensive operations, consider scaling
- **Notification:** Slack #monitoring-alerts

### Availability Alerts

#### 5. ServiceDown (Critical)
- **Condition:** Service unreachable for 1 minute
- **Description:** Critical service unavailable
- **Action:** Immediate investigation required, check container status
- **Notification:** Slack #critical-alerts, Email, PagerDuty

#### 6. DatabaseDown (Critical)
- **Condition:** MongoDB unreachable for 1 minute
- **Description:** Database connection failed
- **Action:** Check MongoDB container, verify credentials
- **Notification:** Slack #critical-alerts, Email, PagerDuty

### Backup Alerts

#### 7. BackupJobFailed (Critical)
- **Condition:** Backup job exit code != 0
- **Description:** Backup script execution failed
- **Action:** Check backup logs, verify Azure connectivity
- **Notification:** Slack #ops-backups, Email

#### 8. BackupTooOld (Warning)
- **Condition:** Last backup older than 8 hours
- **Description:** Backup schedule may be broken
- **Action:** Verify cron jobs running, check disk space
- **Notification:** Slack #ops-backups, Email

## 📋 Log Querying with Loki

### Access Logs in Grafana

1. Open Grafana → Explore
2. Select "Loki" datasource
3. Use LogQL queries

### Common LogQL Queries

**All backend logs:**
```logql
{job="backend"}
```

**Error logs only:**
```logql
{job="backend"} |= "ERROR"
```

**Logs from specific container:**
```logql
{container="backend-app"} | json
```

**Filter by log level:**
```logql
{job="backend"} | json | level="error"
```

**HTTP 500 errors:**
```logql
{job="nginx-access"} | json | status="500"
```

**Rate of errors per minute:**
```logql
rate({job="backend"} |= "ERROR" [5m])
```

**Top 10 error messages:**
```logql
topk(10, sum by (message) (rate({job="backend"} |= "ERROR" [5m])))
```

## 🔍 Troubleshooting

### Prometheus Not Scraping Metrics

**Symptoms:** No data in dashboards

**Solutions:**
1. Check target status: http://localhost:9090/targets
2. Verify application exposes metrics endpoint:
   ```powershell
   curl http://localhost:5000/metrics
   ```
3. Check prometheus.yml configuration
4. Restart Prometheus:
   ```powershell
   docker-compose -f docker-compose.monitoring.yml restart prometheus
   ```

### Alerts Not Firing

**Symptoms:** No Slack/email notifications

**Solutions:**
1. Check Alertmanager status: http://localhost:9093
2. Verify environment variables in .env:
   ```powershell
   docker exec alertmanager env | grep SLACK
   ```
3. Test Slack webhook:
   ```powershell
   curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"Test alert"}'
   ```
4. Check Alertmanager logs:
   ```powershell
   docker logs alertmanager
   ```

### Grafana Dashboards Empty

**Symptoms:** Dashboards show "No data"

**Solutions:**
1. Verify Prometheus datasource: Grafana → Configuration → Data Sources
2. Test datasource connection (should show green check)
3. Check time range (default: Last 6 hours)
4. Verify metrics exist in Prometheus: http://localhost:9090/graph

### Loki Not Receiving Logs

**Symptoms:** No logs in Explore view

**Solutions:**
1. Check Promtail status:
   ```powershell
   docker logs promtail
   ```
2. Verify log file paths exist:
   ```powershell
   ls backend/logs/
   ```
3. Check Loki ingestion:
   ```powershell
   curl http://localhost:3100/ready
   ```
4. Restart Promtail:
   ```powershell
   docker-compose -f docker-compose.monitoring.yml restart promtail
   ```

## 🎯 Alert Testing

### Test Critical Alert

```powershell
# Temporarily stop backend service to trigger ServiceDown alert
docker stop backend-app

# Wait 2 minutes for alert to fire
# Check Alertmanager: http://localhost:9093/#/alerts

# Restore service
docker start backend-app
```

### Test High Error Rate Alert

```powershell
# Generate 500 errors
for ($i=1; $i -le 100; $i++) {
    curl http://localhost:5000/api/test-error
}
# Alert should fire within 5 minutes
```

### Silence Alerts

During maintenance windows:
1. Open Alertmanager: http://localhost:9093
2. Click "Silence" button
3. Add matchers (e.g., alertname="ServiceDown")
4. Set duration (e.g., 2 hours)
5. Add comment explaining maintenance

## 📊 Metrics Collection

### Application Metrics Exposed

Backend exposes Prometheus metrics at `/metrics`:

**HTTP Metrics:**
- `http_requests_total` - Total HTTP requests by method, route, status
- `http_request_duration_seconds` - Request latency histogram
- `http_requests_in_progress` - Current in-flight requests

**Business Metrics:**
- `user_registrations_total` - User signup counter
- `property_views_total` - Property page views
- `contact_requests_total` - Contact form submissions
- `payments_total` - Payment transactions
- `revenue_total` - Revenue in EUR

**System Metrics:**
- `nodejs_heap_size_total_bytes` - Node.js heap memory
- `nodejs_heap_size_used_bytes` - Used heap memory
- `process_cpu_user_seconds_total` - CPU time

**Database Metrics:**
- `mongodb_connections_active` - Active MongoDB connections
- `mongodb_operations_total` - DB operations by type
- `mongodb_query_duration_seconds` - Query execution time

### Custom Metrics

Add custom metrics in your code:

```javascript
const { register, Counter, Histogram, Gauge } = require('prom-client');

// Counter example
const customCounter = new Counter({
  name: 'custom_events_total',
  help: 'Total custom events',
  labelNames: ['type']
});
customCounter.labels('purchase').inc();

// Histogram example
const customHistogram = new Histogram({
  name: 'custom_duration_seconds',
  help: 'Custom operation duration',
  buckets: [0.1, 0.5, 1, 2, 5]
});
customHistogram.observe(operationDuration);

// Gauge example
const customGauge = new Gauge({
  name: 'custom_value',
  help: 'Current custom value'
});
customGauge.set(currentValue);
```

## 🔐 Security Best Practices

1. **Change Default Passwords:**
   ```env
   GF_SECURITY_ADMIN_PASSWORD=complex-password-here
   ```

2. **Enable HTTPS in Production:**
   - Use reverse proxy (Nginx/Traefik) with Let's Encrypt
   - Configure Grafana behind proxy

3. **Restrict Access:**
   - Use firewall rules to limit port access
   - Enable Grafana authentication (OAuth, LDAP)

4. **Secure Credentials:**
   - Never commit .env to version control
   - Use secrets management (Vault, AWS Secrets Manager)
   - Rotate API keys quarterly

5. **Enable Audit Logging:**
   ```yaml
   # grafana.ini
   [log]
   mode = console file
   level = info
   ```

## 📝 Maintenance Tasks

### Daily
- [ ] Review critical alerts (Slack #critical-alerts)
- [ ] Check dashboard health status
- [ ] Verify backup monitoring alerts

### Weekly
- [ ] Review slow query dashboard
- [ ] Analyze error rate trends
- [ ] Check disk usage forecast
- [ ] Review top resource consumers

### Monthly
- [ ] Update Grafana/Prometheus/Loki to latest versions
- [ ] Review and optimize alert thresholds
- [ ] Cleanup old Loki logs (auto-cleaned after 30 days)
- [ ] Performance review meeting with dashboards

## 🚨 Incident Response

### 1. Alert Received
- Check Alertmanager for details: http://localhost:9093
- Review related Grafana dashboards
- Check recent logs in Loki

### 2. Assess Impact
- User-facing impact: Check error rate and response time
- System health: Check infrastructure metrics
- Recent changes: Review deployment timeline

### 3. Mitigate
- **High errors:** Check application logs, rollback if needed
- **Slow response:** Investigate slow queries, scale if needed
- **Service down:** Check container status, restart if needed

### 4. Resolve
- Apply fix (code change, config update, scaling)
- Verify metrics return to normal
- Close alert in Alertmanager

### 5. Post-Mortem
- Document incident in Confluence/Wiki
- Update runbooks if needed
- Add monitoring for early detection

## 📚 Resources

- **Prometheus Query Language:** https://prometheus.io/docs/prometheus/latest/querying/basics/
- **LogQL (Loki):** https://grafana.com/docs/loki/latest/logql/
- **Grafana Dashboards:** https://grafana.com/grafana/dashboards/
- **Alertmanager Config:** https://prometheus.io/docs/alerting/latest/configuration/

## 🎯 Next Steps

1. **Complete Task #4 - Production Monitoring** ✅
   - [x] Deploy Prometheus with enhanced alerts
   - [x] Create 3 comprehensive Grafana dashboards
   - [x] Configure Alertmanager with multi-channel notifications
   - [x] Set up Loki centralized logging
   - [x] Deploy monitoring stack
   - [ ] Test alert delivery (manual testing recommended)

2. **Task #2 - Kubernetes Orchestration**
   - Deploy monitoring stack to K8s cluster
   - Configure ServiceMonitor for auto-discovery
   - Set up persistent volumes for Prometheus/Grafana/Loki

3. **Enhancements**
   - Add distributed tracing (Tempo)
   - Configure Grafana OnCall for on-call rotation
   - Set up anomaly detection (Prometheus ML)
   - Add SLI/SLO tracking dashboards

---

**Version:** 1.0  
**Last Updated:** 2025-12-07  
**Maintained By:** DevOps Team
