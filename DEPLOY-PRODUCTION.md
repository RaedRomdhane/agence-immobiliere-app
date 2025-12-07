# 🚀 Deploy to Production - QR Codes Working from Any WiFi

## Current Setup
- **Frontend**: Vercel - `https://agence-immobiliere-app-4naj-hopf62eis.vercel.app`
- **Backend**: Railway - `https://illustrious-cooperation-production-52c2.up.railway.app`
- **Database**: MongoDB Atlas (Staging)

## 📋 Step-by-Step Deployment

### 1. Configure Railway (Backend) Environment Variables

Go to Railway dashboard: https://railway.app/dashboard

Click on your backend project → Variables tab → Add these:

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

**Get values from:** `backend/.env.production` file

### 2. Configure Vercel (Frontend) Environment Variables

Go to Vercel dashboard: https://vercel.com/dashboard

Click on your project → Settings → Environment Variables → Add these:

```bash
NEXT_PUBLIC_API_URL=https://illustrious-cooperation-production-52c2.up.railway.app/api
NEXT_PUBLIC_APP_NAME=Agence Immobiliere
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_WS_URL=wss://illustrious-cooperation-production-52c2.up.railway.app
STRIPE_SECRET_KEY=your_stripe_secret_key
```

**Get values from:** `frontend/.env.production` file

### 3. Deploy Backend to Railway

```bash
# Push to main branch (Railway auto-deploys)
git add .
git commit -m "Configure production environment"
git push origin main
```

Railway will automatically deploy your backend.

### 4. Deploy Frontend to Vercel

```bash
# Vercel also auto-deploys from main branch
# Or manually deploy:
cd frontend
vercel --prod
```

### 5. Regenerate ALL QR Codes for Production

Once both are deployed, regenerate QR codes to use production URLs:

**Option A: Via Railway CLI**
```bash
# Install Railway CLI if not installed
npm i -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Run the script on Railway
railway run node scripts/regenerate-qrcodes.js
```

**Option B: Via MongoDB Connection (Local)**

Update `backend/.env` temporarily to use production MongoDB and URL:
```bash
MONGODB_URI=mongodb+srv://agence-staging:ORafbIXFX5qYUTjj@agence-staging.oa1k6fs.mongodb.net/agence-staging?retryWrites=true&w=majority&appName=agence-staging
FRONTEND_URL=https://agence-immobiliere-app-4naj-hopf62eis.vercel.app
```

Then run:
```bash
cd backend
node scripts/regenerate-qrcodes.js
```

Restore `backend/.env` after:
```bash
MONGODB_URI=mongodb://localhost:27017/agence-immobiliere-dev
FRONTEND_URL=http://192.168.1.5:3000
```

### 6. Test Production QR Codes

1. Go to your production site: `https://agence-immobiliere-app-4naj-hopf62eis.vercel.app`
2. Login as admin
3. Go to properties page
4. View any property's QR code (you may need to add a QR display feature)
5. Scan with your phone - should open: `https://agence-immobiliere-app-4naj-hopf62eis.vercel.app/properties/[id]`
6. Works from **any WiFi network** in the world! 🌍

## 🎯 Result

After deployment:

✅ **Local Development (Any WiFi)**
- Update IPs in `.env` files based on your current network
- Restart servers
- Regenerate QR codes

✅ **Production (Any WiFi, Anywhere)**
- Frontend: `https://agence-immobiliere-app-4naj-hopf62eis.vercel.app`
- Backend: `https://illustrious-cooperation-production-52c2.up.railway.app`
- QR codes work from **anywhere in the world** 🌍
- No IP changes needed!

## 🔄 Switching Between Local and Production

**For Local Development:**
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://192.168.1.5:5000/api
NEXT_PUBLIC_WS_URL=ws://192.168.1.5:5000

# backend/.env
FRONTEND_URL=http://192.168.1.5:3000
```

**For Production:**
- Environment variables are automatically managed by Vercel and Railway
- No code changes needed!

## 📱 Testing QR Codes

**Local (Same WiFi):**
```
http://192.168.1.5:3000/properties/[id]
```

**Production (Any WiFi):**
```
https://agence-immobiliere-app-4naj-hopf62eis.vercel.app/properties/[id]
```

## 🚨 Important Notes

1. **Every time you change WiFi locally**, update the IP in both `.env` files
2. **Production never needs IP updates** - URLs are permanent
3. **Regenerate QR codes** after changing environment URLs
4. **MongoDB Atlas** is already configured for production use

## 🎉 You're Done!

Your app now works:
- ✅ From any WiFi with local development (after updating IPs)
- ✅ From anywhere in the world in production
- ✅ QR codes work correctly in both environments
