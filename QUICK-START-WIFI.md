# 🚀 Quick Start Guide - Work from Any WiFi

## 🏠 Local Development (Current WiFi)

### First Time Setup or New WiFi Network

```powershell
# Auto-detect your IP and configure everything
.\scripts\switch-env.ps1 local
```

This will:
- ✅ Detect your current local IP
- ✅ Update backend `.env`
- ✅ Update frontend `.env.local`
- ✅ Configure WebSocket URL

Then:
```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev

# Terminal 3 - Regenerate QR Codes
cd backend
node scripts/regenerate-qrcodes.js
```

**Access:**
- Frontend: `http://[YOUR_IP]:3000`
- Backend: `http://[YOUR_IP]:5000`
- QR codes work on same WiFi ✅

---

## 🌍 Production (Works Everywhere)

### Deploy Once, Works from Any WiFi Forever

1. **Configure Vercel (Frontend)**
   - Go to: https://vercel.com/dashboard
   - Add environment variables (see `DEPLOY-PRODUCTION.md`)

2. **Configure Railway (Backend)**
   - Go to: https://railway.app/dashboard
   - Add environment variables (see `DEPLOY-PRODUCTION.md`)

3. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

4. **Regenerate QR Codes for Production**
   ```bash
   # Connect to production MongoDB and run
   railway run node backend/scripts/regenerate-qrcodes.js
   ```

**Access (Works from anywhere 🌍):**
- Frontend: `https://agence-immobiliere-app-4naj-hopf62eis.vercel.app`
- Backend: `https://illustrious-cooperation-production-52c2.up.railway.app`
- QR codes work from **any WiFi, any country** ✅

---

## 📱 QR Code Behavior

| Environment | QR Code URL | Works From |
|------------|-------------|------------|
| **Local** | `http://192.168.1.5:3000/properties/[id]` | Same WiFi only |
| **Production** | `https://your-app.vercel.app/properties/[id]` | Anywhere 🌍 |

---

## 🔄 Switching Networks

### New WiFi at Home/Office?

```powershell
.\scripts\switch-env.ps1 local
# Then restart servers and regenerate QR codes
```

### Want to test production?

```powershell
.\scripts\switch-env.ps1 production
```

---

## 🆘 Common Issues

**QR codes not working?**
1. Check you're on same WiFi (local) or using production URLs
2. Regenerate QR codes after environment change
3. Restart both servers

**Different WiFi network?**
```powershell
.\scripts\switch-env.ps1 local
```

**Want permanent solution?**
- Deploy to production (see `DEPLOY-PRODUCTION.md`)
- QR codes work from any WiFi forever!

---

## 📚 Documentation

- **Full deployment guide**: `DEPLOY-PRODUCTION.md`
- **Project documentation**: `docs/DOCUMENTATION-PROJET.md`
- **Vercel/Railway setup**: `docs/VERCEL_RAILWAY_SETUP.md`
