# Production Rollback Guide

## 🎯 Overview

This guide provides comprehensive procedures for rolling back production deployments of the Agence Immobilière application. Follow these procedures carefully during incidents to minimize downtime and restore service quickly.

**Target Rollback Time:** <15 minutes  
**Last Updated:** January 2025

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Prerequisites](#prerequisites)
3. [Rollback Procedures](#rollback-procedures)
4. [Emergency Procedures](#emergency-procedures)
5. [Post-Rollback Validation](#post-rollback-validation)
6. [Troubleshooting](#troubleshooting)
7. [Recovery Procedures](#recovery-procedures)

---

## 🚀 Quick Reference

### Rollback Command (Standard)

```bash
# Using GitHub CLI
gh workflow run production-rollback.yml \
  -f tag=prod-YYYYMMDD-HHMMSS \
  -f restore_database=true \
  -f skip_health_check=false
```

### Rollback Command (Emergency - Skip Health Check)

```bash
gh workflow run production-rollback.yml \
  -f tag=prod-YYYYMMDD-HHMMSS \
  -f restore_database=true \
  -f skip_health_check=true
```

### Find Available Tags

```bash
# List all production tags
git tag -l "prod-*" | sort -r | head -n 10

# Or via GitHub CLI
gh api repos/:owner/:repo/git/refs/tags --jq '.[] | select(.ref | contains("prod-")) | .ref' | sort -r | head -n 10
```

---

## 📝 Prerequisites

### Before You Begin

- [ ] **Incident confirmed** - Verify the issue requires a rollback
- [ ] **GitHub CLI installed** - `gh auth status` shows you're authenticated
- [ ] **Access verified** - You have write access to the repository
- [ ] **Team notified** - Alert team members about the rollback
- [ ] **Tag identified** - Know which production tag to rollback to

### Required Permissions

- GitHub repository write access
- Production environment reviewer (for manual approval)
- Access to monitoring dashboards

### Required Tools

```bash
# Install GitHub CLI (if not already installed)
# Windows (PowerShell)
winget install --id GitHub.cli

# macOS
brew install gh

# Linux
sudo apt install gh

# Authenticate
gh auth login
```

---

## 🔄 Rollback Procedures

### Procedure 1: Standard Rollback (Recommended)

Use this procedure when you need to rollback both application code and database.

#### Step 1: Identify the Target Tag

```bash
# List recent production deployments
git tag -l "prod-*" | sort -r | head -n 10

# Example output:
# prod-20250107-153000  (current - BROKEN)
# prod-20250107-120000  (previous - GOOD)
# prod-20250106-180000
```

#### Step 2: Verify Tag Exists

```bash
# Verify the tag
git show prod-20250107-120000

# Check deployment date and commit
git log -1 prod-20250107-120000
```

#### Step 3: Initiate Rollback

```bash
# Execute rollback workflow
gh workflow run production-rollback.yml \
  -f tag=prod-20250107-120000 \
  -f restore_database=true \
  -f skip_health_check=false
```

#### Step 4: Monitor Progress

```bash
# Watch workflow progress
gh run watch

# Or view in browser
gh run list --workflow=production-rollback.yml --limit 1
gh run view --web
```

#### Step 5: Approve Rollback (Manual Gate)

1. Go to GitHub Actions → Production Rollback workflow
2. Review the rollback request
3. Click "Review deployments"
4. Approve the `production-rollback` environment

**Expected Time:** 8-12 minutes

#### Step 6: Verify Success

```bash
# Check health status
curl https://api.agence-immobiliere.com/api/health | jq

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "version": "1.2.3"
}
```

---

### Procedure 2: Code-Only Rollback (No Database Changes)

Use when only application code needs to be rolled back, database is fine.

```bash
gh workflow run production-rollback.yml \
  -f tag=prod-20250107-120000 \
  -f restore_database=false \
  -f skip_health_check=false
```

**Expected Time:** 5-8 minutes

---

### Procedure 3: Database-Only Restore

Use when database is corrupted but application code is fine.

#### Step 1: Find Database Backup

```bash
# Download backup artifacts from GitHub Actions
gh run list --workflow=production-deploy.yml --limit 5

# Get run ID for the backup you need
gh run view <run-id>

# Download backup artifact
gh run download <run-id> --name mongodb-backup-<timestamp>
```

#### Step 2: Manual Database Restore

```bash
# Extract backup
tar -xzf mongodb-backup-20250107-120000.tar.gz

# Restore database
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/prod"
./infrastructure/scripts/restore-mongodb.sh mongodb-backup-20250107-120000.tar.gz
```

**Expected Time:** 3-5 minutes

---

## 🚨 Emergency Procedures

### Emergency Rollback Checklist

When every second counts:

```bash
# 1. IMMEDIATE: Identify last known good tag
git tag -l "prod-*" | sort -r | head -n 3

# 2. IMMEDIATE: Execute fast rollback (skip health check)
gh workflow run production-rollback.yml \
  -f tag=prod-20250107-120000 \
  -f restore_database=true \
  -f skip_health_check=true

# 3. APPROVE IMMEDIATELY in GitHub UI

# 4. MONITOR health manually
watch -n 5 'curl -s https://api.agence-immobiliere.com/api/health | jq'

# 5. NOTIFY team in Slack/Teams
```

### Emergency Contacts

| Role | Contact | Availability |
|------|---------|-------------|
| DevOps Lead | @devops-lead | 24/7 |
| Backend Lead | @backend-lead | Business hours |
| CTO | @cto | Escalation only |

### Incident Communication Template

```
🚨 PRODUCTION INCIDENT - Rollback in Progress

Incident: [Brief description]
Severity: [Critical/High/Medium]
Impact: [User-facing impact]
Action: Rolling back to prod-YYYYMMDD-HHMMSS
ETA: [Time estimate]
Status: [In progress/Complete]

Updates will be posted every 5 minutes.
```

---

## ✅ Post-Rollback Validation

### Health Check Validation

```bash
# 1. Backend API Health
curl https://api.agence-immobiliere.com/api/health

# 2. Database Connectivity
curl https://api.agence-immobiliere.com/api/properties | jq '.data | length'

# 3. Authentication
curl -X POST https://api.agence-immobiliere.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 4. Frontend
curl -I https://www.agence-immobiliere.com
```

### Functional Validation

- [ ] Homepage loads correctly
- [ ] User can log in
- [ ] Properties are visible
- [ ] Search functionality works
- [ ] Admin dashboard accessible
- [ ] No JavaScript errors in console

### Performance Validation

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.agence-immobiliere.com/api/health

# curl-format.txt:
time_namelookup:  %{time_namelookup}s\n
time_connect:     %{time_connect}s\n
time_total:       %{time_total}s\n
```

**Expected:** <2 seconds for API health check

---

## 🔧 Troubleshooting

### Issue 1: Rollback Workflow Fails

**Symptom:** GitHub Actions workflow fails during rollback

**Solutions:**

```bash
# Check workflow logs
gh run view --log

# Common issues:
# 1. Invalid tag
git tag -l "prod-*" | grep <your-tag>

# 2. Missing secrets
gh secret list

# 3. Railway/Vercel deployment failed
# → Check Railway/Vercel dashboards
# → Manual deployment may be required
```

### Issue 2: Database Restore Fails

**Symptom:** Database restore script exits with error

**Solutions:**

```bash
# 1. Verify MongoDB connection
mongosh "$MONGODB_URI" --eval "db.runCommand({ping: 1})"

# 2. Check backup file integrity
tar -tzf mongodb-backup-*.tar.gz

# 3. Verify backup hash
sha256sum mongodb-backup-*.tar.gz
cat mongodb-backup-*-metadata.json | jq '.backup_hash_sha256'

# 4. Try manual restore
mongorestore --uri="$MONGODB_URI" --dir=./dump --drop --gzip
```

### Issue 3: Health Checks Fail After Rollback

**Symptom:** Application rolled back but health checks still failing

**Solutions:**

```bash
# 1. Check deployment status
railway status  # Backend
vercel ls       # Frontend

# 2. Check logs
railway logs    # Backend logs
vercel logs     # Frontend logs

# 3. Verify environment variables
railway variables  # Backend
vercel env ls      # Frontend

# 4. Manual health check
./infrastructure/scripts/health-check.sh
```

### Issue 4: Rollback Takes >15 Minutes

**Root Causes:**
- Database restore is slow (large database)
- Manual approval delayed
- Health checks timing out

**Optimization:**

```bash
# Skip health check for faster rollback
gh workflow run production-rollback.yml \
  -f tag=prod-20250107-120000 \
  -f restore_database=true \
  -f skip_health_check=true

# Run health check separately after
./infrastructure/scripts/health-check.sh
```

---

## 🔄 Recovery Procedures

### Scenario 1: Rollback Was Unnecessary

**Situation:** Rolled back, but the issue wasn't with the deployment

**Solution:**

```bash
# Re-deploy the current version
gh workflow run production-deploy.yml

# Or deploy specific tag
git checkout prod-20250107-153000
gh workflow run production-deploy.yml
```

### Scenario 2: Rollback Made Things Worse

**Situation:** Rolled back to a version that also has issues

**Solution:**

```bash
# 1. Check safety backup (created during rollback)
gh run list --workflow=production-rollback.yml --limit 1
gh run download <run-id> --name rollback-safety-backup-*

# 2. Restore from safety backup
./infrastructure/scripts/restore-mongodb.sh rollback-safety-backup-*.tar.gz

# 3. Roll forward to a different version
gh workflow run production-rollback.yml -f tag=prod-20250106-180000
```

### Scenario 3: Multiple Failed Rollback Attempts

**Situation:** Rollback keeps failing

**Solution:**

```bash
# 1. Manual intervention required
# Contact DevOps lead immediately

# 2. Check all services
railway status
vercel ls
mongosh "$MONGODB_URI" --eval "db.runCommand({ping: 1})"

# 3. Manual deployment as last resort
cd backend
railway link <project-id>
railway up --service backend

cd ../frontend
vercel --prod

# 4. Manual database restore if needed
./infrastructure/scripts/restore-mongodb.sh <backup-file>
```

---

## 📊 Rollback Metrics

Track rollback performance:

| Metric | Target | Actual |
|--------|--------|--------|
| Total Rollback Time | <15 min | ___ min |
| Database Restore Time | <5 min | ___ min |
| Backend Deploy Time | <3 min | ___ min |
| Frontend Deploy Time | <2 min | ___ min |
| Health Check Time | <1 min | ___ min |
| Manual Approval Time | <3 min | ___ min |

---

## 📚 Additional Resources

### Documentation

- [AW-26 Implementation Plan](./AW-26-PRODUCTION-PIPELINE-PLAN.md)
- [Railway Monitoring Guide](./RAILWAY_MONITORING.md)
- [Deployment Success Guide](./DEPLOYMENT_SUCCESS.md)

### Scripts

- `infrastructure/scripts/backup-mongodb.sh` - Backup database
- `infrastructure/scripts/restore-mongodb.sh` - Restore database
- `infrastructure/scripts/health-check.sh` - Health checks

### Workflows

- `.github/workflows/production-deploy.yml` - Production deployment
- `.github/workflows/production-rollback.yml` - Production rollback

---

## 🔐 Security Notes

- All backups are encrypted at rest
- Backup artifacts retained for 30 days (safety backups: 90 days)
- Access logs are maintained for all rollback operations
- Two-person approval required for production rollback environment

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check [Troubleshooting](#troubleshooting) section
2. Review workflow logs: `gh run view --log`
3. Contact DevOps team via Slack #devops-alerts
4. For critical incidents, escalate to on-call engineer

---

## ✏️ Document Maintenance

- Review this document monthly
- Update after each rollback with lessons learned
- Keep rollback times updated based on actual performance
- Add new troubleshooting scenarios as discovered

**Last Reviewed:** January 2025  
**Next Review:** February 2025  
**Owner:** DevOps Team
