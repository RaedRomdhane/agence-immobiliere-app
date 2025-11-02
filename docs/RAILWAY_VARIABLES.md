# 🔧 Configuration Railway - Variables à Ajouter

## 📋 Instructions

Allez dans Railway Dashboard → Variables → Ajouter ces variables :

---

## ✅ Variables Déjà Configurées

- ✅ `MONGODB_URI` : mongodb+srv://agence-staging:...
- ✅ `NODE_ENV` : production
- ✅ `PORT` : 5000

---

## 🔐 Variables à AJOUTER Maintenant

### 1. JWT_SECRET (Généré automatiquement ci-dessous)
```
JWT_SECRET=staging-jwt-secret-2025-agence-immobiliere-secure-key-prod
```

### 2. FRONTEND_URL (Une fois Vercel configuré)
```
FRONTEND_URL=https://[votre-app].vercel.app
```
*(À ajouter après configuration Vercel)*

---

## 🔑 Variables Google OAuth (À ajouter après configuration)

### 3. GOOGLE_CLIENT_ID
```
GOOGLE_CLIENT_ID=[à obtenir de Google Cloud Console]
```

### 4. GOOGLE_CLIENT_SECRET
```
GOOGLE_CLIENT_SECRET=[à obtenir de Google Cloud Console]
```

---

## 🎯 Comment Ajouter une Variable

1. Railway Dashboard → Votre service backend
2. Onglet **"Variables"**
3. Cliquez **"+ New Variable"**
4. Entrez **Variable Name** et **Value**
5. Sauvegardez

**⚠️ Important** : Railway redéploie automatiquement après ajout de variables

---

## 📝 Ordre Recommandé

1. ✅ **JWT_SECRET** → MAINTENANT
2. ⏳ **Google OAuth** → Après configuration Google
3. ⏳ **FRONTEND_URL** → Après configuration Vercel

---

## 🚀 URL Backend Railway
```
https://agence-immobiliere-app-production.up.railway.app
```

✅ **Health Check OK** : `{"status":"OK","message":"API is running"}`

---

## 📊 Prochaines Étapes

1. **Ajouter JWT_SECRET dans Railway** (5 min)
2. **Configurer Google OAuth** (10 min)
3. **Configurer Vercel** (15 min)
4. **Ajouter GitHub Secrets** (5 min)
5. **Test déploiement automatique** (5 min)

**Temps total restant** : ~40 minutes
