# Monitoring Stack (Staging)

This folder contains a complete monitoring stack for staging: **Prometheus** (metrics collection), **Alertmanager** (alert routing), **Grafana** (dashboards), **Loki** (log aggregation), and **Promtail** (log forwarder).

## 📋 Prerequisites

- Docker and Docker Compose installed
- Backend API running and accessible (writes logs to `backend/logs/`)
- (Optional) Slack webhook URL or email SMTP config for alerts

## 🚀 Quick Start

### 1. Configure environment variables (optional)

Copy the example environment file and configure alert receivers:

```powershell
# From infrastructure/monitoring folder
cp .env.example .env
# Edit .env and add your SLACK_WEBHOOK_URL or email credentials
```

### 2. Start the monitoring stack

```powershell
# From repo root
cd infrastructure/monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

### 3. Verify services are running

```powershell
docker compose -f docker-compose.monitoring.yml ps
```

You should see 5 running containers: prometheus, alertmanager, grafana, loki, promtail.

### 4. Access the UIs

- **Grafana**: http://localhost:3000 (default login: admin/admin)
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **Loki**: http://localhost:3100 (API only, view logs in Grafana)

## 📊 Using the Stack

### View metrics in Grafana

1. Open Grafana at http://localhost:3000
2. Login with admin/admin (or your configured password)
3. Go to "Dashboards" → you should see "Agence - Basic Monitoring" auto-imported
4. The dashboard shows:
   - CPU usage (process)
   - Memory (RSS)
   - HTTP P95 latency
   - 5xx error rate

### Query logs in Grafana

1. In Grafana, go to "Explore"
2. Select "Loki" datasource
3. Use LogQL queries like:
   - `{job="backend"}` — all backend logs
   - `{job="backend"} |= "error"` — filter errors
   - `{job="backend"} | json | level="error"` — structured error logs

### Check Prometheus targets

1. Open Prometheus at http://localhost:9090
2. Go to Status → Targets
3. Verify `agence-backend` target is UP (scraping backend /metrics)

### View active alerts

1. Open Alertmanager at http://localhost:9093
2. View firing alerts (if any)
3. Alerts are also visible in Prometheus → Alerts

## ⚙️ Configuration

### Backend metrics endpoint

The stack expects the backend to expose metrics at:
- **Default**: `http://host.docker.internal:5000/metrics` (for local dev)
- **Docker network**: Update `prometheus/prometheus.yml` target to `backend:5000` if running backend in same compose network

### Alert receivers

Edit `alertmanager/config.yml` to configure receivers:
- **Slack**: Set `SLACK_WEBHOOK_URL` in `.env`
- **Email**: Set SMTP variables in `.env` (SMTP_HOST, SMTP_USERNAME, etc.)
- **Other**: Add PagerDuty, webhook, or custom receivers

### Alert rules

Alert rules are defined in `prometheus/alerts.yml`:
- HighErrorRate: >5 server errors in 5min
- HighRequestLatency: P95 latency >1s
- HighMemoryUsage: >500MB
- HighCPUUsage: >80%

Adjust thresholds as needed for your staging environment.

## 🧪 Testing

### Generate test metrics

Start the backend and make requests to generate metrics:

```powershell
# Health check
Invoke-WebRequest http://localhost:5000/health

# View raw metrics
Invoke-WebRequest http://localhost:5000/metrics
```

### Generate test logs

Make API requests to generate logs. Logs are automatically picked up by Promtail from `backend/logs/`.

### Test alerts

To test alerting, you can temporarily lower thresholds in `prometheus/alerts.yml` or trigger conditions (e.g., generate errors, load test).

## 🛠️ Troubleshooting

### Backend metrics not showing

1. Check Prometheus targets: http://localhost:9090/targets
2. If target is DOWN:
   - Ensure backend is running on port 5000
   - Check if `host.docker.internal` resolves (Windows/Mac Docker Desktop)
   - On Linux, use `--add-host=host.docker.internal:host-gateway` in compose

### No logs in Loki

1. Check Promtail logs: `docker logs promtail`
2. Ensure backend is writing logs to `backend/logs/`
3. Verify volume mount in docker-compose.monitoring.yml

### Grafana dashboard not appearing

1. Check Grafana logs: `docker logs grafana`
2. Verify provisioning files in `grafana/provisioning/`
3. Dashboard JSON should be at `/var/lib/grafana/dashboards/agence-dashboard.json` inside container

### Alerts not firing

1. Check Prometheus rules: http://localhost:9090/rules
2. Verify alert conditions are met
3. Check Alertmanager config: http://localhost:9093

## 🧹 Cleanup

Stop and remove containers:

```powershell
docker compose -f docker-compose.monitoring.yml down
```

Remove volumes (warning: deletes all monitoring data):

```powershell
docker compose -f docker-compose.monitoring.yml down -v
```

## 📦 Production Deployment

For production staging:

1. **Use external volumes** or cloud storage for persistence
2. **Secure Grafana**: Change admin password, enable HTTPS
3. **Configure real alert receivers**: Slack, PagerDuty, email
4. **Set retention policies**: Configure Prometheus and Loki retention
5. **Monitor the monitors**: Add uptime checks for monitoring stack
6. **Scale Loki**: Use distributed mode for high log volume
7. **Add authentication**: Secure Prometheus/Alertmanager with auth proxy

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)

