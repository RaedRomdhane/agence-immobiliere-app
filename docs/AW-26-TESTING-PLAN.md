# AW-26 Testing & Validation Plan

**Status:** 🧪 **READY FOR TESTING**  
**Date:** November 7, 2025  
**Objective:** Validate all 5 acceptance criteria with real-world testing

---

## 📋 Pre-Testing Checklist

### Step 1: Configure GitHub Environments (15 minutes)

1. **Navigate to Repository Settings**
   ```
   GitHub → Your Repository → Settings → Environments
   ```

2. **Create "production" Environment**
   - Click "New environment"
   - Name: `production`
   - Configure protection rules:
     - ✅ Required reviewers: Add 2 team members
     - ✅ Wait timer: 5 minutes
     - ✅ Deployment branches: Select "Selected branches" → Add `main`
   - Click "Save protection rules"

3. **Create "production-rollback" Environment**
   - Click "New environment"
   - Name: `production-rollback`
   - Configure protection rules:
     - ✅ Required reviewers: Add 2 team members
     - ✅ Wait timer: 0 minutes (emergency rollback)
     - ✅ Deployment branches: Select "All branches"
   - Click "Save protection rules"

4. **Verify Environments Created**
   ```bash
   # Check via GitHub CLI
   gh api repos/:owner/:repo/environments
   ```

### Step 2: Configure Staging Secrets (10 minutes)

Add these secrets for staging tests:

```bash
# Navigate to: Settings → Secrets and variables → Actions → New repository secret

# For staging tests (use staging values):
MONGODB_URI_PRODUCTION → Use staging MongoDB URI
RAILWAY_TOKEN → Your Railway API token
RAILWAY_PROJECT_ID_PRODUCTION → Use staging project ID
VERCEL_TOKEN → Your Vercel token
VERCEL_ORG_ID → Your Vercel organization ID
VERCEL_PROJECT_ID_PRODUCTION → Use staging project ID
NEXT_PUBLIC_API_URL_PRODUCTION → https://api-staging.your-domain.com
BACKEND_URL_PRODUCTION → https://api-staging.your-domain.com
FRONTEND_URL_PRODUCTION → https://staging.your-domain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY → Your API key
```

**Add via GitHub CLI:**
```bash
gh secret set MONGODB_URI_PRODUCTION
gh secret set RAILWAY_TOKEN
gh secret set RAILWAY_PROJECT_ID_PRODUCTION
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID_PRODUCTION
gh secret set NEXT_PUBLIC_API_URL_PRODUCTION
gh secret set BACKEND_URL_PRODUCTION
gh secret set FRONTEND_URL_PRODUCTION
gh secret set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

---

## 🧪 Test Suite 1: Script Validation (30 minutes)

### Test 1.1: Backup Script

**Objective:** Verify backup-mongodb.sh creates valid backups

```bash
# 1. Navigate to scripts directory
cd infrastructure/scripts

# 2. Make script executable
chmod +x backup-mongodb.sh

# 3. Set environment variable (use staging MongoDB)
$env:MONGODB_URI = "mongodb+srv://user:pass@staging-cluster.mongodb.net/dbname"

# 4. Create backup directory
mkdir -p ../../backups

# 5. Run backup script
bash backup-mongodb.sh

# 6. Verify outputs
ls ../../backups/

# Expected files:
# - mongodb-backup-YYYYMMDD-HHMMSS.tar.gz
# - mongodb-backup-YYYYMMDD-HHMMSS-metadata.json
```

**Success Criteria:**
- ✅ Script completes without errors
- ✅ Backup file created (.tar.gz)
- ✅ Metadata file created (.json)
- ✅ SHA256 hash present in metadata
- ✅ Execution time <5 minutes

**Record Results:**
```
Backup file size: _______ MB
Execution time: _______ seconds
SHA256 hash: _______________________
Status: ✅ PASS / ❌ FAIL
```

---

### Test 1.2: Restore Script

**Objective:** Verify restore-mongodb.sh restores correctly

```bash
# 1. Find the backup file from Test 1.1
$backupFile = Get-ChildItem ../../backups/*.tar.gz | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# 2. Make restore script executable
chmod +x restore-mongodb.sh

# 3. Set environment variables
$env:MONGODB_URI = "mongodb+srv://user:pass@staging-cluster.mongodb.net/dbname"
$env:SKIP_BACKUP = "false"  # Create safety backup

# 4. Run restore script (use staging DB, not production!)
bash restore-mongodb.sh $backupFile.FullName

# Type "yes" when prompted

# 5. Verify restoration
# Check database has data
mongosh $env:MONGODB_URI --eval "db.users.countDocuments({})"
```

**Success Criteria:**
- ✅ Hash verification passes
- ✅ Safety backup created
- ✅ Restore completes without errors
- ✅ Data verified in database
- ✅ Execution time <5 minutes

**Record Results:**
```
Safety backup created: ✅ YES / ❌ NO
Hash verification: ✅ PASS / ❌ FAIL
Restore time: _______ seconds
Data verified: ✅ YES / ❌ NO
Status: ✅ PASS / ❌ FAIL
```

---

### Test 1.3: Health Check Script

**Objective:** Verify health-check.sh validates correctly

```bash
# 1. Make script executable
chmod +x health-check.sh

# 2. Set environment variables (use staging URLs)
$env:BACKEND_URL = "https://api-staging.your-domain.com"
$env:FRONTEND_URL = "https://staging.your-domain.com"
$env:HEALTH_CHECK_TIMEOUT = "30"

# 3. Run health check
bash health-check.sh

# 4. Check report generated
ls health-check-report-*.json
```

**Success Criteria:**
- ✅ All critical checks pass
- ✅ JSON report generated
- ✅ Health status = HEALTHY or DEGRADED
- ✅ Execution time <1 minute
- ✅ Exit code = 0 (success)

**Record Results:**
```
Total checks: _______
Passed: _______
Failed: _______
Warnings: _______
Health status: _______
Execution time: _______ seconds
Status: ✅ PASS / ❌ FAIL
```

---

## 🧪 Test Suite 2: Workflow Validation (45 minutes)

### Test 2.1: Production Deploy Workflow (Dry Run)

**Objective:** Verify workflow syntax and job dependencies

```bash
# 1. Validate workflow syntax
cd .github/workflows

# 2. Check for YAML errors (using act or GitHub CLI)
gh workflow view production-deploy.yml

# 3. Verify jobs and dependencies
cat production-deploy.yml | grep -E "^  \w+:|needs:"
```

**Success Criteria:**
- ✅ YAML syntax valid
- ✅ All jobs have correct dependencies
- ✅ Environment correctly configured
- ✅ Required secrets referenced

**Record Results:**
```
YAML valid: ✅ YES / ❌ NO
Jobs defined: _______
Environment: _______
Status: ✅ PASS / ❌ FAIL
```

---

### Test 2.2: Production Rollback Workflow (Dry Run)

**Objective:** Verify rollback workflow configuration

```bash
# 1. Validate workflow syntax
gh workflow view production-rollback.yml

# 2. Check inputs defined
cat production-rollback.yml | grep -A 10 "workflow_dispatch:"

# 3. Verify job dependencies
cat production-rollback.yml | grep -E "^  \w+:|needs:"
```

**Success Criteria:**
- ✅ YAML syntax valid
- ✅ All inputs defined (tag, skip_health_check, restore_database)
- ✅ Jobs run in correct order
- ✅ Parallel jobs configured (backend + frontend)

**Record Results:**
```
YAML valid: ✅ YES / ❌ NO
Inputs defined: _______
Parallel jobs: ✅ YES / ❌ NO
Status: ✅ PASS / ❌ FAIL
```

---

## 🧪 Test Suite 3: End-to-End Rollback Test (30 minutes)

### Test 3.1: Create Test Deployment

**Objective:** Create a deployment that can be rolled back

```bash
# 1. Create a test tag
git tag -a "staging-test-$(date +%Y%m%d-%H%M%S)" -m "Test deployment for rollback"
git push origin --tags

# 2. Manually trigger staging deploy (if available)
gh workflow run staging-deploy.yml

# 3. Wait for completion
gh run watch

# 4. Get the deployment tag
$DEPLOY_TAG = git tag -l "staging-*" | Sort-Object -Descending | Select-Object -First 1
Write-Host "Deployment tag: $DEPLOY_TAG"
```

**Success Criteria:**
- ✅ Tag created successfully
- ✅ Deployment completes
- ✅ Application accessible

---

### Test 3.2: Execute Rollback

**Objective:** Test complete rollback procedure with time measurement

```bash
# 1. Record start time
$startTime = Get-Date

# 2. Trigger rollback workflow
gh workflow run production-rollback.yml `
  -f tag=$DEPLOY_TAG `
  -f restore_database=true `
  -f skip_health_check=false

# 3. Monitor progress
gh run watch

# 4. Calculate duration
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalMinutes
Write-Host "Rollback completed in $duration minutes"
```

**Success Criteria:**
- ✅ Tag validation passes
- ✅ Current state backup created
- ✅ Database restored successfully
- ✅ Backend rolled back
- ✅ Frontend rolled back
- ✅ Health checks pass
- ✅ **Total time <15 minutes** ⏱️

**Record Results:**
```
Start time: _______
End time: _______
Total duration: _______ minutes
Tag validation: ✅ PASS / ❌ FAIL
Backup created: ✅ PASS / ❌ FAIL
DB restored: ✅ PASS / ❌ FAIL
Backend rollback: ✅ PASS / ❌ FAIL
Frontend rollback: ✅ PASS / ❌ FAIL
Health checks: ✅ PASS / ❌ FAIL
Time <15min: ✅ PASS / ❌ FAIL
Overall status: ✅ PASS / ❌ FAIL
```

---

### Test 3.3: Verify Rollback Success

**Objective:** Confirm application state after rollback

```bash
# 1. Check backend health
curl https://api-staging.your-domain.com/api/health | ConvertFrom-Json

# 2. Check frontend
curl -I https://staging.your-domain.com

# 3. Verify database state
mongosh $env:MONGODB_URI --eval "db.users.countDocuments({})"

# 4. Check logs
gh run view --log
```

**Success Criteria:**
- ✅ Backend returns healthy status
- ✅ Frontend returns 200 OK
- ✅ Database has expected data
- ✅ No errors in logs

---

## 🧪 Test Suite 4: Acceptance Criteria Validation

### Criterion 1️⃣: Manual Approval Required ✅

**Test:**
```bash
# Try to deploy without approval (should wait)
gh workflow run production-deploy.yml

# Check workflow status
gh run list --workflow=production-deploy.yml --limit 1

# Should show "waiting" for environment approval
```

**Expected:** Deployment waits for manual approval

**Result:** ✅ PASS / ❌ FAIL

---

### Criterion 2️⃣: Rollback Documented and Tested ✅

**Test:**
- ✅ Documentation exists: `docs/PRODUCTION-ROLLBACK-GUIDE.md`
- ✅ E2E rollback test completed (Test 3.2)

**Expected:** Both documentation and testing complete

**Result:** ✅ PASS / ❌ FAIL

---

### Criterion 3️⃣: Database Backups Before Deployment ✅

**Test:**
```bash
# Check workflow includes backup job
cat .github/workflows/production-deploy.yml | grep -A 20 "backup-database:"

# Verify Test 1.1 passed
```

**Expected:** Backup job exists and tested successfully

**Result:** ✅ PASS / ❌ FAIL

---

### Criterion 4️⃣: Automatic Health Checks ✅

**Test:**
```bash
# Check workflow includes health check job
cat .github/workflows/production-deploy.yml | grep -A 20 "health-check:"

# Verify Test 1.3 passed
```

**Expected:** Health check job exists and tested successfully

**Result:** ✅ PASS / ❌ FAIL

---

### Criterion 5️⃣: Rollback Time <15 Minutes ✅

**Test:**
- Verify Test 3.2 completed in <15 minutes

**Expected:** Total rollback time documented and <15 min

**Result:** ✅ PASS / ❌ FAIL

---

## 📊 Final Validation Report

### Summary

| Test Suite | Tests | Passed | Failed | Status |
|------------|-------|--------|--------|--------|
| Script Validation | 3 | __ | __ | ⏳ |
| Workflow Validation | 2 | __ | __ | ⏳ |
| E2E Rollback Test | 3 | __ | __ | ⏳ |
| Acceptance Criteria | 5 | __ | __ | ⏳ |
| **TOTAL** | **13** | **__** | **__** | **⏳** |

### Acceptance Criteria Status

- [ ] 1️⃣ Manual approval required
- [ ] 2️⃣ Rollback documented and tested
- [ ] 3️⃣ Database backups automated
- [ ] 4️⃣ Health checks automated
- [ ] 5️⃣ Rollback time <15 minutes

### Overall Status

**AW-26 Completion:** ⏳ **___%** 

**Production Ready:** ✅ YES / ❌ NO

**Sign-off:** ________________ (Reviewer)

**Date:** ________________

---

## 📝 Notes and Issues

### Issues Found During Testing

```
Issue #1:
Description: 
Resolution: 
Status: 

Issue #2:
Description: 
Resolution: 
Status: 
```

### Improvements Identified

```
1. 
2. 
3. 
```

---

## 🎯 Next Steps After Validation

Once all tests pass:

1. **Update AW-26-COMPLETION-REPORT.md**
   - Mark as 100% complete
   - Add actual test results
   - Include measured metrics

2. **Configure Production Secrets**
   - Replace staging values with production
   - Verify all secrets are set

3. **Team Training**
   - Walkthrough PRODUCTION-ROLLBACK-GUIDE.md
   - Practice rollback procedure
   - Assign on-call rotation

4. **Go Live**
   - First production deployment
   - Monitor closely
   - Document any issues

5. **Post-Deployment**
   - Monitor for 24 hours
   - Collect metrics
   - Update documentation based on learnings

---

**Testing Started:** ________________  
**Testing Completed:** ________________  
**Total Testing Time:** ________________  
**Validated By:** ________________
