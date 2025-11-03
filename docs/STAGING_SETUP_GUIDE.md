# Guide de Configuration - Déploiement Staging

## 📋 Table des matières
1. [MongoDB Atlas Setup](#mongodb-atlas-setup)
2. [Railway Backend Setup](#railway-backend-setup)
3. [Vercel Frontend Setup](#vercel-frontend-setup)
4. [GitHub Secrets Configuration](#github-secrets-configuration)
5. [Google OAuth Configuration](#google-oauth-configuration)

---

## 1. MongoDB Atlas Setup

### Étape 1 : Créer un compte MongoDB Atlas
1. Aller sur [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Créer un compte gratuit
3. Choisir le plan **M0 Sandbox (FREE)**

### Étape 2 : Créer un cluster
1. Cliquer sur "Build a Database"
2. Choisir "M0 Free"
3. Région : **Europe (Frankfurt - eu-central-1)** ou la plus proche
4. Nom du cluster : `agence-staging-cluster`
5. Cliquer "Create"

### Étape 3 : Configurer l'accès réseau
1. Dans le menu, cliquer sur "Network Access"
2. Cliquer "Add IP Address"
3. Choisir "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ Pour staging uniquement, production doit avoir des IPs spécifiques
4. Confirmer

### Étape 4 : Créer un utilisateur de base de données
1. Dans le menu, cliquer sur "Database Access"
2. Cliquer "Add New Database User"
3. Méthode : **Password**
4. Username : `agence-staging-user`
5. Password : Générer un mot de passe fort (copier quelque part de sûr!)
6. Database User Privileges : **Read and write to any database**
7. Cliquer "Add User"

### Étape 5 : Obtenir la chaîne de connexion
1. Aller sur "Database" dans le menu
2. Cliquer sur "Connect" pour votre cluster
3. Choisir "Connect your application"
4. Driver : **Node.js** / Version: **5.5 or later**
5. Copier la connection string :
   ```
   mongodb+srv://agence-staging-user:<password>@agence-staging-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Remplacer `<password>` par le mot de passe créé à l'étape 4
7. Ajouter le nom de la base de données après `.mongodb.net/` :
   ```
   mongodb+srv://agence-staging-user:MOT_DE_PASSE@agence-staging-cluster.xxxxx.mongodb.net/agence-staging?retryWrites=true&w=majority
   ```

✅ **Conserver cette chaîne de connexion pour Railway !**

---

## 2. Railway Backend Setup

### Étape 1 : Créer un compte Railway
1. Aller sur [https://railway.app](https://railway.app)
2. Cliquer "Login" → "Login with GitHub"
3. Autoriser Railway à accéder à votre compte GitHub

### Étape 2 : Créer un nouveau projet
1. Dashboard Railway → "New Project"
2. Choisir "Deploy from GitHub repo"
3. Sélectionner le repository `agence-immobiliere-app`
4. Railway va détecter automatiquement le backend Node.js

### Étape 3 : Configurer le projet
1. Nom du service : `agence-immobiliere-backend`
2. Root Directory : Laisser vide (railway.toml gère ça)
3. Branch : `main`

### Étape 4 : Ajouter les variables d'environnement
Dans Settings → Variables, ajouter :

```env
NODE_ENV=staging
PORT=5000
MONGODB_URI=mongodb+srv://agence-staging-user:MOT_DE_PASSE@cluster.mongodb.net/agence-staging?retryWrites=true&w=majority
JWT_SECRET=<générer avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=<voir section Google OAuth>
GOOGLE_CLIENT_SECRET=<voir section Google OAuth>
CLIENT_URL=${{RAILWAY_STATIC_URL}}
```

### Étape 5 : Configurer le déploiement
1. Settings → Networking
2. Cliquer "Generate Domain"
3. Railway va créer une URL publique (ex: `agence-immobiliere-backend-production.up.railway.app`)
4. Copier cette URL ✅

### Étape 6 : Déployer
1. Railway va automatiquement builder et déployer
2. Vérifier les logs dans l'onglet "Deployments"
3. Tester : `https://VOTRE-URL.railway.app/health`

---

## 3. Vercel Frontend Setup

### Étape 1 : Créer un compte Vercel
1. Aller sur [https://vercel.com/signup](https://vercel.com/signup)
2. Cliquer "Continue with GitHub"
3. Autoriser Vercel

### Étape 2 : Importer le projet
1. Dashboard Vercel → "Add New" → "Project"
2. Importer `agence-immobiliere-app` depuis GitHub
3. Configure Project :
   - Framework Preset : **Next.js**
   - Root Directory : `frontend`
   - Build Command : `npm run build`
   - Output Directory : `.next`
   - Install Command : `npm install`

### Étape 3 : Ajouter les variables d'environnement
Dans Environment Variables, ajouter :

```env
NEXT_PUBLIC_API_URL=https://VOTRE-URL-RAILWAY.railway.app/api
NEXT_PUBLIC_APP_NAME=Agence Immobilière (Staging)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<voir section Google OAuth>
```

⚠️ Remplacer `VOTRE-URL-RAILWAY` par l'URL Railway de l'étape 2.5

### Étape 4 : Déployer
1. Cliquer "Deploy"
2. Vercel va builder et déployer automatiquement
3. URL générée : `https://agence-immobiliere-app.vercel.app`
4. Copier cette URL ✅

### Étape 5 : Mettre à jour Railway CLIENT_URL
1. Retourner sur Railway Dashboard
2. Variables → CLIENT_URL → Remplacer par l'URL Vercel
3. Redéployer le backend

---

## 4. GitHub Secrets Configuration

### Étape 1 : Obtenir les tokens
**Railway Token :**
1. Railway Dashboard → Account Settings → Tokens
2. Créer un nouveau token : "GitHub Actions Staging"
3. Copier le token ✅

**Vercel Token :**
1. Vercel Dashboard → Settings → Tokens
2. Create Token : "GitHub Actions Staging"
3. Scope : Full Account
4. Copier le token ✅

### Étape 2 : Ajouter les secrets dans GitHub
1. GitHub repository → Settings → Secrets and variables → Actions
2. Cliquer "New repository secret"
3. Ajouter ces secrets :

| Name | Value |
|------|-------|
| `RAILWAY_TOKEN` | Token Railway copié |
| `VERCEL_TOKEN` | Token Vercel copié |
| `STAGING_API_URL` | `https://VOTRE-URL.railway.app/api` |
| `STAGING_FRONTEND_URL` | `https://VOTRE-URL.vercel.app` |
| `STAGING_GOOGLE_CLIENT_ID` | Voir section Google OAuth |
| `STAGING_GOOGLE_CLIENT_SECRET` | Voir section Google OAuth |

---

## 5. Google OAuth Configuration

### Étape 1 : Créer un projet Google Cloud
1. Aller sur [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Créer un nouveau projet : "Agence Immobilière Staging"
3. Sélectionner le projet

### Étape 2 : Activer Google+ API
1. APIs & Services → Library
2. Rechercher "Google+ API"
3. Cliquer "Enable"

### Étape 3 : Configurer l'écran de consentement OAuth
1. APIs & Services → OAuth consent screen
2. User Type : **External**
3. App name : `Agence Immobilière Staging`
4. User support email : votre email
5. Developer contact : votre email
6. Sauvegarder

### Étape 4 : Créer les credentials OAuth
1. APIs & Services → Credentials
2. Create Credentials → OAuth client ID
3. Application type : **Web application**
4. Name : `Agence Immobilière Staging Web`

**Authorized JavaScript origins :**
```
https://VOTRE-URL-VERCEL.vercel.app
http://localhost:3000
```

**Authorized redirect URIs :**
```
https://VOTRE-URL-RAILWAY.railway.app/api/auth/google/callback
http://localhost:5000/api/auth/google/callback
```

5. Créer
6. Copier **Client ID** et **Client secret** ✅

### Étape 5 : Ajouter dans Railway et Vercel
**Railway :**
- GOOGLE_CLIENT_ID : [Client ID]
- GOOGLE_CLIENT_SECRET : [Client secret]

**Vercel :**
- NEXT_PUBLIC_GOOGLE_CLIENT_ID : [Client ID]

**GitHub Secrets :**
- STAGING_GOOGLE_CLIENT_ID : [Client ID]
- STAGING_GOOGLE_CLIENT_SECRET : [Client secret]

---

## ✅ Vérification finale

### Test 1 : Backend health check
```bash
curl https://VOTRE-URL.railway.app/health
# Doit retourner : {"status":"OK","timestamp":"..."}
```

### Test 2 : Frontend accessible
```bash
curl https://VOTRE-URL.vercel.app
# Doit retourner le HTML de la page d'accueil
```

### Test 3 : API depuis le frontend
Ouvrir : `https://VOTRE-URL.vercel.app/login`
- Vérifier que la page se charge
- Ouvrir la console développeur
- Vérifier qu'il n'y a pas d'erreurs CORS

### Test 4 : Google OAuth
1. Aller sur `https://VOTRE-URL.vercel.app/login`
2. Cliquer "Se connecter avec Google"
3. Doit rediriger vers Google
4. Après connexion Google, doit revenir sur le dashboard

---

## 🔄 Déploiement automatique

Maintenant, chaque fois que vous faites un merge sur `main` :
1. GitHub Actions s'exécute automatiquement
2. Les tests sont lancés
3. Railway déploie le backend
4. Vercel déploie le frontend
5. Un health check vérifie que tout fonctionne

Pour voir les déploiements :
- **Railway** : Dashboard → Deployments
- **Vercel** : Dashboard → Deployments
- **GitHub** : Actions tab

---

## 🆘 Troubleshooting

### Problème : Backend ne démarre pas sur Railway
- Vérifier les logs : Railway Dashboard → Deployments → Logs
- Vérifier les variables d'environnement
- Vérifier la connexion MongoDB Atlas

### Problème : Frontend ne peut pas appeler l'API
- Vérifier `NEXT_PUBLIC_API_URL` dans Vercel
- Vérifier les CORS dans le backend
- Vérifier que Railway backend est accessible

### Problème : Google OAuth ne fonctionne pas
- Vérifier les redirect URIs dans Google Cloud Console
- Vérifier `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`
- Vérifier `CLIENT_URL` dans Railway

---

## 📚 Ressources
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
