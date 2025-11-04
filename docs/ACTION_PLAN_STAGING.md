# 🎯 Plan d'Action: Configuration Staging Complète

## 📋 Vue d'ensemble

Ce document vous guide étape par étape pour configurer l'environnement staging et activer le déploiement automatique.

**Temps estimé total**: 2-3 heures (première fois)

---

## ✅ Phase 1: Décisions et Préparation (30 min)

### 1.1 Choisir votre plateforme cloud

Vous devez choisir une plateforme. Je recommande **Azure** car les workflows sont déjà configurés pour Azure.

**Options alternatives** (nécessitent modifications des workflows):
- AWS (Elastic Beanstalk + S3/CloudFront)
- Heroku (plus simple mais moins contrôle)
- Vercel (Frontend) + Railway/Render (Backend)

**✅ Décision recommandée**: Azure (workflows déjà prêts)

### 1.2 Créer les comptes nécessaires

- [ ] **Compte Azure** - https://azure.microsoft.com/free/
  - Crédit gratuit: 200$ pendant 30 jours
  - Services gratuits: 12 mois
  
- [ ] **MongoDB Atlas** - https://cloud.mongodb.com
  - Gratuit: Cluster M0 (512 MB)
  - Suffisant pour staging
  
- [ ] **Google Cloud Console** (OAuth) - https://console.cloud.google.com
  - Gratuit pour OAuth
  - Créer un projet si pas déjà fait

### 1.3 Installer les outils CLI

#### Sur Windows (PowerShell en tant qu'administrateur):

```powershell
# Azure CLI
winget install -e --id Microsoft.AzureCLI

# Vérifier l'installation
az --version

# Se connecter à Azure
az login
```

#### Sur macOS:
```bash
brew install azure-cli
az login
```

#### Sur Linux:
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

---

## ✅ Phase 2: Configuration MongoDB Atlas (20 min)

### 2.1 Créer le cluster staging

1. **Aller sur** https://cloud.mongodb.com
2. **Cliquer** "Build a Database"
3. **Sélectionner** "M0 Free" tier
4. **Choisir** une région proche (ex: West Europe)
5. **Nommer** le cluster: `agence-staging`
6. **Cliquer** "Create"

### 2.2 Créer la base de données

1. Dans le cluster, cliquer "Browse Collections"
2. Cliquer "Add My Own Data"
3. **Database name**: `agence-immobiliere-staging`
4. **Collection name**: `users`
5. Cliquer "Create"

### 2.3 Créer un utilisateur

1. Aller dans **Database Access** (menu gauche)
2. Cliquer "Add New Database User"
3. **Authentication Method**: Password
4. **Username**: `agence-staging`
5. **Password**: Générer un mot de passe fort et **le sauvegarder**
6. **Database User Privileges**: Read and write to any database
7. Cliquer "Add User"

### 2.4 Configurer Network Access

1. Aller dans **Network Access** (menu gauche)
2. Cliquer "Add IP Address"
3. **Option 1** (recommandée pour test): "Allow Access from Anywhere" (0.0.0.0/0)
4. **Option 2** (production): Ajouter les IPs Azure (on le fera plus tard)
5. Cliquer "Confirm"

### 2.5 Récupérer la Connection String

1. Aller dans **Database** → Votre cluster
2. Cliquer "Connect"
3. Sélectionner "Connect your application"
4. Copier la connection string:
   ```
   mongodb+srv://agence-staging:<password>@agence-staging.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Remplacer** `<password>` par le mot de passe créé
6. **Ajouter** le nom de la DB: 
   ```
   mongodb+srv://agence-staging:VOTRE_PASSWORD@agence-staging.xxxxx.mongodb.net/agence-immobiliere-staging?retryWrites=true&w=majority
   ```
7. **SAUVEGARDER CETTE STRING** → On l'utilisera comme `STAGING_MONGODB_URI`

---

## ✅ Phase 3: Configuration Google OAuth (15 min)

### 3.1 Créer les credentials staging

1. **Aller sur** https://console.cloud.google.com
2. Sélectionner votre projet (ou en créer un nouveau)
3. **Menu** → "APIs & Services" → "Credentials"
4. Cliquer "Create Credentials" → "OAuth 2.0 Client ID"

### 3.2 Configurer OAuth consent screen (si pas déjà fait)

1. Cliquer "Configure Consent Screen"
2. Choisir "External"
3. **App name**: Agence Immobilière Staging
4. **User support email**: Votre email
5. **Developer contact**: Votre email
6. Cliquer "Save and Continue"
7. Skip "Scopes" (cliquer "Save and Continue")
8. Add test users si nécessaire
9. Cliquer "Save and Continue"

### 3.3 Créer OAuth Client

1. Retour dans "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
2. **Application type**: Web application
3. **Name**: Agence Staging OAuth
4. **Authorized JavaScript origins**: 
   ```
   https://agence-immobiliere-staging-frontend.azurestaticapps.net
   ```
   (On mettra la vraie URL plus tard)

5. **Authorized redirect URIs**:
   ```
   https://agence-immobiliere-staging-backend.azurewebsites.net/api/auth/google/callback
   ```
   (On mettra la vraie URL plus tard)

6. Cliquer "Create"

### 3.4 Sauvegarder les credentials

Vous recevrez:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx`

**SAUVEGARDER CES VALEURS**:
- Client ID → `STAGING_GOOGLE_CLIENT_ID`
- Client Secret → `STAGING_GOOGLE_CLIENT_SECRET`

---

## ✅ Phase 4: Configuration Azure (60-90 min)

### 4.1 Créer le Resource Group

```bash
# Se connecter
az login

# Vérifier l'abonnement actif
az account show

# Créer le resource group
az group create \
  --name agence-immobiliere-staging-rg \
  --location westeurope

# Vérifier
az group show --name agence-immobiliere-staging-rg
```

### 4.2 Créer l'App Service Plan

```bash
# Plan Linux B1 (Basic)
az appservice plan create \
  --name agence-immobiliere-staging-plan \
  --resource-group agence-immobiliere-staging-rg \
  --is-linux \
  --sku B1 \
  --location westeurope
```

**Coût estimé**: ~13€/mois (B1 plan)

### 4.3 Créer l'App Service Backend

```bash
# Créer l'app service avec Node.js 20
az webapp create \
  --name agence-immobiliere-staging-backend \
  --resource-group agence-immobiliere-staging-rg \
  --plan agence-immobiliere-staging-plan \
  --runtime "NODE:20-lts"

# Configurer le démarrage
az webapp config set \
  --name agence-immobiliere-staging-backend \
  --resource-group agence-immobiliere-staging-rg \
  --startup-file "npm start"

# Activer les logs
az webapp log config \
  --name agence-immobiliere-staging-backend \
  --resource-group agence-immobiliere-staging-rg \
  --application-logging filesystem \
  --detailed-error-messages true \
  --failed-request-tracing true \
  --web-server-logging filesystem

# Récupérer l'URL
az webapp show \
  --name agence-immobiliere-staging-backend \
  --resource-group agence-immobiliere-staging-rg \
  --query defaultHostName -o tsv
```

**URL Backend**: `agence-immobiliere-staging-backend.azurewebsites.net`

**SAUVEGARDER** cette URL → `STAGING_API_URL` = `https://agence-immobiliere-staging-backend.azurewebsites.net`

### 4.4 Créer Static Web App (Frontend)

```bash
# Créer la Static Web App
az staticwebapp create \
  --name agence-immobiliere-staging-frontend \
  --resource-group agence-immobiliere-staging-rg \
  --location westeurope \
  --sku Free

# Récupérer le deployment token (IMPORTANT!)
az staticwebapp secrets list \
  --name agence-immobiliere-staging-frontend \
  --resource-group agence-immobiliere-staging-rg \
  --query properties.apiKey -o tsv
```

**SAUVEGARDER** ce token → `STAGING_STATIC_WEB_APP_TOKEN`

```bash
# Récupérer l'URL frontend
az staticwebapp show \
  --name agence-immobiliere-staging-frontend \
  --resource-group agence-immobiliere-staging-rg \
  --query defaultHostname -o tsv
```

**URL Frontend**: `agence-immobiliere-staging-frontend.azurestaticapps.net`

**SAUVEGARDER** cette URL → `STAGING_FRONTEND_URL` = `https://agence-immobiliere-staging-frontend.azurestaticapps.net`

### 4.5 Mettre à jour Google OAuth avec les vraies URLs

Retourner sur Google Cloud Console:
1. Aller dans "Credentials" → Votre OAuth Client
2. **Modifier** les URLs:
   - **Authorized JavaScript origins**: 
     ```
     https://agence-immobiliere-staging-frontend.azurestaticapps.net
     ```
   - **Authorized redirect URIs**:
     ```
     https://agence-immobiliere-staging-backend.azurewebsites.net/api/auth/google/callback
     ```
3. Cliquer "Save"

### 4.6 Créer le Service Principal pour GitHub Actions

```bash
# Récupérer votre subscription ID
az account show --query id -o tsv

# Créer le service principal (remplacer {subscription-id})
az ad sp create-for-rbac \
  --name "github-actions-agence-staging" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/agence-immobiliere-staging-rg \
  --sdk-auth
```

**Output JSON** (exemple):
```json
{
  "clientId": "xxxxx",
  "clientSecret": "xxxxx",
  "subscriptionId": "xxxxx",
  "tenantId": "xxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  ...
}
```

**SAUVEGARDER CE JSON COMPLET** → `AZURE_CREDENTIALS`

### 4.7 Whitelister les IPs Azure dans MongoDB

```bash
# Récupérer les IPs sortantes de l'App Service
az webapp show \
  --name agence-immobiliere-staging-backend \
  --resource-group agence-immobiliere-staging-rg \
  --query outboundIpAddresses -o tsv
```

Copier ces IPs, puis dans MongoDB Atlas:
1. Aller dans **Network Access**
2. Pour chaque IP, cliquer "Add IP Address"
3. Coller l'IP
4. Cliquer "Confirm"

---

## ✅ Phase 5: Générer les Secrets (10 min)

### 5.1 JWT Secret

```bash
# Sur Windows PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# Sur macOS/Linux
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**SAUVEGARDER** → `STAGING_JWT_SECRET`

### 5.2 Session Secret

```bash
# Générer un autre secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**SAUVEGARDER** → `STAGING_SESSION_SECRET`

---

## ✅ Phase 6: Configuration GitHub Secrets (15 min)

### 6.1 Aller dans les Settings GitHub

1. Ouvrir votre repo sur GitHub
2. Aller dans **Settings** (onglet en haut)
3. Dans le menu gauche: **Secrets and variables** → **Actions**
4. Cliquer **New repository secret**

### 6.2 Créer TOUS les secrets

Créer **un par un** avec les boutons "New repository secret":

| Name | Value | Source |
|------|-------|--------|
| `AZURE_CREDENTIALS` | Le JSON complet du service principal | Phase 4.6 |
| `AZURE_RESOURCE_GROUP` | `agence-immobiliere-staging-rg` | Phase 4.1 |
| `STAGING_BACKEND_APP_NAME` | `agence-immobiliere-staging-backend` | Phase 4.3 |
| `STAGING_FRONTEND_URL` | `https://agence-immobiliere-staging-frontend.azurestaticapps.net` | Phase 4.4 |
| `STAGING_STATIC_WEB_APP_TOKEN` | Le token de deployment | Phase 4.4 |
| `STAGING_API_URL` | `https://agence-immobiliere-staging-backend.azurewebsites.net` | Phase 4.3 |
| `STAGING_MONGODB_URI` | La connection string complète MongoDB | Phase 2.5 |
| `STAGING_JWT_SECRET` | Le secret généré | Phase 5.1 |
| `STAGING_SESSION_SECRET` | Le secret généré | Phase 5.2 |
| `STAGING_GOOGLE_CLIENT_ID` | Client ID Google OAuth | Phase 3.4 |
| `STAGING_GOOGLE_CLIENT_SECRET` | Client Secret Google OAuth | Phase 3.4 |

### 6.3 Vérifier

Après création, vous devriez voir **11 secrets** dans la liste.

---

## ✅ Phase 7: Test du Déploiement (30 min)

### 7.1 Merger la PR AW-21

```bash
# Sur votre machine locale
git checkout main
git pull origin main
git merge feature/AW-21-staging-deployment
git push origin main
```

**OU** créer une Pull Request sur GitHub et merger.

### 7.2 Surveiller le déploiement

1. Aller sur GitHub → Onglet **Actions**
2. Vous devriez voir "Staging Deployment" en cours
3. Cliquer dessus pour voir les logs en temps réel
4. Attendre que tous les jobs soient ✅ verts

### 7.3 Vérifier le déploiement

```bash
# Test Backend Health
curl https://agence-immobiliere-staging-backend.azurewebsites.net/health

# Devrait retourner:
# {"status":"OK","message":"API is running",...}

# Test Frontend
curl -I https://agence-immobiliere-staging-frontend.azurestaticapps.net

# Devrait retourner: HTTP/2 200
```

### 7.4 Tester dans le navigateur

1. **Backend API**: 
   - https://agence-immobiliere-staging-backend.azurewebsites.net
   - Devrait afficher un JSON

2. **Backend Health**: 
   - https://agence-immobiliere-staging-backend.azurewebsites.net/health
   - Devrait afficher le status

3. **Frontend**: 
   - https://agence-immobiliere-staging-frontend.azurestaticapps.net
   - Devrait afficher votre application

4. **Test Login Google**:
   - Cliquer sur "Se connecter avec Google"
   - Vérifier que OAuth fonctionne

---

## ✅ Phase 8: Configuration Post-Déploiement (15 min)

### 8.1 Activer Application Insights (Monitoring)

```bash
# Créer Application Insights
az monitor app-insights component create \
  --app agence-immobiliere-staging-insights \
  --location westeurope \
  --resource-group agence-immobiliere-staging-rg \
  --application-type web

# Récupérer la clé
az monitor app-insights component show \
  --app agence-immobiliere-staging-insights \
  --resource-group agence-immobiliere-staging-rg \
  --query instrumentationKey -o tsv

# Connecter au backend
az webapp config appsettings set \
  --name agence-immobiliere-staging-backend \
  --resource-group agence-immobiliere-staging-rg \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=<votre-clé>
```

### 8.2 Tester le Rollback

1. Dans GitHub → Actions
2. Sélectionner "Rollback Staging"
3. Cliquer "Run workflow"
4. Entrer un tag (par exemple le dernier tag créé)
5. Vérifier que le rollback fonctionne

---

## 📊 Checklist Finale

Cochez chaque élément complété:

### Configuration Cloud
- [ ] Compte Azure créé et vérifié
- [ ] MongoDB Atlas cluster staging créé
- [ ] Google OAuth credentials staging créés
- [ ] Azure CLI installé et configuré

### Ressources Azure
- [ ] Resource Group créé
- [ ] App Service Plan créé
- [ ] App Service Backend créé et accessible
- [ ] Static Web App Frontend créée et accessible
- [ ] Service Principal créé
- [ ] Application Insights activé

### Configuration
- [ ] MongoDB user créé
- [ ] MongoDB Network Access configuré
- [ ] IPs Azure whitelistées dans MongoDB
- [ ] Google OAuth URLs mises à jour
- [ ] Tous les secrets générés
- [ ] 11 secrets GitHub configurés

### Tests
- [ ] Premier déploiement réussi
- [ ] Backend health check passe
- [ ] Frontend accessible
- [ ] API répond correctement
- [ ] Login Google fonctionne
- [ ] Rollback testé

---

## 💰 Coûts Estimés (Staging)

- **Azure App Service B1**: ~13€/mois
- **Azure Static Web App Free**: 0€
- **MongoDB Atlas M0**: 0€ (gratuit)
- **Application Insights**: ~5€/mois (pour volume staging)
- **Google OAuth**: 0€

**Total**: ~18-20€/mois

---

## 🆘 En Cas de Problème

### Déploiement échoue
1. Vérifier les logs dans GitHub Actions
2. Vérifier que tous les secrets sont configurés
3. Vérifier les credentials Azure
4. Consulter `docs/STAGING_DEPLOYMENT.md`

### Backend ne démarre pas
```bash
# Voir les logs Azure
az webapp log tail \
  --name agence-immobiliere-staging-backend \
  --resource-group agence-immobiliere-staging-rg
```

### Base de données inaccessible
1. Vérifier la connection string MongoDB
2. Vérifier Network Access dans MongoDB Atlas
3. Vérifier que les IPs Azure sont whitelistées

### OAuth ne fonctionne pas
1. Vérifier les URLs dans Google Cloud Console
2. Vérifier les secrets `STAGING_GOOGLE_CLIENT_ID` et `STAGING_GOOGLE_CLIENT_SECRET`
3. Vérifier que le frontend peut atteindre le backend

---

## 🎉 Félicitations !

Une fois toutes ces étapes complétées, vous aurez:
- ✅ Un environnement staging automatisé
- ✅ Déploiement automatique sur chaque merge
- ✅ Capacité de rollback
- ✅ Monitoring activé
- ✅ Base pour la production

## 📅 Prochaines Étapes

Après validation du staging:
1. **AW-22**: Tests E2E automatisés
2. **AW-23**: Monitoring avancé
3. **AW-24**: Feature flags
4. **AW-25**: Déploiement production
