# GitHub Environments - Quick Reference Card

## 🎯 URL to Start
```
https://github.com/RaedRomdhane/agence-immobiliere-app/settings/environments
```

---

## 📋 Environment 1: "prod-deploy"

**Name:** `prod-deploy`

**Protection Rules:**
- ✅ Required reviewers: 2 members
- ✅ Wait timer: 5 minutes  
- ✅ Deployment branches: `main` only

---

## 📋 Environment 2: "prod-rollback"

**Name:** `prod-rollback`

**Protection Rules:**
- ✅ Required reviewers: 2 members
- ✅ Wait timer: 0 minutes (emergency rollback!)
- ✅ Deployment branches: All branches

---

## 🔐 Secrets to Add (10 total)

**URL:** https://github.com/RaedRomdhane/agence-immobiliere-app/settings/secrets/actions

| # | Secret Name | Value |
|---|-------------|-------|
| 1 | `MONGODB_URI_PRODUCTION` | mongodb+srv://... |
| 2 | `RAILWAY_TOKEN` | From railway.app/account/tokens |
| 3 | `RAILWAY_PROJECT_ID_PRODUCTION` | From Railway project URL |
| 4 | `VERCEL_TOKEN` | From vercel.com/account/tokens |
| 5 | `VERCEL_ORG_ID` | From Vercel account |
| 6 | `VERCEL_PROJECT_ID_PRODUCTION` | From Vercel project settings |
| 7 | `NEXT_PUBLIC_API_URL_PRODUCTION` | https://api.your-domain.com |
| 8 | `BACKEND_URL_PRODUCTION` | https://api.your-domain.com |
| 9 | `FRONTEND_URL_PRODUCTION` | https://www.your-domain.com |
| 10 | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | From Google Cloud Console |

---

## ✅ Quick Checklist

- [ ] Environment "prod-deploy" created
- [ ] Environment "prod-rollback" created
- [ ] 10 secrets added
- [ ] Test workflow trigger (optional)

---

**Total Time:** ~15 minutes

**Full Guide:** See `docs/GITHUB-ENVIRONMENTS-SETUP.md`
