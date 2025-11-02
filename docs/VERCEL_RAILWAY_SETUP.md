# 🚀 Guide de Configuration: Vercel + Railway (Gratuit)

Ce guide vous accompagne pour déployer votre application sur Vercel (Frontend) + Railway (Backend).

**⏱️ Temps estimé**: 45 minutes  
**💰 Coût**: 0€ (100% gratuit)

---

## ✅ Prérequis Complétés

- [x] Compte GitHub
- [x] MongoDB Atlas configuré
- [x] Connection string MongoDB sauvegardée

---

## 🎯 Phase 2: Configuration Google OAuth (10 min)

### 2.1 Créer les credentials staging

1. **Aller sur** https://console.cloud.google.com
2. Sélectionner votre projet (ou en créer un: "Agence Immobilière")
3. **Menu** → "APIs & Services" → "Credentials"

### 2.2 Configurer OAuth Consent Screen (si première fois)

1. Cliquer "Configure Consent Screen"
2. Choisir "External"
3. **App name**: Agence Immobilière Staging
4. **User support email**: Votre email
5. **Developer contact**: Votre email
6. Cliquer "Save and Continue" (×3)
7. Retour dans "Credentials"

### 2.3 Créer OAuth Client ID

1. "Create Credentials" → "OAuth 2.0 Client ID"
2. **Application type**: Web application
3. **Name**: Agence Staging OAuth
4. **Authorized JavaScript origins**: 
   ```
   https://agence-immobiliere-staging.vercel.app
   ```
   *(on mettra la vraie URL après)*

5. **Authorized redirect URIs**:
   ```
   https://agence-immobiliere-staging.up.railway.app/api/auth/google/callback
   ```
   *(on mettra la vraie URL après)*

6. Cliquer "Create"

### 2.4 Sauvegarder les credentials

**Client ID**: `xxxxx.apps.googleusercontent.com`  
**Client Secret**: `GOCSPX-xxxxx`

✅ **SAUVEGARDER CES VALEURS** (on les utilisera dans GitHub Secrets)

---

## 🚂 Phase 3: Configuration Railway (Backend) - 15 min

### 3.1 Créer un compte Railway

1. **Aller sur**: https://railway.app
2. **Cliquer** "Login" → "Login with GitHub"
3. Autoriser Railway à accéder à votre GitHub

### 3.2 Créer un nouveau projet

1. **Dashboard Railway** → "New Project"
2. **Choisir** "Deploy from GitHub repo"
3. **Sélectionner** votre repo `agence-immobiliere-app`
4. Railway va scanner le repo

### 3.3 Configurer le service Backend

1. Railway détecte automatiquement le backend
2. **Root Directory**: `/backend`
3. **Builder**: Nixpacks (auto-détecté)
4. **Start Command**: `npm start`

### 3.4 Ajouter les variables d'environnement

Dans Railway, aller dans votre service → **Variables**:

```env
NODE_ENV=staging
PORT=5000
MONGODB_URI=<VOTRE_CONNECTION_STRING_MONGODB>
JWT_SECRET=<GÉNÉRER_UN_SECRET>
SESSION_SECRET=<GÉNÉRER_UN_SECRET>
GOOGLE_CLIENT_ID=<VOTRE_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<VOTRE_GOOGLE_CLIENT_SECRET>
FRONTEND_URL=https://agence-immobiliere-staging.vercel.app
```

**Générer les secrets** (dans PowerShell local):
```powershell
# JWT Secret
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# Session Secret  
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3.5 Générer un domaine public

1. Dans Railway, onglet **Settings**
2. Section **Networking** → "Generate Domain"
3. Railway génère une URL: `https://xxx.up.railway.app`
4. ✅ **SAUVEGARDER CETTE URL** (Backend URL)

### 3.6 Récupérer le token Railway

1. Aller dans **Account Settings** (icône profil en haut à droite)
2. **Tokens** → "Create New Token"
3. **Name**: GitHub Actions
4. **Expiration**: 1 year
5. Cliquer "Create"
6. ✅ **COPIER ET SAUVEGARDER LE TOKEN** (ne sera plus visible)

---

## 🔷 Phase 4: Configuration Vercel (Frontend) - 15 min

### 4.1 Créer un compte Vercel

1. **Aller sur**: https://vercel.com
2. **Cliquer** "Sign Up" → "Continue with GitHub"
3. Autoriser Vercel à accéder à votre GitHub

### 4.2 Créer un nouveau projet

1. **Dashboard Vercel** → "Add New..." → "Project"
2. **Import** votre repo `agence-immobiliere-app`
3. Cliquer "Import"

### 4.3 Configurer le projet

1. **Framework Preset**: Next.js (auto-détecté)
2. **Root Directory**: `frontend` ✅ IMPORTANT
3. **Build Command**: `npm run build` (auto)
4. **Output Directory**: `.next` (auto)

### 4.4 Ajouter les variables d'environnement

Section **Environment Variables**:

```env
NEXT_PUBLIC_API_URL=https://xxx.up.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<VOTRE_GOOGLE_CLIENT_ID>
```

Remplacer `https://xxx.up.railway.app` par l'URL Railway de la Phase 3.

5. Cliquer "Deploy"

### 4.5 Récupérer l'URL Vercel

1. Attendre la fin du build (~2 min)
2. Vercel affiche l'URL: `https://agence-immobiliere-app.vercel.app`
3. ✅ **SAUVEGARDER CETTE URL** (Frontend URL)

### 4.6 Récupérer les IDs et Token Vercel

1. **Settings** du projet Vercel
2. **General** → noter:
   - **Project ID**: `prj_xxxxx`
   - **Org/Team ID**: Dans l'URL ou Settings → Team

3. **Tokens**:
   - Aller sur https://vercel.com/account/tokens
   - "Create Token"
   - **Name**: GitHub Actions
   - **Scope**: Full Account
   - **Expiration**: No Expiration
   - Cliquer "Create"
   - ✅ **COPIER LE TOKEN**

---

## 🔄 Phase 5: Mettre à jour Google OAuth (5 min)

Maintenant qu'on a les vraies URLs:

1. Retour sur **Google Cloud Console** → Credentials
2. Éditer votre OAuth Client
3. **Authorized JavaScript origins**:
   ```
   https://agence-immobiliere-app.vercel.app
   ```

4. **Authorized redirect URIs**:
   ```
   https://xxx.up.railway.app/api/auth/google/callback
   ```

5. **Sauvegarder**

---

## 🔐 Phase 6: Configuration GitHub Secrets (10 min)

### 6.1 Aller dans Settings GitHub

1. Votre repo sur GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. "New repository secret"

### 6.2 Créer les secrets

Créer **chaque secret** individuellement:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `RAILWAY_TOKEN` | Le token Railway | Phase 3.6 |
| `RAILWAY_BACKEND_URL` | `https://xxx.up.railway.app` | Phase 3.5 |
| `VERCEL_TOKEN` | Le token Vercel | Phase 4.6 |
| `VERCEL_ORG_ID` | L'ID org/team Vercel | Phase 4.6 |
| `VERCEL_PROJECT_ID` | L'ID du projet Vercel | Phase 4.6 |
| `VERCEL_URL` | `https://agence-immobiliere-app.vercel.app` | Phase 4.5 |
| `STAGING_GOOGLE_CLIENT_ID` | Client ID Google | Phase 2.4 |
| `STAGING_GOOGLE_CLIENT_SECRET` | Client Secret Google | Phase 2.4 |

**Total**: 8 secrets à créer

---

## 🧪 Phase 7: Test du Déploiement (10 min)

### 7.1 Commit et push les changements

```powershell
cd C:\Users\LENOVO\agence-immobiliere-app

git add .
git commit -m "feat: Add Vercel + Railway deployment workflow"
git push origin feature/AW-21-staging-deployment
```

### 7.2 Créer et merger la PR

1. Sur GitHub, créer une Pull Request
2. Merger vers `main`
3. Le workflow se déclenche automatiquement

### 7.3 Surveiller le déploiement

1. GitHub → **Actions**
2. "Staging Deployment (Vercel + Railway)" en cours
3. Observer les logs

### 7.4 Vérifier le déploiement

```powershell
# Test Backend
curl https://xxx.up.railway.app/health

# Test Frontend
curl https://agence-immobiliere-app.vercel.app
```

Dans le navigateur:
- **Backend**: https://xxx.up.railway.app
- **Frontend**: https://agence-immobiliere-app.vercel.app
- **Login Google**: Tester l'authentification

---

## ✅ Checklist Finale

### Configuration
- [ ] MongoDB Atlas configuré
- [ ] Google OAuth configuré
- [ ] Railway backend déployé
- [ ] Vercel frontend déployé
- [ ] URLs mises à jour dans Google OAuth
- [ ] 8 GitHub Secrets configurés

### Tests
- [ ] Backend /health répond 200
- [ ] Frontend accessible
- [ ] Login Google fonctionne
- [ ] API endpoints fonctionnent

---

## 💰 Limites Gratuites

### Railway (Gratuit)
- **500 heures d'exécution** par mois
- **8 GB RAM** max
- **100 GB bandwidth** par mois
- ✅ Largement suffisant pour staging

### Vercel (Gratuit - Hobby)
- **100 GB bandwidth** par mois
- **100 builds** par jour
- **Serverless functions**: Illimitées
- ✅ Parfait pour staging et petits projets

### MongoDB Atlas (Gratuit - M0)
- **512 MB storage**
- **Shared CPU**
- ✅ Suffisant pour staging

**Total**: 0€/mois! 🎉

---

## 🆘 Dépannage

### Railway ne démarre pas
```powershell
# Vérifier les logs dans Railway Dashboard
# Settings → Deployments → Cliquer sur le deploy → View Logs
```

### Vercel build échoue
- Vérifier que Root Directory = `frontend`
- Vérifier les variables d'environnement
- Voir les logs dans Vercel Dashboard

### MongoDB connection error
- Vérifier la connection string
- Vérifier Network Access (0.0.0.0/0 autorisé)
- Vérifier le mot de passe (pas de caractères spéciaux problématiques)

### OAuth ne fonctionne pas
- Vérifier les URLs dans Google Cloud Console
- Vérifier les secrets GitHub
- Vérifier FRONTEND_URL dans Railway

---

## 🎉 Bravo!

Vous avez maintenant:
- ✅ Staging automatisé 100% gratuit
- ✅ Déploiement sur chaque merge
- ✅ Backend + Frontend + Database
- ✅ OAuth Google fonctionnel
- ✅ Zéro coût!

## 📅 Prochaines Étapes

1. **Tester** le staging complet
2. **AW-22**: Tests E2E
3. **Épique 1**: Gestion des biens
