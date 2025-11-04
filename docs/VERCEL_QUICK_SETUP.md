# 🎨 Configuration Vercel Frontend - Guide Rapide

## 📋 Étape 1 : Créer un Compte Vercel

1. Allez sur : **https://vercel.com/signup**
2. **Sign up with GitHub** (recommandé)
3. Autorisez Vercel à accéder à vos repos GitHub

---

## 🚀 Étape 2 : Import du Projet

1. **Dashboard Vercel** → Cliquez **"Add New..."** → **"Project"**
2. **Import Git Repository** :
   - Cherchez : `agence-immobiliere-app`
   - Cliquez **"Import"**

---

## ⚙️ Étape 3 : Configuration du Projet

### **Framework Preset** :
```
Next.js
```
*(Détecté automatiquement)*

### **Root Directory** :
```
frontend
```
⚠️ **IMPORTANT** : Cliquez **"Edit"** à côté de Root Directory et sélectionnez `frontend`

### **Build and Output Settings** :
Laissez les valeurs par défaut :
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

---

## 🔐 Étape 4 : Variables d'Environnement

Cliquez sur **"Environment Variables"** et ajoutez :

### **Variable 1 : API URL**
```
Name: NEXT_PUBLIC_API_URL
Value: https://agence-immobiliere-app-production.up.railway.app
```

### **Variable 2 : Google Client ID** (optionnel pour MVP)
```
Name: NEXT_PUBLIC_GOOGLE_CLIENT_ID
Value: [laisser vide pour l'instant]
```

### **Variable 3 : Environment**
```
Name: NODE_ENV
Value: production
```

---

## 🚀 Étape 5 : Déployer

1. Cliquez **"Deploy"**
2. Vercel va :
   - Clone le repo
   - Install les dépendances
   - Build Next.js
   - Déployer (2-5 minutes)

---

## 🌐 Étape 6 : Récupérer l'URL Vercel

Une fois le déploiement terminé :

1. Vercel affiche l'URL : `https://[nom-projet]-[hash].vercel.app`
2. **Copiez cette URL** pour la suite

Vous pouvez aussi la trouver dans :
- **Dashboard Vercel** → Votre projet → **"Domains"**

---

## 🔧 Étape 7 : Configurer CORS dans Railway

Il faut autoriser l'URL Vercel dans le backend :

### **Dans Railway** :

1. **Variables** → **"+ New Variable"**
2. Ajoutez :
   ```
   Name: FRONTEND_URL
   Value: https://[votre-url].vercel.app
   ```

3. Railway va redéployer

---

## ✅ Étape 8 : Tester l'Application

### **Test Frontend** :
```
Ouvrir : https://[votre-url].vercel.app
```

Vous devriez voir :
- ✅ Page d'accueil
- ✅ Navigation
- ✅ Connexion au backend Railway

### **Test API depuis Frontend** :
Ouvrez la console du navigateur (F12) et vérifiez qu'il n'y a pas d'erreurs CORS

---

## 📊 Récupérer les Tokens Vercel (pour GitHub Actions)

### **1. Vercel Token** :
1. **Account Settings** → **Tokens**
2. **"Create Token"**
3. Name : `GitHub Actions Deployment`
4. Scope : `Full Account`
5. **Create** → Copiez le token

### **2. Vercel Org ID** :
1. **Settings** → **General**
2. Copiez le **Team ID** ou **User ID**

### **3. Vercel Project ID** :
1. Votre projet → **Settings** → **General**
2. Copiez le **Project ID**

---

## 🎯 Résumé des URLs

**Backend Railway** :
```
https://agence-immobiliere-app-production.up.railway.app
```

**Frontend Vercel** :
```
https://[votre-projet].vercel.app
```

---

## 🔄 Configuration Branch pour Auto-Deploy

Par défaut, Vercel déploie depuis `main`. Pour déployer depuis `feature/AW-21-staging-deployment` :

1. **Project Settings** → **Git**
2. **Production Branch** : Changez en `main` (plus tard)
3. Pour l'instant, laissez comme ça

---

## 📝 Checklist

- [ ] Compte Vercel créé avec GitHub
- [ ] Projet importé depuis GitHub
- [ ] Root Directory configuré : `frontend`
- [ ] Variables d'environnement ajoutées
- [ ] Premier déploiement lancé
- [ ] URL Vercel récupérée
- [ ] FRONTEND_URL ajouté à Railway
- [ ] Test frontend OK
- [ ] Tokens Vercel récupérés (pour GitHub Actions)

**Temps estimé** : 10-15 minutes

---

## 🚨 Troubleshooting

### Build échoue : "Module not found"
→ Vérifiez que Root Directory = `frontend`

### CORS Error dans le navigateur
→ Ajoutez FRONTEND_URL à Railway Variables

### Page blanche
→ Vérifiez NEXT_PUBLIC_API_URL dans Vercel Variables

### 404 sur toutes les pages
→ Vérifiez que le build Next.js est réussi dans les logs Vercel

---

## 🎉 Une fois Vercel Configuré

Passez à l'étape suivante : **GitHub Secrets** pour l'automation CI/CD !
