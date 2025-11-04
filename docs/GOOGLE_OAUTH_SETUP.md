# 🔑 Configuration Google OAuth pour Staging

## 📋 Étape 1 : Accéder à Google Cloud Console

1. Allez sur : **https://console.cloud.google.com**
2. Connectez-vous avec votre compte Google

---

## 🎯 Étape 2 : Créer/Sélectionner un Projet

### Si vous avez déjà un projet :
- Sélectionnez votre projet dans le dropdown en haut

### Si vous n'avez pas de projet :
1. Cliquez sur le dropdown projet en haut
2. **"New Project"**
3. Nom : `Agence Immobilière Staging`
4. Cliquez **"Create"**
5. Attendez quelques secondes

---

## 🔐 Étape 3 : Activer l'API Google+ (OAuth)

1. Dans la barre de recherche, tapez : **"APIs & Services"**
2. Cliquez sur **"Enable APIs and Services"**
3. Cherchez : **"Google+ API"** ou **"Google People API"**
4. Cliquez **"Enable"**

---

## 🛡️ Étape 4 : Configurer OAuth Consent Screen

1. **APIs & Services** → **"OAuth consent screen"**
2. **User Type** : Sélectionnez **"External"**
3. Cliquez **"Create"**

### Configuration :

**App Information** :
```
App name: Agence Immobilière Staging
User support email: [votre email]
```

**App domain** (optionnel pour test) :
```
Application home page: https://agence-immobiliere-app-production.up.railway.app
```

**Developer contact** :
```
Email: [votre email]
```

4. Cliquez **"Save and Continue"**

**Scopes** :
- Cliquez **"Add or Remove Scopes"**
- Sélectionnez :
  - ✅ `.../auth/userinfo.email`
  - ✅ `.../auth/userinfo.profile`
  - ✅ `openid`
5. Cliquez **"Save and Continue"**

**Test users** (pour environnement de test) :
- Ajoutez votre email de test
- Cliquez **"Save and Continue"**

6. **Summary** → Cliquez **"Back to Dashboard"**

---

## 🔑 Étape 5 : Créer les Credentials OAuth 2.0

1. **APIs & Services** → **"Credentials"**
2. Cliquez **"+ Create Credentials"**
3. Sélectionnez **"OAuth 2.0 Client ID"**

### Configuration :

**Application type** :
```
Web application
```

**Name** :
```
Agence Immobilière - Staging Backend
```

**Authorized JavaScript origins** :
```
https://agence-immobiliere-app-production.up.railway.app
http://localhost:5000
```

**Authorized redirect URIs** :
```
https://agence-immobiliere-app-production.up.railway.app/api/auth/google/callback
http://localhost:5000/api/auth/google/callback
```

4. Cliquez **"Create"**

---

## 📋 Étape 6 : Récupérer les Credentials

Une popup va apparaître avec :

```
Client ID: [longue chaîne].apps.googleusercontent.com
Client Secret: [chaîne secrète]
```

**⚠️ IMPORTANT** : Copiez ces valeurs immédiatement !

### Sauvegardez-les ici temporairement :

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## 🚂 Étape 7 : Ajouter à Railway Variables

1. **Railway Dashboard** → Variables
2. **+ New Variable**

**Variable 1** :
```
Name: GOOGLE_CLIENT_ID
Value: [collez votre Client ID]
```

**Variable 2** :
```
Name: GOOGLE_CLIENT_SECRET
Value: [collez votre Client Secret]
```

3. Railway va automatiquement redéployer

---

## ✅ Étape 8 : Vérifier la Configuration

Une fois Railway redéployé (2-3 minutes), testez :

```powershell
# Ouvrir dans le navigateur
start https://agence-immobiliere-app-production.up.railway.app/api/auth/google
```

Vous devriez être redirigé vers la page de connexion Google !

---

## 🎨 Étape 9 : Préparer pour Vercel

Une fois Vercel configuré, vous devrez **ajouter l'URL Vercel** aux redirects :

1. Retournez dans Google Cloud Console
2. **Credentials** → Cliquez sur votre OAuth Client
3. **Authorized JavaScript origins** → Ajoutez :
   ```
   https://[votre-app].vercel.app
   ```
4. **Authorized redirect URIs** → Ajoutez :
   ```
   https://[votre-app].vercel.app/auth/callback
   ```
5. Sauvegardez

---

## 🔧 Troubleshooting

### Erreur "redirect_uri_mismatch"
→ Vérifiez que l'URL dans Google Console correspond EXACTEMENT à celle utilisée

### Erreur "Access blocked: This app's request is invalid"
→ Configurez l'OAuth Consent Screen (Étape 4)

### Erreur 401 "Unauthorized"
→ Vérifiez que les variables GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sont bien dans Railway

---

## 📊 Résumé des URLs

**Backend Railway** :
```
https://agence-immobiliere-app-production.up.railway.app
```

**OAuth Callback** :
```
https://agence-immobiliere-app-production.up.railway.app/api/auth/google/callback
```

**Frontend Vercel** (à configurer) :
```
https://[votre-app].vercel.app
```

---

## 🎯 Prochaine Étape : Vercel

Une fois Google OAuth configuré :
1. ✅ Google OAuth credentials créés
2. ✅ Variables ajoutées à Railway
3. ⏳ Configuration Vercel (prochaine étape)

---

## 📝 Checklist

- [ ] Projet Google Cloud créé
- [ ] Google+ API activée
- [ ] OAuth Consent Screen configuré
- [ ] OAuth 2.0 Client ID créé
- [ ] Client ID et Secret récupérés
- [ ] Variables ajoutées à Railway
- [ ] Railway redéployé
- [ ] Test OAuth fonctionnel

**Temps estimé** : 10-15 minutes
