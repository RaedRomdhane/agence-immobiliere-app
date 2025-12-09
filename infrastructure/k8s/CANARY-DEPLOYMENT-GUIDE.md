# Canary Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Deployment Process](#deployment-process)
5. [Monitoring](#monitoring)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)

## Overview

Canary deployments allow you to test new versions of your application with a small subset of production traffic before rolling out to all users. This minimizes risk and allows for quick rollback if issues are detected.

### Key Features
- **Progressive Traffic Shifting**: 10% → 25% → 50% → 100%
- **Automated Rollback**: Triggered by metric thresholds
- **Multiple Routing Strategies**: Percentage, header, cookie-based
- **Real-time Monitoring**: Comparative metrics dashboard
- **Feature Flag Integration**: Application-level control

### Deployment Strategies

#### 1. Percentage-based Routing
NGINX Ingress routes X% of traffic to canary, rest to stable:
```yaml
canary:
  enabled: true
  trafficWeight: 10  # 10% to canary
```

#### 2. Header-based Routing
Force canary routing with HTTP header:
```bash
curl -H "X-Canary: always" https://api.agence-immobiliere.com/api/health
```

#### 3. Cookie-based Routing
Set cookie to route user to canary:
```bash
curl -b "canary=true" https://api.agence-immobiliere.com/api/health
```

#### 4. Feature Flag Control
Application-level feature flags for granular control:
```javascript
// Middleware checks feature flag
app.use('/api/new-feature', canaryFeatureFlag('new-feature'));
```

## Architecture

```
                                    ┌─────────────────┐
                                    │  NGINX Ingress  │
                                    │  Canary Rules   │
                                    └────────┬────────┘
                                             │
                        ┌────────────────────┴────────────────────┐
                        │                                         │
                   10% Traffic                               90% Traffic
                        │                                         │
                        ▼                                         ▼
              ┌──────────────────┐                    ┌──────────────────┐
              │  Canary Service  │                    │  Stable Service  │
              │  version: canary │                    │  version: stable │
              └──────────────────┘                    └──────────────────┘
                        │                                         │
                        ▼                                         ▼
              ┌──────────────────┐                    ┌──────────────────┐
              │  Canary Pods (1) │                    │  Stable Pods (3) │
              │  v1.1.0-canary   │                    │  v1.0.0          │
              └──────────────────┘                    └──────────────────┘
                        │                                         │
                        └─────────────────┬───────────────────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │   Prometheus    │
                                 │  Metrics Store  │
                                 └────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  Grafana        │
                                 │  Canary vs      │
                                 │  Stable Dashboard│
                                 └─────────────────┘
```

### Components

1. **NGINX Ingress Controller**
   - Routes traffic based on canary annotations
   - Supports weight, header, cookie-based routing
   - Configured via Kubernetes Ingress resources

2. **Canary Deployment**
   - Separate Kubernetes Deployment with `version: canary` label
   - Starts with 1 replica
   - Uses canary-tagged Docker images

3. **Canary Service**
   - Isolated ClusterIP service targeting canary pods
   - Allows separate metrics collection

4. **Prometheus**
   - Collects metrics from both canary and stable pods
   - Queries filter by `version` label

5. **Grafana Dashboard**
   - Side-by-side comparison of canary vs stable
   - Real-time alerting on metric divergence

6. **GitHub Actions Workflows**
   - Automated deployment and monitoring
   - Rollback triggers on threshold violations

## Prerequisites

### Required Tools
- `kubectl` v1.28+
- `helm` v3.13+
- Access to Kubernetes cluster with NGINX Ingress
- Docker registry access (GHCR)

### Cluster Requirements
- NGINX Ingress Controller installed
- Prometheus Operator (for ServiceMonitor)
- Cert-Manager (for TLS)
- Persistent storage for uploads

### Metrics Setup
Ensure backend exposes metrics with `version` label:
```javascript
// backend/metrics.js
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  labelNames: ['method', 'route', 'code', 'version']
});

// Middleware adds version label
app.use((req, res, next) => {
  res.locals.version = process.env.CANARY_DEPLOYMENT === 'true' ? 'canary' : 'stable';
  next();
});
```

## Deployment Process

### 1. Build Canary Image

```bash
# Tag with canary suffix
docker build -t ghcr.io/yourusername/agence-immobiliere-backend:v1.1.0-canary ./backend
docker push ghcr.io/yourusername/agence-immobiliere-backend:v1.1.0-canary
```

### 2. Deploy Canary (10% Traffic)

#### Option A: Using GitHub Actions (Recommended)

Navigate to Actions → Canary Deployment → Run workflow:
- **version**: `v1.1.0-canary`
- **traffic_weight**: `10`
- **auto_promote**: `false` (manual approval)

#### Option B: Manual Helm Deployment

```bash
helm upgrade agence-immobiliere ./infrastructure/k8s/helm/agence-immobiliere \
  --namespace production \
  --reuse-values \
  --set canary.enabled=true \
  --set canary.trafficWeight=10 \
  --set backend.canary.image.repository=ghcr.io/yourusername/agence-immobiliere-backend \
  --set backend.canary.image.tag=v1.1.0-canary \
  --wait
```

### 3. Monitor Canary Metrics

Open Grafana dashboard: **Canary Deployment Comparison**

Watch for:
- ✅ Error rate < 5%
- ✅ P95 latency < 2s
- ✅ No anomalous memory/CPU spikes
- ✅ Request rate matches traffic weight (~10%)

**Monitoring Period**: 15 minutes minimum

### 4. Gradual Promotion

If metrics are healthy, increase traffic:

```bash
# Increase to 25%
helm upgrade agence-immobiliere ./infrastructure/k8s/helm/agence-immobiliere \
  --namespace production \
  --reuse-values \
  --set canary.trafficWeight=25 \
  --wait

# Wait 10 minutes, monitor

# Increase to 50%
helm upgrade agence-immobiliere ./infrastructure/k8s/helm/agence-immobiliere \
  --namespace production \
  --reuse-values \
  --set canary.trafficWeight=50 \
  --wait

# Wait 15 minutes, monitor
```

### 5. Full Promotion (100%)

When confident, promote canary to stable:

```bash
# Update stable deployment to canary version
helm upgrade agence-immobiliere ./infrastructure/k8s/helm/agence-immobiliere \
  --namespace production \
  --reuse-values \
  --set backend.image.tag=v1.1.0-canary \
  --set canary.enabled=false \
  --wait

# Verify rollout
kubectl rollout status deployment/agence-immobiliere-backend -n production
```

### 6. Cleanup

```bash
# Remove canary deployment
kubectl delete deployment agence-immobiliere-backend-canary -n production
kubectl delete service agence-immobiliere-backend-canary -n production
kubectl delete ingress agence-immobiliere-canary -n production
```

## Monitoring

### Grafana Dashboards

#### 1. Canary Deployment Comparison
- **URL**: http://grafana:3000/d/canary-comparison
- **Panels**:
  - Request Rate (canary vs stable)
  - Error Rate Gauge (5xx errors)
  - Response Time P95/P99
  - Memory Usage
  - CPU Usage
  - Canary Traffic Percentage
  - Health Status

#### 2. Key Metrics to Watch

| Metric | Threshold | Action if Exceeded |
|--------|-----------|-------------------|
| Error Rate | > 5% | Immediate rollback |
| P95 Latency | > 2s | Immediate rollback |
| Error Rate Increase | +3% vs stable | Investigate, rollback if persists |
| Latency Increase | 1.5x vs stable | Investigate, rollback if persists |
| Memory Usage | > 512MB | Scale or rollback |

### Prometheus Queries

**Canary Error Rate:**
```promql
sum(rate(http_request_duration_seconds_count{version="canary",code=~"5.."}[5m])) 
/ sum(rate(http_request_duration_seconds_count{version="canary"}[5m])) * 100
```

**Stable Error Rate:**
```promql
sum(rate(http_request_duration_seconds_count{version!="canary",code=~"5.."}[5m])) 
/ sum(rate(http_request_duration_seconds_count{version!="canary"}[5m])) * 100
```

**Canary P95 Latency:**
```promql
histogram_quantile(0.95, 
  sum(rate(http_request_duration_seconds_bucket{version="canary"}[5m])) by (le)
)
```

**Traffic Distribution:**
```promql
sum(rate(http_request_duration_seconds_count{version="canary"}[5m])) 
/ (sum(rate(http_request_duration_seconds_count{version="canary"}[5m])) 
   + sum(rate(http_request_duration_seconds_count{version!="canary"}[5m]))) * 100
```

### Automated Rollback

The `canary-auto-rollback.yml` workflow runs every 5 minutes and automatically rolls back if:

1. **Absolute Thresholds**:
   - Error rate > 5%
   - P95 latency > 2s

2. **Relative Thresholds** (vs stable):
   - Error rate increase > 3%
   - Latency increase > 1.5x

**Rollback Time**: ~2 minutes from detection

### Manual Monitoring

```bash
# Check canary pod status
kubectl get pods -n production -l version=canary

# View canary logs
kubectl logs -n production -l version=canary --tail=100 -f

# Check canary service endpoints
kubectl get endpoints agence-immobiliere-backend-canary -n production

# Test canary directly
kubectl run test-canary --image=curlimages/curl:latest --rm -i --restart=Never -n production -- \
  curl -s http://agence-immobiliere-backend-canary:5000/health
```

## Rollback Procedures

### Automatic Rollback

The auto-rollback monitor will trigger rollback automatically. Check status:

```bash
# View recent workflow runs
gh workflow view "Canary Auto-Rollback Monitor"

# Check rollback incident reports
kubectl logs -n production -l job-name=rollback-job
```

### Manual Emergency Rollback

If you need to rollback immediately:

#### Option A: GitHub Actions
Navigate to Actions → Canary Deployment → Latest Run → Re-run failed jobs → Rollback

#### Option B: Helm Command

```bash
# Disable canary immediately
helm upgrade agence-immobiliere ./infrastructure/k8s/helm/agence-immobiliere \
  --namespace production \
  --reuse-values \
  --set canary.enabled=false \
  --wait --timeout=2m

# Verify canary pods are terminating
kubectl get pods -n production -l version=canary -w

# Check stable pods are healthy
kubectl get pods -n production -l version!=canary
kubectl rollout status deployment/agence-immobiliere-backend -n production
```

#### Option C: Scale to Zero

```bash
# Immediate traffic stop
kubectl scale deployment agence-immobiliere-backend-canary -n production --replicas=0

# Then disable properly
helm upgrade agence-immobiliere ./infrastructure/k8s/helm/agence-immobiliere \
  --namespace production \
  --reuse-values \
  --set canary.enabled=false \
  --wait
```

### Post-Rollback Actions

1. **Document Incident**:
   ```bash
   # Create incident report
   cat > incident-$(date +%Y%m%d-%H%M%S).md << EOF
   # Canary Rollback Incident
   
   **Date**: $(date)
   **Version**: v1.1.0-canary
   **Traffic Weight**: 10%
   **Reason**: [Error rate exceeded 5%]
   
   ## Metrics at Rollback
   - Error Rate: X%
   - P95 Latency: Ys
   - Memory: ZMB
   
   ## Root Cause
   [Analysis here]
   
   ## Actions Taken
   1. Rolled back canary deployment
   2. Verified stable version health
   3. Notified team
   
   ## Follow-up
   - [ ] Fix identified issue
   - [ ] Add test coverage
   - [ ] Re-deploy canary
   EOF
   ```

2. **Analyze Logs**:
   ```bash
   # Export canary logs
   kubectl logs -n production -l version=canary --since=1h > canary-logs-$(date +%Y%m%d-%H%M%S).log
   ```

3. **Review Metrics**:
   - Check Grafana for anomalies
   - Query Prometheus for detailed metrics
   - Compare canary vs stable behavior

4. **Notify Team**:
   - Post in Slack/Teams
   - Update incident tracker
   - Schedule post-mortem

## Troubleshooting

### Issue: Canary Pods Not Starting

**Symptoms**:
```bash
kubectl get pods -n production -l version=canary
# Shows CrashLoopBackOff or ImagePullBackOff
```

**Diagnosis**:
```bash
# Check pod events
kubectl describe pod <canary-pod-name> -n production

# Check logs
kubectl logs <canary-pod-name> -n production
```

**Common Causes**:
1. **Image not found**: Verify image exists in registry
   ```bash
   docker pull ghcr.io/yourusername/agence-immobiliere-backend:v1.1.0-canary
   ```

2. **Configuration error**: Check environment variables
   ```bash
   kubectl get deployment agence-immobiliere-backend-canary -n production -o yaml | grep -A 20 env:
   ```

3. **Resource limits**: Increase memory/CPU limits
   ```yaml
   canary:
     resources:
       limits:
         memory: 1Gi
         cpu: 1000m
   ```

### Issue: No Traffic Reaching Canary

**Symptoms**:
- Canary pods running but metrics show 0 requests
- Traffic percentage = 0%

**Diagnosis**:
```bash
# Check ingress annotations
kubectl get ingress agence-immobiliere-canary -n production -o yaml

# Verify service endpoints
kubectl get endpoints agence-immobiliere-backend-canary -n production

# Check NGINX Ingress logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

**Solutions**:

1. **Verify canary ingress enabled**:
   ```bash
   helm get values agence-immobiliere -n production | grep -A 3 canary
   # Should show: enabled: true
   ```

2. **Check NGINX annotations**:
   ```bash
   kubectl get ingress agence-immobiliere-canary -n production -o jsonpath='{.metadata.annotations}'
   # Should include: nginx.ingress.kubernetes.io/canary: "true"
   ```

3. **Test direct service access**:
   ```bash
   kubectl run test-pod --image=curlimages/curl:latest --rm -i --restart=Never -n production -- \
     curl -v http://agence-immobiliere-backend-canary:5000/health
   ```

### Issue: High Error Rate on Canary

**Symptoms**:
- Error rate > 5% on canary
- Automatic rollback triggered

**Diagnosis**:
```bash
# Check canary logs for errors
kubectl logs -n production -l version=canary --tail=200 | grep -i error

# Query Prometheus for error breakdown
curl -s 'http://prometheus:9090/api/v1/query?query=sum(rate(http_request_duration_seconds_count{version="canary",code=~"5.."}[5m]))by(route,code)'
```

**Common Causes**:

1. **Database Connection Issues**:
   - Check MongoDB connectivity from canary pods
   - Verify connection string in secrets

2. **Missing Environment Variables**:
   - Compare canary vs stable env vars
   ```bash
   diff \
     <(kubectl get deployment agence-immobiliere-backend -n production -o json | jq '.spec.template.spec.containers[0].env') \
     <(kubectl get deployment agence-immobiliere-backend-canary -n production -o json | jq '.spec.template.spec.containers[0].env')
   ```

3. **Code Regression**:
   - Review canary version changes
   - Run integration tests locally
   - Check for dependency version conflicts

### Issue: Canary Metrics Not Appearing in Grafana

**Symptoms**:
- "No data" in canary panels
- Only stable metrics visible

**Diagnosis**:
```bash
# Check if backend is exposing version label
kubectl run test-metrics --image=curlimages/curl:latest --rm -i --restart=Never -n production -- \
  curl -s http://agence-immobiliere-backend-canary:5000/metrics | grep version

# Check Prometheus targets
curl -s http://prometheus:9090/api/v1/targets | jq '.data.activeTargets[] | select(.labels.version=="canary")'
```

**Solutions**:

1. **Add version label to metrics**:
   ```javascript
   // backend/metrics.js
   const version = process.env.CANARY_DEPLOYMENT === 'true' ? 'canary' : 'stable';
   
   app.use((req, res, next) => {
     req.version = version;
     next();
   });
   
   // Add to histogram labels
   httpRequestDuration.labels(req.method, req.route.path, res.statusCode, req.version);
   ```

2. **Verify ServiceMonitor targets canary**:
   ```bash
   kubectl get servicemonitor -n production -o yaml
   # Should scrape both stable and canary services
   ```

3. **Restart Prometheus to reload config**:
   ```bash
   kubectl rollout restart statefulset/prometheus -n production
   ```

### Issue: Canary Promotion Fails

**Symptoms**:
- Promotion to 100% results in errors
- Stable version fails to update

**Diagnosis**:
```bash
# Check Helm release status
helm status agence-immobiliere -n production

# Check deployment rollout
kubectl rollout status deployment/agence-immobiliere-backend -n production
```

**Solutions**:

1. **Rollback Helm release**:
   ```bash
   helm rollback agence-immobiliere -n production
   ```

2. **Manual image update**:
   ```bash
   kubectl set image deployment/agence-immobiliere-backend \
     backend=ghcr.io/yourusername/agence-immobiliere-backend:v1.1.0-canary \
     -n production
   ```

3. **Check image pull secrets**:
   ```bash
   kubectl get secrets -n production | grep ghcr
   ```

## Best Practices

### 1. Always Start with Low Traffic
- Begin with 10% or less
- Monitor for at least 15 minutes
- Never jump directly to high percentages

### 2. Use Feature Flags for Breaking Changes
```javascript
// Test new feature only on canary
app.use('/api/new-feature', 
  canaryFeatureFlag('new-feature-v2'),
  newFeatureHandler
);
```

### 3. Automate Smoke Tests
```bash
# Add smoke test job after canary deployment
kubectl run smoke-test --image=curlimages/curl:latest --rm -i --restart=Never -n production -- \
  curl -f http://agence-immobiliere-backend-canary:5000/health && \
  curl -f http://agence-immobiliere-backend-canary:5000/api/properties?limit=1
```

### 4. Monitor Business Metrics
- Conversion rates
- User engagement
- API usage patterns

### 5. Document Rollback Reasons
- Build knowledge base of failure patterns
- Improve testing coverage
- Add metric alerts

### 6. Test Canary in Staging First
```bash
# Deploy to staging environment
helm upgrade agence-immobiliere ./infrastructure/k8s/helm/agence-immobiliere \
  --namespace staging \
  -f values-staging.yaml \
  --set backend.image.tag=v1.1.0-canary \
  --wait
```

### 7. Set Appropriate Timeouts
- 10% traffic: Monitor 15 minutes
- 25% traffic: Monitor 10 minutes
- 50% traffic: Monitor 15 minutes
- 100% promotion: Monitor 30 minutes

### 8. Keep Canary and Stable in Sync
- Same resource limits
- Same environment variables (except CANARY_DEPLOYMENT)
- Same PVC mounts

## Rollout Checklist

- [ ] Canary image built and pushed to registry
- [ ] Staging deployment tested successfully
- [ ] Grafana dashboard accessible
- [ ] Prometheus scraping canary metrics
- [ ] Auto-rollback workflow enabled
- [ ] Team notified of deployment window
- [ ] Rollback procedure reviewed
- [ ] Canary deployed at 10% traffic
- [ ] Monitored for 15 minutes (no errors)
- [ ] Increased to 25% traffic
- [ ] Monitored for 10 minutes (no errors)
- [ ] Increased to 50% traffic
- [ ] Monitored for 15 minutes (no errors)
- [ ] Promoted to 100%
- [ ] Stable deployment updated
- [ ] Canary deployment cleaned up
- [ ] Post-deployment verification complete
- [ ] Documentation updated

## References

- [NGINX Ingress Canary Deployments](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#canary)
- [Prometheus Querying](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Helm Values Files](https://helm.sh/docs/chart_template_guide/values_files/)
- [Kubernetes Rolling Updates](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
