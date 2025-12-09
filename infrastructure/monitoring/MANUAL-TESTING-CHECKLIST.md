# Quick Monitoring Verification Checklist

## 🚀 Manual Testing Guide - Production Monitoring

### Step 1: Wait for Grafana to Initialize
⏱️ **Wait 2-3 minutes** after restart for Grafana to fully start up

Check status:
```powershell
cd infrastructure/monitoring
.\health-check.ps1
```

All services should show ✅ HEALTHY

---

### Step 2: Access Grafana
🌐 **URL:** http://localhost:3000

**Login Credentials:**
- Username: `admin`
- Password: `admin` (you'll be prompted to change it)

---

### Step 3: Verify Datasources
📊 **Navigation:** Configuration (⚙️) → Data Sources

**Expected datasources:**
- ✅ Prometheus (default) - http://prometheus:9090
- ✅ Loki - http://loki:3100

**Test each datasource:**
1. Click datasource name
2. Scroll to bottom
3. Click "Save & Test"
4. Should show green success message

---

### Step 4: Check Dashboards
📈 **Navigation:** Dashboards (☰) → Browse

**Expected dashboards in "Application" folder:**
1. ✅ **Application Overview** (8 panels)
   - Request Rate
   - Error Rate
   - Response Time P95
   - Memory Usage
   - CPU Usage
   - Active Connections
   - Top Endpoints
   - Slowest Endpoints

2. ✅ **Infrastructure Metrics** (7 panels)
   - Container CPU
   - Container Memory
   - Disk Usage
   - Network I/O
   - Pod Status
   - Container Restarts
   - System Load

3. ✅ **Business Metrics** (10 panels)
   - User Registrations
   - Active Users
   - Property Views
   - Contact Requests
   - Search Activity
   - Login Success Rate
   - Favorites Added
   - Top Properties
   - Payment Transactions
   - Revenue (EUR)

**If dashboards show "No data":**
- Check time range (top right) - set to "Last 6 hours"
- Verify backend application is exposing metrics at http://localhost:5000/metrics
- Check Prometheus targets: http://localhost:9090/targets

---

### Step 5: Verify Prometheus Targets
🎯 **URL:** http://localhost:9090/targets

**Expected targets:**
- ✅ Backend application (localhost:5000/metrics) - UP
- ✅ Prometheus self-monitoring - UP

**If targets show DOWN:**
```powershell
# Check if backend is running
docker ps | findstr backend

# Check metrics endpoint
curl http://localhost:5000/metrics
```

---

### Step 6: Check Alert Rules
⚠️ **URL:** http://localhost:9090/alerts

**Expected alert rules (should be "Inactive" if system is healthy):**

**Application Alerts:**
- HighErrorRate (critical)
- SlowResponseTime (warning)
- HighMemoryUsage (warning)
- HighCPUUsage (warning)

**Availability Alerts:**
- ServiceDown (critical)
- DatabaseDown (critical)

**Backup Alerts:**
- BackupJobFailed (critical)
- BackupTooOld (warning)

---

### Step 7: Explore Logs in Loki
📝 **Navigation:** Grafana → Explore (compass icon 🧭) → Select "Loki" datasource

**Test queries:**

1. **All backend logs:**
   ```logql
   {job="backend"}
   ```

2. **Error logs only:**
   ```logql
   {job="backend"} |= "ERROR"
   ```

3. **Last 5 minutes of logs:**
   ```logql
   {job="backend"} | json
   ```

**If no logs appear:**
- Check Promtail is running: `docker ps | findstr promtail`
- Verify log directory exists: `ls ../../backend/logs/`
- Check Loki: http://localhost:3100/ready

---

### Step 8: Configure Alerting (Optional)

**Create `.env` file:**
```powershell
cd infrastructure/monitoring
cp .env.example .env
notepad .env
```

**Required configuration:**
```env
# Slack Webhook (get from https://api.slack.com/messaging/webhooks)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Email Settings
ALERT_EMAIL_FROM=alerts@yourdomain.com
ALERT_EMAIL_CRITICAL=oncall@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Grafana Admin Password
GF_SECURITY_ADMIN_PASSWORD=your-secure-password
```

**Restart Alertmanager after .env changes:**
```powershell
docker-compose -f docker-compose.monitoring.yml restart alertmanager
```

---

### Step 9: Test Alert Delivery (Optional)

⚠️ **Only do this if you configured .env with Slack/email**

**Test 1: Service Down Alert**
```powershell
# Stop backend to trigger ServiceDown alert
docker stop backend-app

# Wait 2 minutes, then check Alertmanager
# Open: http://localhost:9093/#/alerts

# Restore service
docker start backend-app
```

**Test 2: Manual Test Alert**
```powershell
# Send test notification to Alertmanager
$body = @{
    alerts = @(
        @{
            labels = @{
                alertname = "TestAlert"
                severity = "warning"
            }
            annotations = @{
                description = "This is a test alert from manual verification"
            }
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:9093/api/v1/alerts" -Method Post -Body $body -ContentType "application/json"
```

---

### Step 10: Verify Alertmanager
📬 **URL:** http://localhost:9093

**Check:**
- ✅ Alertmanager UI loads
- ✅ "Alerts" tab shows no active alerts (system healthy)
- ✅ "Silences" tab accessible
- ✅ "Status" tab shows configuration loaded

---

## ✅ Verification Checklist

Mark each item as you verify:

- [ ] Grafana accessible at http://localhost:3000
- [ ] Successfully logged in (admin/admin)
- [ ] Changed default admin password
- [ ] Prometheus datasource connected (green checkmark)
- [ ] Loki datasource connected (green checkmark)
- [ ] All 3 dashboards visible in "Application" folder
- [ ] Application Overview dashboard shows data
- [ ] Infrastructure Metrics dashboard shows data
- [ ] Business Metrics dashboard shows data
- [ ] Prometheus targets page shows backend UP
- [ ] Alert rules visible at http://localhost:9090/alerts
- [ ] Loki Explore shows backend logs
- [ ] Alertmanager UI accessible at http://localhost:9093
- [ ] (Optional) .env configured with Slack/email
- [ ] (Optional) Test alert delivered successfully

---

## 🐛 Common Issues & Solutions

### Issue: Grafana shows "No data"
**Solutions:**
1. Change time range to "Last 24 hours"
2. Verify backend is running and exposing /metrics
3. Check Prometheus targets are UP
4. Wait 1-2 minutes for first scrape

### Issue: Dashboards not showing
**Solutions:**
1. Check browser console for errors (F12)
2. Verify provisioning config: `docker exec grafana ls /etc/grafana/provisioning/dashboards`
3. Manually import from: `infrastructure/monitoring/grafana/dashboards/`

### Issue: Logs not appearing in Loki
**Solutions:**
1. Check Promtail logs: `docker logs promtail`
2. Verify log directory: `ls backend/logs/`
3. Create test log: `echo "Test log" > backend/logs/test.log`
4. Restart Promtail: `docker-compose -f docker-compose.monitoring.yml restart promtail`

### Issue: Alerts not firing
**Solutions:**
1. Verify .env file exists and has correct values
2. Check Alertmanager config loaded: http://localhost:9093
3. Test Slack webhook manually with curl
4. Check Alertmanager logs: `docker logs alertmanager`

---

## 📚 Additional Resources

- **Full Guide:** `docs/PRODUCTION-MONITORING-GUIDE.md`
- **Backup System:** `docs/BACKUP-SYSTEM-GUIDE.md`
- **Docker Guide:** `docs/DOCKER-GUIDE.md`

---

## 🎯 Next Steps After Verification

Once monitoring is verified, we can continue with:

1. **Task #2: Kubernetes Orchestration**
   - Create Helm charts
   - Configure HPA (Horizontal Pod Autoscaler)
   - Set up Ingress with TLS

2. **Task #6: Production Pipeline**
   - GitHub Actions workflow
   - Manual approval gates
   - Automated backup before deployment
   - Rollback mechanism

3. **Task #5: Canary Deployment**
   - Feature flag integration
   - Traffic splitting (90/10 → 50/50 → 0/100)
   - Automated rollback on errors

---

**When ready to continue, just say:**
- "continue with kubernetes" (Task #2)
- "continue with production pipeline" (Task #6)
- "continue with canary deployment" (Task #5)

---

**Status:** ✅ Production Monitoring System deployed and ready for verification!
**Last Updated:** 2025-12-07 15:20
