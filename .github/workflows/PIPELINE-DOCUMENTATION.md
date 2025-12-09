# Production Pipeline Documentation

## Overview

Comprehensive CI/CD pipeline for the Agence Immobiliere application with:
- **Automated Testing** - Unit, integration, and smoke tests
- **Docker Image Building** - Multi-stage builds with caching
- **Blue-Green Deployment** - Zero-downtime releases
- **Manual Approval Gates** - Required for production
- **Automated Rollback** - On health check failure
- **Pre-deployment Backups** - Database backup before production
- **Post-deployment Validation** - Health checks and smoke tests
- **Notifications** - Slack/Email alerts

## Workflows

### 1. Production Deployment (`production-deployment.yml`)

**Trigger**: Manual (`workflow_dispatch`)

**Inputs**:
- `environment`: staging or production
- `version`: Semantic version tag (e.g., v1.0.0)
- `skip_tests`: Emergency skip (use with caution)

**Pipeline Stages**:

1. **Validate & Build** (5-10 min)
   - Checkout code
   - Install dependencies
   - Run linters
   - Execute tests (backend + frontend)
   - Build applications
   - Upload artifacts

2. **Build & Push Images** (10-15 min)
   - Build Docker images (backend + frontend)
   - Push to GitHub Container Registry
   - Tag with version, environment, SHA

3. **Pre-deployment Backup** (5-10 min) ⚠️ Production only
   - Create MongoDB backup job
   - Wait for completion
   - Verify backup success

4. **Deploy to Staging** (10-15 min) 🟢 Auto
   - Deploy with Helm
   - Wait for rollout
   - Run smoke tests

5. **Deploy to Production** (15-20 min) 🔴 Manual Approval Required
   - Deploy "Green" environment
   - Health check on Green
   - Switch traffic (Blue → Green)
   - Verify deployment
   - Run smoke tests
   - Cleanup old Blue environment
   - Auto-rollback on failure

6. **Post-deployment Validation** (2-5 min)
   - Check pod health
   - Verify HPA status
   - Collect metrics

7. **Notifications** (1 min)
   - Send success/failure alerts

**Total Time**:
- Staging: ~30-45 minutes
- Production: ~45-60 minutes (with approval wait time)

### 2. CI Pull Request (`ci-pull-request.yml`)

**Trigger**: Pull request to `main` or `develop`

**Jobs**:
- Lint backend & frontend
- Test backend & frontend
- Build backend & frontend
- Docker build test
- Security scan (Trivy)

**Time**: ~15-20 minutes

### 3. Rollback (`rollback.yml`)

**Trigger**: Manual

**Inputs**:
- `environment`: staging or production
- `revision`: Specific Helm revision (optional)

**Steps**:
1. Show current state
2. Rollback to previous/specified revision
3. Verify rollback
4. Health check
5. Notify

**Time**: ~5-10 minutes

### 4. Database Backup (`backup.yml`)

**Triggers**:
- Manual
- Schedule: Daily at 2 AM UTC

**Steps**:
1. Create backup job from CronJob
2. Wait for completion (15 min timeout)
3. Verify backup
4. Cleanup old backups (keep 7)
5. Notify

**Time**: ~10-15 minutes

## Setup Instructions

### 1. GitHub Secrets Configuration

Navigate to: **Settings → Secrets and variables → Actions**

#### Required Secrets:

**Kubernetes Access**:
```
KUBECONFIG                      # Production kubeconfig (base64 encoded)
KUBECONFIG_STAGING              # Staging kubeconfig (base64 encoded)
```

**Database**:
```
MONGODB_URI                     # Production MongoDB connection
MONGODB_URI_STAGING             # Staging MongoDB connection
MONGODB_ROOT_PASSWORD           # Production MongoDB root password
MONGODB_ROOT_PASSWORD_STAGING   # Staging MongoDB root password
```

**Application**:
```
JWT_SECRET                      # JWT signing secret
SESSION_SECRET                  # Session encryption secret
GOOGLE_CLIENT_ID                # Google OAuth client ID
GOOGLE_CLIENT_SECRET            # Google OAuth client secret
```

**Azure Storage**:
```
AZURE_STORAGE_ACCOUNT_NAME      # Azure storage account name
AZURE_STORAGE_ACCOUNT_KEY       # Azure storage account key
```

**Notifications** (Optional):
```
SLACK_WEBHOOK                   # Slack webhook URL for notifications
```

#### Encoding Kubeconfig:

**Windows (PowerShell)**:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content -Raw $HOME/.kube/config)))
```

**Linux/Mac**:
```bash
cat ~/.kube/config | base64 -w 0
```

### 2. GitHub Environments Setup

Create two environments:

#### Staging Environment
- **Name**: `staging`
- **URL**: `https://staging.agence-immobiliere.com`
- **Protection rules**: None (auto-deploy)

#### Production Environment
- **Name**: `production`
- **URL**: `https://agence-immobiliere.com`
- **Protection rules**:
  - ✅ Required reviewers (1-2 people)
  - ✅ Wait timer: 5 minutes
  - ✅ Prevent self-review

### 3. Branch Protection Rules

**For `main` branch**:
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
  - `lint-backend`
  - `lint-frontend`
  - `test-backend`
  - `test-frontend`
  - `build-backend`
  - `build-frontend`
- ✅ Require conversation resolution
- ✅ Do not allow bypassing

## Usage Guide

### Deploying to Staging

1. Go to **Actions** tab
2. Select **Production Deployment Pipeline**
3. Click **Run workflow**
4. Fill inputs:
   - Environment: `staging`
   - Version: `v1.0.0`
   - Skip tests: `false`
5. Click **Run workflow**
6. Monitor progress (~30-45 min)

### Deploying to Production

1. Go to **Actions** tab
2. Select **Production Deployment Pipeline**
3. Click **Run workflow**
4. Fill inputs:
   - Environment: `production`
   - Version: `v1.0.0`
   - Skip tests: `false`
5. Click **Run workflow**
6. Wait for "Deploy to Production" approval request
7. **Review deployment** (reviewers only)
8. Click **Approve and deploy**
9. Monitor progress (~45-60 min)

### Emergency Rollback

1. Go to **Actions** tab
2. Select **Rollback Deployment**
3. Click **Run workflow**
4. Fill inputs:
   - Environment: `production`
   - Revision: (leave empty for previous)
5. Click **Run workflow**
6. Confirm rollback (~5-10 min)

### Manual Backup

1. Go to **Actions** tab
2. Select **Database Backup**
3. Click **Run workflow**
4. Select environment: `production` or `staging`
5. Click **Run workflow**
6. Wait for completion (~10-15 min)

## Blue-Green Deployment Strategy

### How It Works:

1. **Current State**: Blue environment serving traffic
2. **Deploy Green**: New version deployed to Green environment
3. **Health Check**: Green passes all health checks
4. **Traffic Switch**: Update main deployment to Green version
5. **Verification**: Smoke tests on production
6. **Cleanup**: Remove old Blue environment

### Rollback Strategy:

**Automatic Rollback** (triggered by):
- Health check failure on Green
- Smoke test failure
- Deployment timeout (10 min)

**Manual Rollback**:
- Use Rollback workflow
- Reverts to previous Helm revision
- Takes 5-10 minutes

### Rollback Time Guarantee:
- **Automated**: < 5 minutes
- **Manual**: < 10 minutes

## Monitoring Deployment

### Real-time Monitoring

**GitHub Actions UI**:
- Watch workflow execution
- View logs for each job
- Check approval status

**Kubernetes Dashboard**:
```bash
kubectl get pods -n production -w
kubectl get events -n production --sort-by='.lastTimestamp' --watch
```

**Helm Status**:
```bash
helm list -n production
helm status agence-immobiliere -n production
```

### Post-Deployment Checks

**Application Health**:
```bash
kubectl port-forward -n production svc/agence-immobiliere-backend 5000:5000
curl http://localhost:5000/health
```

**Metrics**:
```bash
kubectl top pods -n production
kubectl get hpa -n production
```

**Logs**:
```bash
kubectl logs -n production -l app.kubernetes.io/component=backend --tail=100
kubectl logs -n production -l app.kubernetes.io/component=frontend --tail=100
```

## Troubleshooting

### Deployment Failures

**Build Failures**:
1. Check workflow logs
2. Verify dependencies in `package.json`
3. Run locally: `npm ci && npm run build`

**Test Failures**:
1. Review test logs in Actions
2. Run locally: `npm test`
3. Check MongoDB connection

**Docker Build Failures**:
1. Verify Dockerfile syntax
2. Check build context
3. Review layer caching

**Helm Deployment Failures**:
1. Check kubeconfig validity
2. Verify secrets are set
3. Review Helm values
4. Check resource limits

**Health Check Failures**:
1. Check pod logs: `kubectl logs -n production <pod-name>`
2. Describe pod: `kubectl describe pod -n production <pod-name>`
3. Check resource usage
4. Verify environment variables

### Manual Recovery

**Force Rollback**:
```bash
helm rollback agence-immobiliere 0 -n production --force
```

**Restart Pods**:
```bash
kubectl rollout restart deployment/agence-immobiliere-backend -n production
kubectl rollout restart deployment/agence-immobiliere-frontend -n production
```

**Check Events**:
```bash
kubectl get events -n production --sort-by='.lastTimestamp' | tail -20
```

## Best Practices

### Versioning
- Use semantic versioning: `v1.0.0`
- Tag releases in Git
- Match version in workflow input

### Testing
- Never skip tests in production
- Run full test suite before deploy
- Use `skip_tests` only in emergencies

### Approvals
- Require 2 reviewers for production
- Review logs before approving
- Check staging deployment first

### Rollbacks
- Document rollback reasons
- Test in staging first
- Monitor metrics after rollback

### Monitoring
- Watch deployment for 30 min
- Check error rates in Grafana
- Verify HPA scaling

### Backups
- Always backup before production deploy
- Verify backup completion
- Test restore procedures quarterly

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing on `main`
- [ ] Staging deployment successful
- [ ] Database backup completed
- [ ] Version tag created
- [ ] Changelog updated
- [ ] Rollback plan documented

### During Deployment
- [ ] Monitor workflow progress
- [ ] Review approval request
- [ ] Check health checks
- [ ] Verify smoke tests
- [ ] Watch pod status

### Post-Deployment
- [ ] Application responding
- [ ] No error spikes in logs
- [ ] Metrics looking normal
- [ ] HPA working correctly
- [ ] Monitoring dashboards updated
- [ ] Team notified

## Security Considerations

- Secrets stored in GitHub Secrets (encrypted)
- Kubeconfig with limited RBAC permissions
- Image scanning with Trivy
- TLS/SSL enforced on Ingress
- No sensitive data in logs
- Audit trail via GitHub Actions logs

## Support

**Deployment Issues**:
- Check workflow logs
- Review Kubernetes events
- Contact DevOps team

**Emergency Contact**:
- Use Rollback workflow immediately
- Notify on-call engineer
- Document incident

---

**Last Updated**: 2025-12-07  
**Version**: 1.0.0  
**Maintained by**: DevOps Team
