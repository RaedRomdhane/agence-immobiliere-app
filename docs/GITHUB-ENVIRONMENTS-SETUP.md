# GitHub Environments Configuration Guide
## AW-26 Production Pipeline Setup

**Date:** November 7, 2025  
**Repository:** RaedRomdhane/agence-immobiliere-app  
**Estimated Time:** 15 minutes

---

## 📋 Overview

This guide will help you configure the two GitHub Environments required for the AW-26 production pipeline:
1. **`production`** - For production deployments (with approval)
2. **`production-rollback`** - For rollback operations (with approval)

---

## 🚀 Step 1: Navigate to Repository Settings

1. Open your browser and go to:
   ```
   https://github.com/RaedRomdhane/agence-immobiliere-app
   ```

2. Click on **"Settings"** tab (top right of the repository)

3. In the left sidebar, scroll down to **"Environments"** (under "Code and automation" section)

4. Click on **"Environments"**

---

## 🏗️ Step 2: Create "production" Environment

### 2.1 Create the Environment

1. Click the **"New environment"** button (green button on the right)

2. In the "Name" field, enter:
   ```
   production
   ```

3. Click **"Configure environment"**

### 2.2 Configure Protection Rules

You should now see the environment configuration page. Configure the following:

#### ✅ Required Reviewers

1. Check the box **"Required reviewers"**

2. Click **"Add required reviewers"**

3. Add team members who should approve production deployments:
   - Search and add at least 2 team members
   - Example: Add yourself and one other developer
   
4. **Recommended:** Keep "Prevent self-review" checked (if available)

#### ✅ Wait Timer

1. Check the box **"Wait timer"**

2. Set the wait time to **5 minutes**
   - This gives time to review deployment details before it proceeds
   - Can be adjusted based on your team's needs

#### ✅ Deployment Branches

1. In the **"Deployment branches"** section:
   - Select **"Selected branches"**
   
2. Click **"Add deployment branch rule"**

3. In the pattern field, enter:
   ```
   main
   ```
   
4. Click **"Add rule"**

This ensures only the `main` branch can deploy to production.

### 2.3 Environment Secrets (Optional - Later)

- Don't add secrets yet
- We'll add them in Step 4 after creating both environments

### 2.4 Save Configuration

- The settings are auto-saved as you configure
- You should see: "Environment protection rules have been updated"

---

## 🔄 Step 3: Create "production-rollback" Environment

### 3.1 Create the Environment

1. Go back to **Environments** page:
   - Click "Environments" in the left sidebar again
   
2. Click the **"New environment"** button

3. In the "Name" field, enter:
   ```
   production-rollback
   ```

4. Click **"Configure environment"**

### 3.2 Configure Protection Rules

#### ✅ Required Reviewers

1. Check the box **"Required reviewers"**

2. Click **"Add required reviewers"**

3. Add the same team members (at least 2)
   - Same reviewers as production environment
   
#### ⚠️ Wait Timer - IMPORTANT DIFFERENCE

1. Check the box **"Wait timer"**

2. Set the wait time to **0 minutes**
   - **This is critical for emergency rollbacks!**
   - No waiting period for rollback operations
   
#### ✅ Deployment Branches

1. In the **"Deployment branches"** section:
   - Select **"All branches"**
   
This allows rollback from any branch (you might need to rollback to a tag/branch other than main).

### 3.3 Save Configuration

- Settings are auto-saved
- You should see: "Environment protection rules have been updated"

---

## 🔐 Step 4: Add Production Secrets

Now we'll add the required secrets for production deployments.

### 4.1 Navigate to Secrets

1. In the left sidebar, click **"Secrets and variables"** → **"Actions"**

2. You should see the **"Secrets"** tab

### 4.2 Add Required Secrets

Click **"New repository secret"** for each of the following:

#### Secret 1: MONGODB_URI_PRODUCTION
```
Name: MONGODB_URI_PRODUCTION
Value: mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]?retryWrites=true&w=majority
```
**Note:** Use your **production** MongoDB URI, not staging!

#### Secret 2: RAILWAY_TOKEN
```
Name: RAILWAY_TOKEN
Value: [Your Railway API token]
```
**How to get:** 
- Go to https://railway.app/account/tokens
- Create new token
- Copy and paste here

#### Secret 3: RAILWAY_PROJECT_ID_PRODUCTION
```
Name: RAILWAY_PROJECT_ID_PRODUCTION
Value: [Your production project ID]
```
**How to get:**
- Go to your Railway production project
- Project ID is in the URL: `railway.app/project/[PROJECT_ID]`

#### Secret 4: VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Value: [Your Vercel token]
```
**How to get:**
- Go to https://vercel.com/account/tokens
- Create new token
- Copy and paste here

#### Secret 5: VERCEL_ORG_ID
```
Name: VERCEL_ORG_ID
Value: [Your Vercel organization ID]
```
**How to get:**
- Go to https://vercel.com/account
- Or run: `vercel --token=[token] whoami`

#### Secret 6: VERCEL_PROJECT_ID_PRODUCTION
```
Name: VERCEL_PROJECT_ID_PRODUCTION
Value: [Your production project ID]
```
**How to get:**
- Go to your Vercel production project settings
- Project ID is shown in Settings → General

#### Secret 7: NEXT_PUBLIC_API_URL_PRODUCTION
```
Name: NEXT_PUBLIC_API_URL_PRODUCTION
Value: https://api.your-production-domain.com
```
**Note:** Use your actual production backend URL

#### Secret 8: BACKEND_URL_PRODUCTION
```
Name: BACKEND_URL_PRODUCTION
Value: https://api.your-production-domain.com
```
**Note:** Same as Secret 7 (used for health checks)

#### Secret 9: FRONTEND_URL_PRODUCTION
```
Name: FRONTEND_URL_PRODUCTION
Value: https://www.your-production-domain.com
```
**Note:** Your production frontend URL

#### Secret 10: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```
Name: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: [Your Google Maps API key]
```
**Note:** Same key you use in development (from .env file)

---

## ✅ Step 5: Verify Configuration

### 5.1 Check Environments

1. Go back to **Settings** → **Environments**

2. You should see two environments:
   ```
   ✅ production
   ✅ production-rollback
   ```

3. Click on each environment to verify:

**For "production":**
- ✅ Required reviewers: 2+ members
- ✅ Wait timer: 5 minutes
- ✅ Deployment branches: main only

**For "production-rollback":**
- ✅ Required reviewers: 2+ members
- ✅ Wait timer: 0 minutes
- ✅ Deployment branches: All branches

### 5.2 Check Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**

2. You should see 10 secrets listed:
   ```
   ✅ MONGODB_URI_PRODUCTION
   ✅ RAILWAY_TOKEN
   ✅ RAILWAY_PROJECT_ID_PRODUCTION
   ✅ VERCEL_TOKEN
   ✅ VERCEL_ORG_ID
   ✅ VERCEL_PROJECT_ID_PRODUCTION
   ✅ NEXT_PUBLIC_API_URL_PRODUCTION
   ✅ BACKEND_URL_PRODUCTION
   ✅ FRONTEND_URL_PRODUCTION
   ✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   ```

---

## 🧪 Step 6: Test Configuration (Optional)

### 6.1 Test Workflow Trigger

1. Go to **Actions** tab in your repository

2. Click on **"Production Deployment"** workflow (left sidebar)

3. Click **"Run workflow"** button (right side)

4. Select branch: `main`

5. Leave options as default:
   - Skip tests: false
   - Skip backup: false

6. Click **"Run workflow"**

### 6.2 Verify Approval Gate

1. Wait a few seconds, then refresh the page

2. You should see a new workflow run

3. Click on the workflow run

4. The workflow should pause at the **"deploy-production"** job

5. You should see: **"Waiting for review"** or **"Review required"**

6. Click **"Review deployments"**

7. Select **"production"** environment

8. Click **"Approve and deploy"** or **"Reject"** (your choice for testing)

**✅ If you see the approval screen, configuration is correct!**

### 6.3 Cancel Test Workflow (Optional)

- If you don't want to actually deploy, you can cancel the workflow:
  1. Click the workflow run
  2. Click **"Cancel workflow"** (top right)

---

## 📊 Configuration Checklist

Use this checklist to track your progress:

### Environments
- [ ] "production" environment created
  - [ ] Required reviewers: 2+ members added
  - [ ] Wait timer: 5 minutes set
  - [ ] Deployment branches: main only
  
- [ ] "production-rollback" environment created
  - [ ] Required reviewers: 2+ members added
  - [ ] Wait timer: 0 minutes set
  - [ ] Deployment branches: All branches

### Secrets (10 total)
- [ ] MONGODB_URI_PRODUCTION
- [ ] RAILWAY_TOKEN
- [ ] RAILWAY_PROJECT_ID_PRODUCTION
- [ ] VERCEL_TOKEN
- [ ] VERCEL_ORG_ID
- [ ] VERCEL_PROJECT_ID_PRODUCTION
- [ ] NEXT_PUBLIC_API_URL_PRODUCTION
- [ ] BACKEND_URL_PRODUCTION
- [ ] FRONTEND_URL_PRODUCTION
- [ ] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

### Testing
- [ ] Workflow trigger test (optional)
- [ ] Approval gate verification (optional)

---

## 🎯 Next Steps After Configuration

Once everything is configured:

1. **Update AW-26 Status**
   - Mark as 100% complete including configuration ✅
   
2. **Team Training**
   - Share `docs/PRODUCTION-ROLLBACK-GUIDE.md` with team
   - Walk through rollback procedures
   - Assign on-call rotation
   
3. **First Production Deployment**
   - Plan your first deployment
   - Have team ready for approval
   - Monitor closely during deployment
   
4. **Monitor & Iterate**
   - Collect metrics (deployment time, rollback time)
   - Update documentation based on experience
   - Optimize workflows as needed

---

## 🆘 Troubleshooting

### Issue: Can't find "Environments" in Settings

**Solution:** You need admin access to the repository
- Ask repository owner to give you admin access
- Or ask them to configure environments using this guide

### Issue: Can't add required reviewers

**Solution:** Make sure reviewers have at least "Write" access
- Go to Settings → Collaborators
- Add team members with "Write" or "Admin" access
- Then add them as reviewers

### Issue: Secrets not showing in workflow

**Solution:** 
- Secrets are only available to specific branches/environments
- Make sure you're deploying from the correct branch (main)
- Check secret names match exactly (case-sensitive)

### Issue: Workflow doesn't pause for approval

**Solution:**
- Make sure workflow uses `environment: production`
- Check that environment has required reviewers configured
- Ensure you're deploying from an allowed branch

---

## 📚 Additional Resources

- **GitHub Environments Docs:** https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment
- **GitHub Secrets Docs:** https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Railway Docs:** https://docs.railway.app/
- **Vercel Docs:** https://vercel.com/docs

---

## ✅ Configuration Complete!

Once you've completed all steps in this guide:

1. Check off all items in the checklist above
2. Run the test workflow (Step 6.1)
3. Verify approval gate works (Step 6.2)
4. Your production pipeline is ready! 🚀

**Time to complete:** ~15 minutes (not including getting tokens/credentials)

---

**Need help?** 
- Review: `docs/PRODUCTION-ROLLBACK-GUIDE.md`
- Review: `docs/AW-26-TESTING-PLAN.md`
- Check workflow files for reference: `.github/workflows/production-*.yml`

**Configuration Started:** ________________  
**Configuration Completed:** ________________  
**Configured By:** ________________
