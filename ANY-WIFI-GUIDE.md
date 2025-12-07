# 🌍 Work from ANY WiFi - Complete Guide

## The Problem with Local Development

When you run locally:
- Backend uses IP like `http://192.168.56.1:5000`
- Frontend uses IP like `http://192.168.56.1:3000`
- **QR codes embed this IP** → Only work on SAME WiFi
- **Change WiFi?** → Must update IPs and regenerate QR codes ❌

## ✅ The Solution: Production Deployment

Deploy to **Vercel + Railway** once → Get permanent URLs that work from **ANY WiFi** worldwide!

### Production URLs (Never Change)
- Frontend: `https://agence-immobiliere-app-4naj-hopf62eis.vercel.app`
- Backend: `https://illustrious-cooperation-production-52c2.up.railway.app`
- QR Codes: Point to Vercel URL → **Work from anywhere!** 🌍

---

## 🚀 Quick Deploy (One-Time Setup)

### Step 1: Configure Railway (Backend)

1. Go to: https://railway.app/dashboard
2. Click your backend project
3. Go to **Variables** tab
4. Add these variables:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
FRONTEND_URL=https://agence-immobiliere-app-4naj-hopf62eis.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://illustrious-cooperation-production-52c2.up.railway.app/api/auth/google/callback
```

**Copy values from:** `backend/.env.production`

**IMPORTANT**: The `FRONTEND_URL` is what QR codes will use! This never changes, so QR codes work forever.

### Step 2: Configure Vercel (Frontend)

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add these for **Production**:

```bash
NEXT_PUBLIC_API_URL=https://illustrious-cooperation-production-52c2.up.railway.app/api
NEXT_PUBLIC_APP_NAME=Agence Immobiliere
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_WS_URL=wss://illustrious-cooperation-production-52c2.up.railway.app
STRIPE_SECRET_KEY=your_stripe_secret_key
```

**Copy values from:** `frontend/.env.production`

### Step 3: Deploy

```powershell
# Option 1: Use deploy script (recommended)
.\scripts\deploy-production.ps1

# Option 2: Manual deploy
git add .
git commit -m "Deploy to production"
git push origin main
```

Both Vercel and Railway will **auto-deploy** when you push to GitHub!

### Step 4: Regenerate QR Codes (One Time Only)

After deployment completes (wait 2-3 minutes):

```bash
# Install Railway CLI first (one time)
# Visit: https://docs.railway.app/guides/cli

# Then regenerate QR codes on production database
railway run node backend/scripts/regenerate-qrcodes.js
```

This updates all QR codes to use the Vercel URL instead of local IPs.

---

## 🎉 Result: Universal Access

After deployment:

### ✅ Frontend Works Everywhere
- Access from home WiFi: ✅
- Access from office WiFi: ✅
- Access from phone data (4G/5G): ✅
- Access from café WiFi: ✅
- Access from anywhere in the world: ✅

### ✅ QR Codes Work Everywhere
- Scan from home WiFi: ✅
- Scan from different WiFi: ✅
- Scan from phone data: ✅
- Scan months later: ✅
- Never need to regenerate again: ✅

### ✅ No More Scripts!
- ❌ No more `switch-env.ps1`
- ❌ No more IP updates
- ❌ No more QR regeneration
- ✅ Just works! Always!

---

## 🔄 Development Workflow

### For Local Development (Testing/Development)
```powershell
# When changing WiFi at home/office
.\scripts\switch-env.ps1 local
cd backend; npm run dev    # Terminal 1
cd frontend; npm run dev   # Terminal 2
cd backend; node scripts/regenerate-qrcodes.js  # Terminal 3
```

### For Production (Real Users)
```powershell
# Deploy new features
git add .
git commit -m "Add new feature"
git push origin main
# Done! Auto-deploys to production
```

---

## 📊 Comparison

| Aspect | Local (Current) | Production (After Deploy) |
|--------|----------------|---------------------------|
| **URL** | `http://192.168.56.1:3000` | `https://your-app.vercel.app` |
| **Changes WiFi?** | Must update IPs | Works automatically ✅ |
| **QR Codes** | Must regenerate | Work forever ✅ |
| **Access From** | Same WiFi only | Anywhere worldwide 🌍 |
| **Scripts Needed** | Yes, every WiFi change | No! Never! ✅ |
| **Phone Data (4G)** | ❌ Doesn't work | ✅ Works! |
| **Share with Others** | ❌ They need your WiFi | ✅ Works from anywhere |

---

## 🆘 Troubleshooting

### QR codes still showing old IP?
- You forgot Step 4: Run `railway run node backend/scripts/regenerate-qrcodes.js`

### Railway/Vercel environment variables not set?
- Go back to Step 1 and Step 2, make sure ALL variables are added

### How do I know if deployment succeeded?
- Visit: `https://agence-immobiliere-app-4naj-hopf62eis.vercel.app`
- If it loads → ✅ Success!

### Can I still develop locally?
- Yes! Use `.\scripts\switch-env.ps1 local` for local development
- Production stays online for real users while you develop

---

## 📚 Additional Resources

- **Full deployment guide**: `DEPLOY-PRODUCTION.md`
- **Local development**: `QUICK-START-WIFI.md`
- **Railway docs**: https://docs.railway.app
- **Vercel docs**: https://vercel.com/docs
