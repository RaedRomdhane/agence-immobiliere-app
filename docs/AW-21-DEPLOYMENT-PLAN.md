# AW-21 : Déploiement Automatique Staging

## 📋 Vue d'ensemble

Déploiement automatique de l'application en environnement de staging avec pipeline CI/CD complet.

## 🏗️ Architecture de déploiement

### Backend (Node.js/Express)
- **Plateforme** : Railway (recommandé) ou Render
- **Base de données** : MongoDB Atlas (cluster staging M0 gratuit)
- **URL** : `https://agence-immobiliere-staging-api.railway.app`

### Frontend (Next.js)
- **Plateforme** : Vercel
- **URL** : `https://agence-immobiliere-staging.vercel.app`

### CI/CD
- **Outil** : GitHub Actions
- **Déclencheur** : Merge sur branche `main`

## 🔐 Variables d'environnement

### Backend (Railway)
```env
NODE_ENV=staging
PORT=5000
MONGODB_URI=mongodb+srv://staging-user:password@cluster.mongodb.net/agence-staging
JWT_SECRET=<secret-secure-staging>
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
CLIENT_URL=https://agence-immobiliere-staging.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://agence-immobiliere-staging-api.railway.app/api
NEXT_PUBLIC_APP_NAME=Agence Immobilière (Staging)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-oauth-client-id>
```

## 🚀 Flux de déploiement

### 1. Développement local
```
feature/xxx → PR → Review → Merge to main
```

### 2. CI/CD automatique (GitHub Actions)
```
main merge → Tests → Build → Deploy Backend (Railway) → Deploy Frontend (Vercel) → Health Check
```

### 3. Rollback si échec
```
Deployment failed → Auto-rollback to previous version → Notification
```

## 📦 Étapes d'implémentation

### Phase 1 : Configuration MongoDB Atlas Staging
1. Créer un cluster M0 gratuit sur MongoDB Atlas
2. Créer une base de données `agence-staging`
3. Configurer l'accès réseau (IP whitelist: 0.0.0.0/0 pour staging)
4. Créer un utilisateur dédié avec mot de passe sécurisé

### Phase 2 : Configuration Railway (Backend)
1. Créer un compte Railway (connexion GitHub)
2. Créer un nouveau projet "agence-immobiliere-backend-staging"
3. Connecter le repository GitHub
4. Configurer les variables d'environnement
5. Configurer le build command : `npm install && npm run build`
6. Configurer le start command : `npm start`
7. Activer le déploiement automatique sur `main`

### Phase 3 : Configuration Vercel (Frontend)
1. Créer un compte Vercel (connexion GitHub)
2. Importer le projet depuis GitHub
3. Configurer le root directory : `frontend`
4. Ajouter les variables d'environnement
5. Activer le déploiement automatique sur `main`

### Phase 4 : GitHub Actions Workflow
1. Créer `.github/workflows/staging-deploy.yml`
2. Configurer les secrets GitHub
3. Implémenter les étapes : lint, test, deploy, health-check
4. Ajouter notifications (Slack/Discord/Email)

### Phase 5 : Migrations de base de données
1. Créer un dossier `backend/src/migrations/`
2. Ajouter un script de migration : `npm run migrate:staging`
3. Intégrer dans le workflow de déploiement
4. Versionner les migrations

### Phase 6 : Rollback automatique
1. Railway : Utiliser les déploiements versionnés
2. Vercel : Utiliser les déploiements Vercel (rollback 1-click)
3. GitHub Actions : Ajouter un workflow manuel de rollback

## 🧪 Tests de validation

### Critères d'acceptation
- ✅ Le déploiement se déclenche automatiquement après merge sur `main`
- ✅ Les variables d'environnement sont configurées sécuritairement
- ✅ L'application est accessible via URLs de staging
- ✅ La base de données staging est migrée automatiquement
- ✅ Le rollback est possible (manuel ou automatique)

### Scénarios de test
1. **Test de déploiement initial** : Merge PR → Vérifier deployment success
2. **Test de health check** : Appeler `/health` → Status 200
3. **Test d'authentification** : Login → Vérifier JWT
4. **Test de Google OAuth** : Connexion Google → Callback success
5. **Test de rollback** : Déclencher rollback → Version précédente active

## 📝 Documentation requise

1. **README_DEPLOYMENT.md** : Guide complet de déploiement
2. **ROLLBACK.md** : Procédure de rollback
3. **TROUBLESHOOTING.md** : Problèmes courants et solutions
4. **.env.example** : Templates des variables d'environnement

## 🔄 Stratégie de rollback

### Rollback automatique (GitHub Actions)
```yaml
- name: Health check
  run: |
    if ! curl -f $STAGING_URL/health; then
      echo "Health check failed, triggering rollback"
      # Rollback logic
    fi
```

### Rollback manuel
```bash
# Railway
railway rollback <deployment-id>

# Vercel
vercel rollback <deployment-url>

# GitHub (revert commit)
git revert <commit-hash>
git push origin main
```

## 🎯 Prochaines étapes

Après validation de AW-21 :
- AW-22 : Tests E2E avec Playwright
- AW-23 : Monitoring et alertes (Sentry, LogRocket)
- AW-24 : Déploiement production avec blue-green deployment
