# 🔧 Guide de Configuration Azure pour Staging

Ce guide vous accompagne dans la configuration complète de l'environnement staging sur Azure.

## 📋 Prérequis

- [ ] Compte Azure actif
- [ ] Azure CLI installé localement
- [ ] Accès administrateur au repository GitHub
- [ ] Compte MongoDB Atlas

## 🚀 Étape 1: Connexion à Azure

```bash
# Connexion à Azure
az login

# Vérifier l'abonnement
az account show

# Si besoin, changer d'abonnement
az account set --subscription "Nom ou ID de votre abonnement"
```

## 📦 Étape 2: Créer le Resource Group

```bash
# Créer un resource group dédié au staging
az group create \
  --name agence-immobiliere-staging-rg \
  --location westeurope

# Vérifier la création
az group show --name agence-immobiliere-staging-rg
```

## 🖥️ Étape 3: Créer l'App Service (Backend)

### 3.1 Créer le plan App Service

```bash
# Plan Linux B1 (basique, suffisant pour staging)
az appservice plan create \
  --name agence-immobiliere-staging-plan \
  --resource-group agence-immobiliere-staging-rg \
  --is-linux \
  --sku B1

# Vérifier la création
az appservice plan show \
  --name agence-immobiliere-staging-plan \
  --resource-group agence-immobiliere-staging-rg
```

### 3.2 Créer l'App Service Backend

```bash
# Créer l'app service avec runtime Node.js 20
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

**URL Backend**: `https://agence-immobiliere-staging-backend.azurewebsites.net`

### 3.3 Configurer les variables d'environnement

```bash
# Configurer NODE_ENV
az webapp config appsettings set \
  --name agence-immobiliere-staging-backend \
  --resource-group agence-immobiliere-staging-rg \
  --settings NODE_ENV=staging

# Note: Les autres variables seront configurées via GitHub Actions
# lors du déploiement (MongoDB URI, secrets, etc.)
```

## 🌐 Étape 4: Créer Static Web App (Frontend)

```bash
# Créer la Static Web App
az staticwebapp create \
  --name agence-immobiliere-staging-frontend \
  --resource-group agence-immobiliere-staging-rg \
  --location westeurope \
  --sku Free

# Récupérer le deployment token
az staticwebapp secrets list \
  --name agence-immobiliere-staging-frontend \
  --resource-group agence-immobiliere-staging-rg \
  --query properties.apiKey -o tsv
```

**Sauvegarder ce token** - vous en aurez besoin pour GitHub Secrets!

```bash
# Récupérer l'URL du frontend
az staticwebapp show \
  --name agence-immobiliere-staging-frontend \
  --resource-group agence-immobiliere-staging-rg \
  --query defaultHostname -o tsv
```

## 🗄️ Étape 5: Configuration MongoDB Atlas

### 5.1 Créer un cluster staging

1. Aller sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Créer un nouveau cluster ou utiliser un existant
3. Créer une database `agence-immobiliere-staging`

### 5.2 Configurer le Network Access

```bash
# Récupérer les IPs sortantes de l'App Service
az webapp show \
  --name agence-immobiliere-staging-backend \
  --resource-group agence-immobiliere-staging-rg \
  --query outboundIpAddresses -o tsv
```

Dans MongoDB Atlas:
1. Aller dans `Network Access`
2. Ajouter les IPs affichées ci-dessus
3. Ou autoriser l'accès depuis Azure (0.0.0.0/0 avec VNet)

### 5.3 Créer un utilisateur de base de données

Dans MongoDB Atlas:
1. Aller dans `Database Access`
2. Créer un nouvel utilisateur:
   - Username: `agence-staging`
   - Password: Générer un mot de passe fort
   - Rôle: `readWrite` sur `agence-immobiliere-staging`

### 5.4 Récupérer la connection string

```
mongodb+srv://agence-staging:<password>@cluster.mongodb.net/agence-immobiliere-staging?retryWrites=true&w=majority
```

**Sauvegarder cette connection string** pour GitHub Secrets!

## 🔐 Étape 6: Créer le Service Principal Azure

Pour permettre à GitHub Actions de déployer sur Azure:

```bash
# Créer un service principal avec rôle Contributor
az ad sp create-for-rbac \
  --name "github-actions-agence-staging" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/agence-immobiliere-staging-rg \
  --sdk-auth

# Remplacer {subscription-id} par votre ID d'abonnement
# Récupérer l'ID: az account show --query id -o tsv
```

**Output exemple**:
```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "subscriptionId": "xxx",
  "tenantId": "xxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

**Sauvegarder ce JSON complet** pour GitHub Secrets (`AZURE_CREDENTIALS`)!

## 🔑 Étape 7: Configuration Google OAuth

### 7.1 Créer des credentials staging

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Sélectionner votre projet
3. Aller dans `APIs & Services` → `Credentials`
4. Créer un nouveau `OAuth 2.0 Client ID`

### 7.2 Configurer les URIs autorisés

**Authorized JavaScript origins**:
```
https://agence-immobiliere-staging-frontend.azurestaticapps.net
```

**Authorized redirect URIs**:
```
https://agence-immobiliere-staging-backend.azurewebsites.net/api/auth/google/callback
```

### 7.3 Sauvegarder les credentials

Vous recevrez:
- `Client ID`: Pour `STAGING_GOOGLE_CLIENT_ID`
- `Client Secret`: Pour `STAGING_GOOGLE_CLIENT_SECRET`

## 🔐 Étape 8: Générer les Secrets

### 8.1 JWT Secret

```bash
# Générer un secret aléatoire de 64 caractères
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Utiliser pour `STAGING_JWT_SECRET`

### 8.2 Session Secret

```bash
# Générer un autre secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Utiliser pour `STAGING_SESSION_SECRET`

## 📝 Étape 9: Configurer GitHub Secrets

Aller dans votre repository GitHub:
`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### Secrets à Créer

| Secret Name | Value | Source |
|------------|-------|--------|
| `AZURE_CREDENTIALS` | JSON du service principal | Étape 6 |
| `AZURE_RESOURCE_GROUP` | `agence-immobiliere-staging-rg` | Étape 2 |
| `STAGING_BACKEND_APP_NAME` | `agence-immobiliere-staging-backend` | Étape 3 |
| `STAGING_FRONTEND_URL` | URL du Static Web App | Étape 4 |
| `STAGING_STATIC_WEB_APP_TOKEN` | Deployment token | Étape 4 |
| `STAGING_API_URL` | `https://agence-immobiliere-staging-backend.azurewebsites.net` | Étape 3 |
| `STAGING_MONGODB_URI` | Connection string MongoDB | Étape 5 |
| `STAGING_JWT_SECRET` | Secret généré | Étape 8.1 |
| `STAGING_SESSION_SECRET` | Secret généré | Étape 8.2 |
| `STAGING_GOOGLE_CLIENT_ID` | Client ID Google OAuth | Étape 7 |
| `STAGING_GOOGLE_CLIENT_SECRET` | Client Secret Google OAuth | Étape 7 |

### Vérifier la configuration

```bash
# Dans votre terminal local
echo "✅ Configuration GitHub Secrets"
echo "Vérifier que tous les secrets sont créés dans:"
echo "https://github.com/<USERNAME>/agence-immobiliere-app/settings/secrets/actions"
```

## 🧪 Étape 10: Test du Déploiement

### 10.1 Déclencher un déploiement manuel

1. Aller dans `Actions` sur GitHub
2. Sélectionner `Staging Deployment`
3. Cliquer sur `Run workflow`
4. Sélectionner `main`
5. Cliquer sur `Run workflow`

### 10.2 Surveiller le déploiement

Observer les logs en temps réel dans l'onglet Actions.

### 10.3 Vérifier le déploiement

```bash
# Health check backend
curl https://agence-immobiliere-staging-backend.azurewebsites.net/health

# Devrait retourner: {"status":"OK","message":"API is running",...}

# Page d'accueil frontend
curl -I https://agence-immobiliere-staging-frontend.azurestaticapps.net

# Devrait retourner: HTTP/2 200
```

## 📊 Étape 11: Configuration du Monitoring

### 11.1 Activer Application Insights

```bash
# Créer une instance Application Insights
az monitor app-insights component create \
  --app agence-immobiliere-staging-insights \
  --location westeurope \
  --resource-group agence-immobiliere-staging-rg \
  --application-type web

# Récupérer la clé d'instrumentation
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

### 11.2 Configurer les alertes

```bash
# Alerte sur erreurs 5xx
az monitor metrics alert create \
  --name staging-http-5xx-alert \
  --resource-group agence-immobiliere-staging-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/agence-immobiliere-staging-rg/providers/Microsoft.Web/sites/agence-immobiliere-staging-backend \
  --condition "total Http5xx > 10" \
  --window-size 5m \
  --evaluation-frequency 1m
```

## 🎉 Configuration Terminée!

### Checklist Finale

- [ ] Resource group créé
- [ ] App Service backend créé et configuré
- [ ] Static Web App frontend créé
- [ ] MongoDB Atlas cluster staging configuré
- [ ] Service Principal Azure créé
- [ ] Google OAuth credentials staging créés
- [ ] Tous les secrets GitHub configurés
- [ ] Premier déploiement réussi
- [ ] Health checks passent
- [ ] Application Insights activé
- [ ] Alertes configurées

### URLs à Documenter

```
Backend Staging: https://agence-immobiliere-staging-backend.azurewebsites.net
Frontend Staging: https://agence-immobiliere-staging-frontend.azurestaticapps.net
Health Check: https://agence-immobiliere-staging-backend.azurewebsites.net/health
API Docs: https://agence-immobiliere-staging-backend.azurewebsites.net/api-docs
```

### Prochaines Étapes

1. Tester le workflow de rollback
2. Configurer des tests E2E (AW-22)
3. Mettre en place le monitoring avancé (AW-23)
4. Documenter pour l'équipe

## 🆘 Support

Si vous rencontrez des problèmes:

1. Consulter `docs/STAGING_DEPLOYMENT.md`
2. Vérifier les logs Azure
3. Contacter l'équipe DevOps

## 📚 Ressources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
