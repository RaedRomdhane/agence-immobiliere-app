# 🔐 GitHub Secrets - Configuration CI/CD

## 📋 Prérequis

Avant d'ajouter les secrets, vous devez avoir :
- ✅ Railway backend déployé avec URL
- ✅ Vercel frontend déployé avec URL
- ✅ Tokens Vercel récupérés

---

## 🔑 Liste des Secrets à Ajouter

### **8 GitHub Secrets nécessaires** :

1. `RAILWAY_TOKEN` - Token Railway pour déploiement
2. `RAILWAY_BACKEND_URL` - URL du backend Railway
3. `VERCEL_TOKEN` - Token Vercel pour déploiement
4. `VERCEL_ORG_ID` - ID de votre organisation/compte Vercel
5. `VERCEL_PROJECT_ID` - ID du projet Vercel
6. `VERCEL_URL` - URL du frontend Vercel
7. `STAGING_GOOGLE_CLIENT_ID` - Client ID Google (optionnel)
8. `STAGING_GOOGLE_CLIENT_SECRET` - Secret Google (optionnel)

---

## 🚂 Étape 1 : Obtenir le Railway Token

1. **Railway Dashboard** → Cliquez sur votre avatar (coin haut-droite)
2. **"Account Settings"**
3. **"Tokens"** (dans le menu latéral)
4. **"Create Token"**
5. Name : `GitHub Actions`
6. **Create** → Copiez le token

```
Exemple : railway_token_abc123xyz...
```

---

## 🎨 Étape 2 : Obtenir les Tokens Vercel

### **A. Vercel Token** :
1. **Vercel Dashboard** → Avatar → **"Settings"**
2. **"Tokens"** (menu latéral)
3. **"Create"**
4. Name : `GitHub Actions`
5. Scope : `Full Account`
6. Expiration : `No Expiration` ou `1 year`
7. **Create** → Copiez le token

```
Exemple : vercel_token_abc123xyz...
```

### **B. Vercel Org ID** :
1. **Settings** → **"General"**
2. Cherchez **"Team ID"** ou **"User ID"**
3. Copiez l'ID

```
Exemple : team_abc123xyz
```

### **C. Vercel Project ID** :
1. **Votre projet** → **"Settings"** → **"General"**
2. Cherchez **"Project ID"**
3. Copiez l'ID

```
Exemple : prj_abc123xyz
```

---

## 🔐 Étape 3 : Ajouter les Secrets à GitHub

1. **GitHub** → Votre repo `agence-immobiliere-app`
2. **"Settings"** (onglet en haut)
3. **"Secrets and variables"** → **"Actions"**
4. **"New repository secret"**

### **Secret 1 : RAILWAY_TOKEN**
```
Name: RAILWAY_TOKEN
Value: [Collez le token Railway]
```

### **Secret 2 : RAILWAY_BACKEND_URL**
```
Name: RAILWAY_BACKEND_URL
Value: https://agence-immobiliere-app-production.up.railway.app
```

### **Secret 3 : VERCEL_TOKEN**
```
Name: VERCEL_TOKEN
Value: [Collez le token Vercel]
```

### **Secret 4 : VERCEL_ORG_ID**
```
Name: VERCEL_ORG_ID
Value: [Collez l'Org ID Vercel]
```

### **Secret 5 : VERCEL_PROJECT_ID**
```
Name: VERCEL_PROJECT_ID
Value: [Collez le Project ID Vercel]
```

### **Secret 6 : VERCEL_URL**
```
Name: VERCEL_URL
Value: https://[votre-projet].vercel.app
```

### **Secret 7 : STAGING_GOOGLE_CLIENT_ID** (optionnel)
```
Name: STAGING_GOOGLE_CLIENT_ID
Value: [Laisser vide ou ajouter plus tard]
```

### **Secret 8 : STAGING_GOOGLE_CLIENT_SECRET** (optionnel)
```
Name: STAGING_GOOGLE_CLIENT_SECRET
Value: [Laisser vide ou ajouter plus tard]
```

---

## ✅ Étape 4 : Vérifier les Secrets

Après ajout, vous devriez voir dans **Actions secrets** :

```
✓ RAILWAY_TOKEN
✓ RAILWAY_BACKEND_URL
✓ VERCEL_TOKEN
✓ VERCEL_ORG_ID
✓ VERCEL_PROJECT_ID
✓ VERCEL_URL
✓ STAGING_GOOGLE_CLIENT_ID (optionnel)
✓ STAGING_GOOGLE_CLIENT_SECRET (optionnel)
```

---

## 🚀 Étape 5 : Tester le Workflow

### **Test Manuel** :

1. **GitHub** → **"Actions"** (onglet)
2. Sélectionnez **"Deploy to Staging (Vercel + Railway)"**
3. **"Run workflow"** → Sélectionnez branch `main`
4. **"Run workflow"**

Le workflow devrait :
- ✅ Build et test backend
- ✅ Build frontend
- ✅ Déployer sur Railway
- ✅ Déployer sur Vercel
- ✅ Health checks
- ✅ Tag version

---

## 🔄 Étape 6 : Activer Auto-Deploy

Une fois les secrets configurés, le workflow se déclenche automatiquement :

**Triggers** :
- ✅ Push sur `main` branch
- ✅ Manual dispatch (bouton dans Actions)

---

## 📊 Tableau Récapitulatif

| Secret Name | Source | Obligatoire | Exemple |
|------------|---------|------------|---------|
| RAILWAY_TOKEN | Railway Account Settings | ✅ Oui | railway_token_... |
| RAILWAY_BACKEND_URL | Railway Dashboard | ✅ Oui | https://....railway.app |
| VERCEL_TOKEN | Vercel Account Settings | ✅ Oui | vercel_token_... |
| VERCEL_ORG_ID | Vercel Settings | ✅ Oui | team_abc123 |
| VERCEL_PROJECT_ID | Vercel Project Settings | ✅ Oui | prj_abc123 |
| VERCEL_URL | Vercel Dashboard | ✅ Oui | https://....vercel.app |
| STAGING_GOOGLE_CLIENT_ID | Google Cloud Console | ❌ Optionnel | xxx.apps.googleusercontent.com |
| STAGING_GOOGLE_CLIENT_SECRET | Google Cloud Console | ❌ Optionnel | GOCSPX-xxx |

---

## 🚨 Troubleshooting

### Workflow échoue : "RAILWAY_TOKEN not found"
→ Vérifiez que le secret est bien ajouté dans Settings → Secrets

### Workflow échoue : "Invalid token"
→ Régénérez le token et mettez à jour le secret

### Vercel deployment échoue
→ Vérifiez VERCEL_ORG_ID et VERCEL_PROJECT_ID

### Railway deployment échoue
→ Vérifiez que RAILWAY_TOKEN a les bonnes permissions

---

## ✅ Checklist

- [ ] Railway Token créé et copié
- [ ] Vercel Token créé et copié
- [ ] Vercel Org ID copié
- [ ] Vercel Project ID copié
- [ ] 8 secrets ajoutés à GitHub
- [ ] Workflow testé manuellement
- [ ] Workflow passe tous les checks
- [ ] Auto-deploy fonctionnel

**Temps estimé** : 5-10 minutes

---

## 🎉 Une fois Configuré

Votre pipeline CI/CD est COMPLET ! 🚀

**Workflow automatique** :
```
Push to main
    ↓
GitHub Actions
    ↓
Build & Test
    ↓
Deploy Railway (Backend)
    ↓
Deploy Vercel (Frontend)
    ↓
Health Checks
    ↓
✅ LIVE !
```

---

## 📝 Prochaines Étapes

1. ✅ Merger `feature/AW-21-staging-deployment` → `main`
2. ✅ Workflow se déclenche automatiquement
3. ✅ Application déployée en staging
4. ✅ AW-21 COMPLÉTÉ ! 🎉
