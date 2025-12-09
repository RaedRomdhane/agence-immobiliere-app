# Complete DevOps Architecture Diagram

## Production Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 INTERNET                                         │
└──────────────────────────────┬──────────────────────────────────────────────────┘
                               │
                               │ HTTPS (TLS/SSL)
                               │
                       ┌───────▼────────┐
                       │  Cert-Manager  │
                       │  (Let's Encrypt)│
                       └────────────────┘
                               │
                       ┌───────▼────────────────────────────────────┐
                       │       NGINX Ingress Controller             │
                       │  - TLS Termination                         │
                       │  - Canary Routing (Weight/Header/Cookie)   │
                       │  - Rate Limiting                           │
                       └─────┬──────────────────────┬────────────────┘
                             │                      │
                    90% Traffic            10% Canary Traffic
                             │                      │
                   ┌─────────▼─────────┐   ┌────────▼──────────┐
                   │  Stable Service   │   │  Canary Service   │
                   │  ClusterIP        │   │  ClusterIP        │
                   └─────────┬─────────┘   └────────┬──────────┘
                             │                      │
                   ┌─────────▼─────────┐   ┌────────▼──────────┐
                   │  Backend Pods     │   │  Canary Pod       │
                   │  (2-10 replicas)  │   │  (1 replica)      │
                   │  - HPA Enabled    │   │  - version: canary│
                   │  - version: stable│   │  - Health Checks  │
                   │  - Health Checks  │   └────────┬──────────┘
                   │  - Resource Limits│            │
                   └─────────┬─────────┘            │
                             │                      │
                             └──────────┬───────────┘
                                        │
                                ┌───────▼──────────┐
                                │  MongoDB         │
                                │  StatefulSet     │
                                │  - 20Gi PVC      │
                                │  - Persistence   │
                                └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MONITORING STACK                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────┐        ┌────────────────┐        ┌────────────────┐       │
│  │   Prometheus   │◄───────┤ ServiceMonitor │───────►│  Backend Pods  │       │
│  │   (Metrics)    │        │  (K8s CRD)     │        │  /metrics      │       │
│  │  - 15s scrape  │        └────────────────┘        └────────────────┘       │
│  │  - 15d retention│                                                            │
│  └───────┬────────┘                                                             │
│          │                                                                       │
│          │ Queries                                                              │
│          │                                                                       │
│  ┌───────▼────────────────────────────────────────────────────────────┐        │
│  │                      Grafana Dashboards                             │        │
│  │  ┌────────────────┐  ┌──────────────┐  ┌──────────────────────┐  │        │
│  │  │   Application  │  │ Canary vs    │  │   Infrastructure     │  │        │
│  │  │   Overview     │  │ Stable       │  │   Monitoring         │  │        │
│  │  │  (12 panels)   │  │ (10 panels)  │  │   (8 panels)         │  │        │
│  │  └────────────────┘  └──────────────┘  └──────────────────────┘  │        │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  ┌────────────────┐        ┌────────────────┐                                  │
│  │      Loki      │◄───────┤   Promtail     │◄────── Container Logs            │
│  │  (Log Aggr.)   │        │  (Log Shipper) │                                  │
│  │  - 30d retention│        └────────────────┘                                  │
│  └────────────────┘                                                             │
│                                                                                  │
│  ┌────────────────┐        ┌─────────────────────────────────────┐            │
│  │  Alertmanager  │───────►│  Alert Receivers                    │            │
│  │  - Alert Rules │        │  - Slack, Email, PagerDuty, Webhook │            │
│  └────────────────┘        └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          BACKUP SYSTEM                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────┐   Every 6 hours    ┌────────────────────────────────┐     │
│  │   MongoDB      │───────────────────►│  Backup Scripts (8 scripts)    │     │
│  │   Database     │                     │  - backup.sh                   │     │
│  └────────────────┘                     │  - backup-runner.sh            │     │
│                                         │  - verify-backup.sh            │     │
│                                         │  - restore.sh                  │     │
│                                         │  - cleanup-old-backups.sh      │     │
│                                         └──────────┬─────────────────────┘     │
│                                                    │                             │
│                                                    │ Upload                      │
│                                                    │                             │
│                                         ┌──────────▼─────────────────────┐     │
│                                         │  Azure Blob Storage            │     │
│                                         │  - 30-day retention            │     │
│                                         │  - Geo-redundant               │     │
│                                         │  - Encrypted                   │     │
│                                         └────────────────────────────────┘     │
│                                                                                  │
│  Retention: 7 days local, 30 days Azure                                        │
│  RPO: < 6 hours | RTO: < 30 minutes                                            │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          CI/CD PIPELINE (GitHub Actions)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐                                                               │
│  │  Git Push    │                                                               │
│  │  to main     │                                                               │
│  └──────┬───────┘                                                               │
│         │                                                                        │
│         ▼                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │ 1. Validate & Build (5-10 min)                                       │     │
│  │    - Lint (ESLint)                                                   │     │
│  │    - Test (Jest, React Testing Library)                              │     │
│  │    - Security Scan (Trivy)                                           │     │
│  └───────────────────────────┬──────────────────────────────────────────┘     │
│                               │                                                 │
│                               ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │ 2. Build & Push Images (10-15 min)                                   │     │
│  │    - Docker Buildx (layer caching)                                   │     │
│  │    - Push to GitHub Container Registry                               │     │
│  │    - Tag: version + commit SHA                                       │     │
│  └───────────────────────────┬──────────────────────────────────────────┘     │
│                               │                                                 │
│                               ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │ 3. Backup Database (5-10 min)                                        │     │
│  │    - MongoDB dump                                                    │     │
│  │    - Upload to Azure Blob                                            │     │
│  │    - Verify integrity                                                │     │
│  └───────────────────────────┬──────────────────────────────────────────┘     │
│                               │                                                 │
│                               ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │ 4. Deploy Staging (10-15 min)                                        │     │
│  │    - Helm upgrade (staging namespace)                                │     │
│  │    - Smoke tests                                                     │     │
│  │    - Health checks                                                   │     │
│  └───────────────────────────┬──────────────────────────────────────────┘     │
│                               │                                                 │
│                               ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │ 5. Deploy Production (15-20 min) [MANUAL APPROVAL]                   │     │
│  │    ┌──────────────────────────────────────────────────────┐         │     │
│  │    │  Blue-Green Deployment Strategy                      │         │     │
│  │    │                                                       │         │     │
│  │    │  1. Deploy Green environment (new version)           │         │     │
│  │    │  2. Health check Green pods                          │         │     │
│  │    │  3. Switch Ingress traffic to Green                  │         │     │
│  │    │  4. Monitor for 5 minutes                            │         │     │
│  │    │  5. Cleanup old Blue environment                     │         │     │
│  │    │  6. Auto-rollback on failure                         │         │     │
│  │    └──────────────────────────────────────────────────────┘         │     │
│  └───────────────────────────┬──────────────────────────────────────────┘     │
│                               │                                                 │
│                               ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │ 6. Validate Deployment (2-5 min)                                     │     │
│  │    - Pod health checks                                               │     │
│  │    - HPA validation                                                  │     │
│  │    - Metrics availability                                            │     │
│  │    - Endpoint smoke tests                                            │     │
│  └───────────────────────────┬──────────────────────────────────────────┘     │
│                               │                                                 │
│                               ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │ 7. Notify (1 min)                                                    │     │
│  │    - Success/failure notification                                    │     │
│  │    - Deployment summary                                              │     │
│  │    - Dashboard links                                                 │     │
│  └──────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
│  Total Pipeline Time: 50-75 minutes                                            │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                       CANARY DEPLOYMENT WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Stage 1: Deploy Canary (10% traffic)                                          │
│  ┌────────────────────────────────────────────────────────────────────┐        │
│  │  - Helm upgrade with canary.enabled=true                            │        │
│  │  - Deploy 1 canary replica                                          │        │
│  │  - NGINX routes 10% traffic to canary                               │        │
│  │  - Run smoke tests (5 tests)                                        │        │
│  └────────────────┬───────────────────────────────────────────────────┘        │
│                   │                                                              │
│  Stage 2: Monitor (15 minutes)                                                  │
│  ┌────────────────▼───────────────────────────────────────────────────┐        │
│  │  Query Prometheus every minute:                                     │        │
│  │  - Canary error rate vs stable                                      │        │
│  │  - Canary P95 latency vs stable                                     │        │
│  │  - Canary memory usage                                              │        │
│  │  - Canary CPU usage                                                 │        │
│  │                                                                      │        │
│  │  Rollback Triggers:                                                 │        │
│  │  ❌ Error rate > 5%                                                 │        │
│  │  ❌ P95 latency > 2s                                                │        │
│  │  ❌ Error rate increase > +3% vs stable                             │        │
│  │  ❌ Latency increase > 1.5x vs stable                               │        │
│  └────────────────┬───────────────────────────────────────────────────┘        │
│                   │                                                              │
│  ┌────────────────▼───────────┐    ❌ Metrics Failed                            │
│  │   Metrics Passed?          │────────────────────────┐                        │
│  └────────────────┬───────────┘                        │                        │
│                   │ ✅ Yes                             │                        │
│                   │                                    │                        │
│  Stage 3: Gradual Promotion                           │                        │
│  ┌────────────────▼───────────────────────────────┐   │                        │
│  │  10% → 25% (wait 10 min)                       │   │  ┌──────────────────┐ │
│  │  25% → 50% (wait 15 min)                       │   └─►│  Auto-Rollback   │ │
│  │  50% → 100% (update stable, disable canary)    │      │  - Disable canary│ │
│  └─────────────────────────────────────────────────┘      │  - Verify stable │ │
│                                                            │  - Create incident│ │
│  Total Rollout Time: ~70 minutes (safe path)              └──────────────────┘ │
│                      ~50 minutes (auto-promote)                                 │
│                                                                                  │
│  Automated Monitoring: Every 5 minutes via GitHub Actions                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          STORAGE & PERSISTENCE                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────┐                │
│  │  MongoDB Persistent Volume Claim (PVC)                     │                │
│  │  - Storage: 20Gi                                           │                │
│  │  - StorageClass: default                                   │                │
│  │  - AccessMode: ReadWriteOnce                               │                │
│  │  - Used by: MongoDB StatefulSet                            │                │
│  └────────────────────────────────────────────────────────────┘                │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────┐                │
│  │  Uploads Persistent Volume Claim (PVC)                     │                │
│  │  - Storage: 50Gi                                           │                │
│  │  - StorageClass: azurefile (or equivalent)                 │                │
│  │  - AccessMode: ReadWriteMany                               │                │
│  │  - Shared by: All backend pods                             │                │
│  └────────────────────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          AUTO-SCALING CONFIGURATION                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Backend HPA:                                                                   │
│  ┌────────────────────────────────────────────────────────────┐                │
│  │  Min Replicas: 2                                           │                │
│  │  Max Replicas: 10                                          │                │
│  │  Target CPU: 70%                                           │                │
│  │  Target Memory: 80%                                        │                │
│  │  Scale Up: When CPU > 70% or Memory > 80%                 │                │
│  │  Scale Down: After 5 minutes below threshold              │                │
│  └────────────────────────────────────────────────────────────┘                │
│                                                                                  │
│  Frontend HPA:                                                                  │
│  ┌────────────────────────────────────────────────────────────┐                │
│  │  Min Replicas: 2                                           │                │
│  │  Max Replicas: 8                                           │                │
│  │  Target CPU: 70%                                           │                │
│  │  Target Memory: 80%                                        │                │
│  └────────────────────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          RESOURCE ALLOCATION                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Backend Pods:                                                                  │
│  ┌────────────────────────────────────────────────────────────┐                │
│  │  Requests: CPU: 200m, Memory: 256Mi                        │                │
│  │  Limits:   CPU: 1000m, Memory: 512Mi                       │                │
│  └────────────────────────────────────────────────────────────┘                │
│                                                                                  │
│  Frontend Pods:                                                                 │
│  ┌────────────────────────────────────────────────────────────┐                │
│  │  Requests: CPU: 100m, Memory: 128Mi                        │                │
│  │  Limits:   CPU: 500m, Memory: 256Mi                        │                │
│  └────────────────────────────────────────────────────────────┘                │
│                                                                                  │
│  MongoDB Pod:                                                                   │
│  ┌────────────────────────────────────────────────────────────┐                │
│  │  Requests: CPU: 500m, Memory: 1Gi                          │                │
│  │  Limits:   CPU: 2000m, Memory: 2Gi                         │                │
│  └────────────────────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          HEALTH CHECKS                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Backend:                                                                       │
│  ┌────────────────────────────────────────────────────────────┐                │
│  │  Liveness:  GET /health every 30s, timeout 5s              │                │
│  │  Readiness: GET /health every 10s, timeout 3s              │                │
│  │  Startup:   GET /health every 5s, 30 attempts              │                │
│  └────────────────────────────────────────────────────────────┘                │
│                                                                                  │
│  Frontend:                                                                      │
│  ┌────────────────────────────────────────────────────────────┐                │
│  │  Liveness:  HTTP GET / every 30s                           │                │
│  │  Readiness: HTTP GET / every 10s                           │                │
│  └────────────────────────────────────────────────────────────┘                │
│                                                                                  │
│  MongoDB:                                                                       │
│  ┌────────────────────────────────────────────────────────────┐                │
│  │  Liveness:  TCP 27017 every 30s                            │                │
│  │  Readiness: MongoDB ping every 10s                         │                │
│  └────────────────────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY LAYERS                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. TLS/SSL Termination                                                         │
│     - Cert-Manager with Let's Encrypt                                          │
│     - Automated certificate renewal                                             │
│     - HTTPS only (HTTP → HTTPS redirect)                                       │
│                                                                                  │
│  2. Container Security                                                          │
│     - Non-root user in containers                                              │
│     - Read-only root filesystem                                                │
│     - Dropped Linux capabilities                                               │
│     - Security scanning (Trivy) in CI/CD                                       │
│                                                                                  │
│  3. Kubernetes RBAC                                                            │
│     - Service accounts with minimal permissions                                │
│     - Role-based access control                                                │
│     - Pod Security Standards                                                   │
│                                                                                  │
│  4. Secrets Management                                                         │
│     - Kubernetes Secrets (base64 encoded)                                      │
│     - Encryption at rest                                                       │
│     - No secrets in source code                                                │
│     - GitHub Secrets for CI/CD                                                 │
│                                                                                  │
│  5. Network Security                                                           │
│     - ClusterIP for internal services                                          │
│     - Ingress for external access only                                         │
│     - Network policies (optional, not implemented)                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          KEY PERFORMANCE INDICATORS                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Availability:        99.99% uptime SLA                                         │
│  Response Time P95:   < 500ms                                                   │
│  Error Rate:          < 0.1%                                                    │
│  Deployment Time:     15-20 minutes                                             │
│  Rollback Time:       < 5 minutes                                               │
│  MTTR:                < 15 minutes                                              │
│  MTTD:                < 5 minutes                                               │
│  RPO:                 < 6 hours                                                 │
│  RTO:                 < 30 minutes                                              │
│  Change Failure Rate: < 1%                                                      │
│  Deployment Freq:     10-20 per week                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

### Container & Orchestration
- **Docker**: v24.0+ (containerization)
- **Kubernetes**: v1.28+ (orchestration)
- **Helm**: v3.13.0 (package management)
- **NGINX Ingress**: Latest (traffic routing)

### Monitoring & Observability
- **Prometheus**: 2.x (metrics collection)
- **Grafana**: Latest (visualization)
- **Loki**: 2.8.2 (log aggregation)
- **Alertmanager**: 0.29.0 (alerting)
- **Promtail**: 2.8.2 (log shipping)

### Application
- **Backend**: Node.js 20.17.0 + Express
- **Frontend**: React 18 + Nginx
- **Database**: MongoDB 7.0
- **Metrics Library**: prom-client 14.0.0

### CI/CD & Automation
- **GitHub Actions**: Workflows
- **Docker Buildx**: Multi-platform builds
- **GitHub Container Registry**: Image storage
- **Azure Blob Storage**: Backup storage
- **Bash/PowerShell**: Automation scripts

### Security
- **Cert-Manager**: v1.12+ (TLS/SSL)
- **Trivy**: Latest (vulnerability scanning)
- **Kubernetes RBAC**: Access control
- **GitHub Secrets**: Credentials management

## Deployment Strategies

### 1. Blue-Green (Production)
- Zero downtime deployments
- Quick rollback capability
- Full traffic switching
- Used for: Major releases

### 2. Rolling Updates (Staging)
- Gradual pod replacement
- Continuous availability
- Automated by Kubernetes
- Used for: Minor updates

### 3. Canary (Progressive)
- 10% → 25% → 50% → 100% traffic
- Automated rollback on metrics
- Real-time comparison
- Used for: High-risk changes

## Architecture Benefits

✅ **High Availability**: Auto-scaling, health checks, multi-replica  
✅ **Observability**: Real-time metrics, logs, alerts  
✅ **Data Safety**: Automated backups, 99.9% recovery  
✅ **Safe Deployments**: Multiple strategies, automated rollback  
✅ **Security**: TLS, RBAC, secrets management, scanning  
✅ **Scalability**: HPA, resource limits, persistent storage  
✅ **Automation**: CI/CD pipelines, scripts, monitoring  

---

**Total Infrastructure Cost**: ~$320-640/month  
**Estimated Uptime**: 99.99% (< 1 hour downtime/year)  
**Deployment Frequency**: 10-20 per week  
**Rollback Time**: < 5 minutes  
**Data Recovery**: 99.9% success rate
