# 🚂 Guide de Surveillance Railway

## 📊 Étape 1 : Accéder au Dashboard Railway

1. **Ouvrir Railway** : https://railway.app/dashboard
2. **Sélectionner votre projet** : `agence-immobiliere-app` (ou le nom que vous avez donné)
3. **Cliquer sur le service Backend**

## 🔍 Étape 2 : Surveiller le Build en Cours

### Que chercher dans l'onglet "Deployments" :

```
┌─────────────────────────────────────────┐
│  Deployments                            │
├─────────────────────────────────────────┤
│  ✓ Active                               │
│  🔄 Building... (ou ✓ Success)          │
│                                         │
│  Logs:                                  │
│  → Cloning repository...                │
│  → Detected railway.json                │
│  → Using NIXPACKS builder               │
│  → Running: cd backend && npm ci        │
│  → Installing dependencies...           │
│  → Starting: cd backend && npm start    │
│  → Server listening on port 5000        │
│  ✓ Deployment successful                │
└─────────────────────────────────────────┘
```

### ✅ Indicateurs de Succès :

- **Status** : `Success` ou `Active` (cercle vert)
- **Build Time** : ~2-5 minutes
- **Logs** : Doit contenir "Server listening on port 5000"
- **URL** : Railway génère automatiquement une URL publique

### ❌ Si vous voyez encore l'erreur "Railpack" :

Railway n'a peut-être pas encore détecté les nouveaux fichiers. Actions :
1. Cliquez sur **"Redeploy"** (bouton en haut à droite)
2. Ou : Settings → Service → **"Restart"**

## 🌐 Étape 3 : Obtenir l'URL du Backend

### Une fois le build réussi :

1. Dans Railway Dashboard, cliquez sur votre service backend
2. Allez dans l'onglet **"Settings"**
3. Section **"Networking"** → **"Generate Domain"**
4. Railway va générer une URL : `https://[nom-unique].up.railway.app`

### Tester l'URL :

```bash
# Tester le health check
curl https://[votre-url].up.railway.app/health

# Résultat attendu :
{
  "status": "healthy",
  "timestamp": "2025-11-02T...",
  "database": "connected"
}
```

## 🔧 Étape 4 : Vérifier les Variables d'Environnement

Railway doit avoir ces variables configurées :

### Variables Essentielles :

```env
# Variables à vérifier dans Railway Dashboard → Settings → Variables
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://agence-staging:...  (votre connexion Atlas)
JWT_SECRET=[généré automatiquement ou à ajouter]
GOOGLE_CLIENT_ID=[à configurer après]
GOOGLE_CLIENT_SECRET=[à configurer après]
FRONTEND_URL=[URL Vercel une fois déployé]
```

### Comment ajouter/vérifier :

1. **Settings** → **"Variables"**
2. Cliquez sur **"+ New Variable"**
3. Ajoutez les variables manquantes (surtout `MONGODB_URI`)

## 📝 Étape 5 : Vérifier les Logs en Temps Réel

### Dans Railway Dashboard :

1. Cliquez sur votre service backend
2. Onglet **"Logs"** (ou **"Observability"**)
3. Vous devriez voir :

```log
[Railway] Starting deployment...
[Nixpacks] Detected railway.json
[Nixpacks] Using Node.js 20.x
[Build] Running: cd backend && npm ci
[Build] ✓ Dependencies installed
[Deploy] Running: cd backend && npm start
[App] Server is running on port 5000
[App] MongoDB connected successfully
[App] ✓ Application started
```

### Logs à surveiller :

- ✅ **"MongoDB connected"** : Base de données OK
- ✅ **"Server is running on port 5000"** : Backend OK
- ❌ **"Error:"** : Note les erreurs pour debug

## 🎯 Étape 6 : Tester le Backend Déployé

### Tests API Basiques :

```bash
# 1. Health Check
curl https://[votre-url].railway.app/health

# 2. API Status
curl https://[votre-url].railway.app/api/status

# 3. Test CORS (depuis le navigateur)
fetch('https://[votre-url].railway.app/health')
  .then(res => res.json())
  .then(data => console.log(data))
```

### Depuis Postman ou Thunder Client :

1. **GET** `https://[votre-url].railway.app/health`
   - Status: `200 OK`
   - Body: `{ "status": "healthy", ... }`

2. **GET** `https://[votre-url].railway.app/api/auth/status`
   - Status: `200 OK`
   - Body: `{ "authenticated": false }`

## 🚨 Troubleshooting

### Problème : Build échoue encore avec "Railpack"

**Solution** :
```bash
# Forcer Railway à recharger la config
cd C:\Users\LENOVO\agence-immobiliere-app
git commit --allow-empty -m "chore: trigger Railway rebuild"
git push origin feature/AW-21-staging-deployment
```

### Problème : "Application failed to respond"

**Causes possibles** :
- MongoDB URI manquant → Ajouter dans Variables
- Port incorrect → Vérifier que c'est 5000
- Dépendances manquantes → Vérifier build logs

**Solution** :
1. Settings → Variables → Ajouter `MONGODB_URI`
2. Settings → Variables → Ajouter `PORT=5000`
3. Redeploy

### Problème : "Module not found"

**Cause** : Dependencies pas installées
**Solution** :
```bash
# Vérifier package.json dans backend/
cd backend
cat package.json  # Vérifier que toutes les deps sont là
```

### Problème : Build timeout

**Cause** : npm ci prend trop de temps
**Solution** : Railway a un timeout de 10min, c'est suffisant. Si ça timeout :
1. Vérifier votre connexion internet
2. Essayer Dockerfile.backend à la place :
   - Settings → Build → Change Builder → Dockerfile
   - Set Dockerfile Path: `Dockerfile.backend`

## 📊 Métriques à Surveiller

### Dans Railway Dashboard :

1. **CPU Usage** : Devrait être < 50% au repos
2. **Memory Usage** : Devrait être < 200MB au repos
3. **Network** : Réponses < 500ms
4. **Uptime** : Devrait être 100%

### Limites Free Tier :

- ✅ **500 heures/mois** d'exécution (16h/jour)
- ✅ **100 GB** bandwidth
- ✅ **1 GB** RAM
- ✅ **1 vCPU**

**Note** : Suffisant pour staging, mais le service s'arrête après 500h

## ✅ Checklist de Vérification

Cochez quand c'est fait :

- [ ] Build Railway réussi (status vert)
- [ ] URL générée et accessible
- [ ] Health check répond 200 OK
- [ ] MongoDB connecté (voir logs)
- [ ] Variables d'environnement configurées
- [ ] Logs ne montrent pas d'erreurs
- [ ] CORS configuré (test depuis navigateur)
- [ ] API endpoints répondent

## 🎯 Prochaines Étapes

Une fois Railway validé :

1. **Noter l'URL Railway** : `https://[votre-url].railway.app`
2. **Passer à Vercel** : Configuration frontend
3. **Configurer Google OAuth** : Client ID/Secret
4. **Ajouter GitHub Secrets** : Automation CI/CD
5. **Tester l'intégration complète**

## 📞 Commandes Utiles

### Voir les logs en temps réel :
```bash
# Railway CLI (optionnel)
npm install -g @railway/cli
railway login
railway logs
```

### Forcer un redéploiement :
```bash
git commit --allow-empty -m "chore: force redeploy"
git push
```

### Vérifier la santé du service :
```bash
# Windows PowerShell
Invoke-RestMethod -Uri "https://[votre-url].railway.app/health"
```

---

## 🎓 Résumé Rapide

1. ✅ **Accéder** : https://railway.app/dashboard
2. 🔍 **Surveiller** : Onglet Deployments → Logs
3. 🌐 **Générer URL** : Settings → Networking → Generate Domain
4. 🔧 **Variables** : Settings → Variables → Ajouter MONGODB_URI
5. ✅ **Tester** : curl [URL]/health
6. 📝 **Noter URL** : Pour configuration Vercel

**Temps estimé** : 5-10 minutes

---

**Questions fréquentes** :

**Q: Combien de temps prend le build ?**
A: 2-5 minutes en général

**Q: Railway coûte combien ?**
A: 0€ (500h/mois gratuit, pas de carte requise)

**Q: Que faire si ça échoue ?**
A: Vérifier les logs, ajouter MONGODB_URI, redeploy

**Q: Railway redéploie automatiquement ?**
A: Oui, à chaque push sur GitHub (si connecté)
