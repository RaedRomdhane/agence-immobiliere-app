# Guide de Rollback - Staging

## 🔄 Vue d'ensemble

Ce guide explique comment effectuer un rollback (retour à une version précédente) en cas de problème après un déploiement staging.

## 📊 Scénarios de rollback

### Scénario 1 : Backend défaillant
**Symptômes :**
- Health check échoue (`/health` retourne 500 ou timeout)
- Erreurs dans les logs Railway
- API ne répond pas

**Solution :** Rollback Railway

### Scénario 2 : Frontend défaillant
**Symptômes :**
- Page blanche
- Erreurs JavaScript dans la console
- Build Vercel échoué

**Solution :** Rollback Vercel

### Scénario 3 : Migration de base de données problématique
**Symptômes :**
- Erreurs de schéma MongoDB
- Données corrompues
- Perte de données

**Solution :** Restore MongoDB backup + Rollback app

---

## 🚀 Méthodes de rollback

### Méthode 1 : Rollback automatique (GitHub Actions)

Le workflow `.github/workflows/staging-deploy.yml` inclut un rollback automatique en cas d'échec de health check.

**Fonctionnement :**
```yaml
# Si le health check échoue, le rollback s'exécute automatiquement
if: failure()
needs: [deploy-backend, deploy-frontend]
```

**Logs :**
- GitHub → Actions → Voir le workflow qui a échoué
- Vérifier la step "Rollback Deployment"

---

### Méthode 2 : Rollback manuel Railway (Backend)

#### Option A : Via Railway Dashboard (Recommandé)
1. Aller sur [Railway Dashboard](https://railway.app/dashboard)
2. Sélectionner le projet "agence-immobiliere-backend"
3. Onglet "Deployments"
4. Trouver le dernier déploiement stable (icône verte ✅)
5. Cliquer sur les 3 points "..." → "Redeploy"
6. Confirmer

**Temps estimé :** 2-3 minutes

#### Option B : Via Railway CLI
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Lister les déploiements
railway list

# Rollback vers un déploiement spécifique
railway rollback <deployment-id>

# Ou rollback vers la version précédente
railway rollback --previous
```

**Exemple :**
```bash
$ railway list
Deployments:
  d-abc123 - v1.2.3 - ✅ Success (Current)
  d-def456 - v1.2.2 - ✅ Success
  d-ghi789 - v1.2.1 - ✅ Success

$ railway rollback d-def456
✅ Rolled back to deployment d-def456
```

---

### Méthode 3 : Rollback manuel Vercel (Frontend)

#### Option A : Via Vercel Dashboard (Recommandé)
1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet "agence-immobiliere-frontend"
3. Onglet "Deployments"
4. Trouver le dernier déploiement stable
5. Cliquer sur les 3 points "..." → "Promote to Production"
6. Confirmer

**Temps estimé :** 30 secondes

#### Option B : Via Vercel CLI
```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Lister les déploiements
vercel list

# Rollback (promouvoir un ancien déploiement)
vercel alias set <deployment-url> <production-domain>
```

**Exemple :**
```bash
$ vercel list
Deployments:
  agence-immobiliere-app-xyz.vercel.app - ✅ Production
  agence-immobiliere-app-abc.vercel.app - ✅ Ready
  agence-immobiliere-app-def.vercel.app - ✅ Ready

$ vercel alias set agence-immobiliere-app-abc.vercel.app agence-immobiliere-app.vercel.app
✅ Deployment promoted to production
```

---

### Méthode 4 : Rollback via Git (Code source)

Si le problème vient du code lui-même :

#### Étape 1 : Identifier le commit problématique
```bash
# Voir l'historique
git log --oneline -10

# Exemple de sortie
abc1234 (HEAD -> main, origin/main) feat: nouvelle fonctionnalité (BUG!)
def5678 fix: correction bug auth
ghi9012 feat: ajout dashboard admin (STABLE)
```

#### Étape 2 : Revert le commit problématique
```bash
# Option A : Revert (crée un nouveau commit qui annule les changements)
git revert abc1234
git push origin main

# Option B : Reset hard (ATTENTION : destructif!)
git reset --hard ghi9012
git push origin main --force
```

⚠️ **Important :**
- `git revert` : Préféré, garde l'historique
- `git reset --hard` : Dangereux, perd l'historique

#### Étape 3 : Attendre le redéploiement automatique
- GitHub Actions va se déclencher automatiquement
- Railway et Vercel vont redéployer le code rollbacké

---

### Méthode 5 : Rollback manuel GitHub Actions

Si vous voulez forcer un redéploiement sans changer le code :

1. GitHub repository → Actions
2. Sélectionner "Deploy to Staging"
3. Cliquer "Run workflow"
4. Branch : `main`
5. Cliquer "Run workflow"

---

## 🗄️ Rollback de base de données MongoDB

### Précaution : Backup régulier

**Configuration du backup automatique MongoDB Atlas :**
1. MongoDB Atlas Dashboard → Cluster
2. Backup → Configure
3. Activer "Continuous Backup" (si disponible)
4. Ou configurer des snapshots quotidiens

### Rollback de schéma

Si une migration a cassé le schéma :

```bash
# Se connecter à MongoDB
mongosh "mongodb+srv://agence-staging-user:PASSWORD@cluster.mongodb.net/agence-staging"

# Lister les collections
show collections

# Supprimer une collection problématique
db.problematic_collection.drop()

# Ou restaurer depuis un backup
# (voir section Restore backup)
```

### Restore depuis un backup

**Via MongoDB Atlas Dashboard :**
1. Cluster → Backup
2. Sélectionner un snapshot
3. Restore Options → "Download" ou "Restore to cluster"
4. Si restore to cluster, choisir un nouveau cluster temporaire
5. Exporter les données et réimporter dans le cluster staging

**Via mongorestore :**
```bash
# Télécharger le backup depuis Atlas
# Puis restaurer
mongorestore --uri="mongodb+srv://agence-staging-user:PASSWORD@cluster.mongodb.net/agence-staging" \
  --dir=./backup
```

---

## 📋 Checklist de rollback

### Avant le rollback
- [ ] Identifier la cause du problème (logs, metrics, erreurs)
- [ ] Documenter l'incident (quoi, quand, pourquoi)
- [ ] Notifier l'équipe
- [ ] Sauvegarder la base de données (si possible)

### Pendant le rollback
- [ ] Choisir la méthode de rollback appropriée
- [ ] Exécuter le rollback (Railway, Vercel, ou Git)
- [ ] Surveiller les logs pendant le redéploiement
- [ ] Vérifier les health checks

### Après le rollback
- [ ] Tester l'application (frontend + backend)
- [ ] Vérifier que la base de données est cohérente
- [ ] Notifier l'équipe que le rollback est terminé
- [ ] Analyser la cause racine du problème
- [ ] Créer un ticket pour corriger le bug
- [ ] Documenter l'incident dans un post-mortem

---

## ⏱️ Temps de rollback estimés

| Méthode | Temps | Complexité |
|---------|-------|------------|
| Railway Dashboard | 2-3 min | ⭐ Facile |
| Vercel Dashboard | 30 sec | ⭐ Facile |
| Railway CLI | 1-2 min | ⭐⭐ Moyen |
| Vercel CLI | 1 min | ⭐⭐ Moyen |
| Git Revert + Push | 5-10 min | ⭐⭐⭐ Avancé |
| MongoDB Restore | 10-30 min | ⭐⭐⭐⭐ Expert |

---

## 🚨 Rollback d'urgence (< 5 minutes)

En cas d'incident critique en production :

### Procédure express
```bash
# 1. Rollback Railway (1 min)
railway rollback --previous

# 2. Rollback Vercel (30 sec)
vercel rollback

# 3. Vérifier
curl https://VOTRE-URL.railway.app/health
curl https://VOTRE-URL.vercel.app

# 4. Notifier l'équipe
echo "Rollback effectué. Incident en cours d'analyse."
```

---

## 📞 Contacts et support

En cas de problème bloquant :

1. **Escalade niveau 1** : Équipe dev (Slack #dev-support)
2. **Escalade niveau 2** : Tech lead / CTO
3. **Support externe** :
   - Railway : [help@railway.app](mailto:help@railway.app)
   - Vercel : [support.vercel.com](https://support.vercel.com)
   - MongoDB Atlas : [support.mongodb.com](https://support.mongodb.com)

---

## 📚 Ressources

- [Railway Rollback Docs](https://docs.railway.app/deploy/deployments#rollbacks)
- [Vercel Deployment Rollback](https://vercel.com/docs/concepts/deployments/rollback)
- [MongoDB Backup & Restore](https://docs.mongodb.com/manual/tutorial/backup-and-restore-tools/)
- [Git Revert vs Reset](https://www.atlassian.com/git/tutorials/undoing-changes)

---

## 📝 Template de rapport d'incident

Après un rollback, documenter :

```markdown
## Incident Report - [DATE]

### Résumé
- **Quand** : [Date et heure]
- **Durée** : [Temps d'indisponibilité]
- **Impact** : [Utilisateurs affectés, fonctionnalités]

### Cause racine
[Description détaillée du problème]

### Actions prises
1. [Action 1]
2. [Action 2]
3. Rollback effectué vers version [XXX]

### Prévention future
- [ ] [Action préventive 1]
- [ ] [Action préventive 2]

### Timeline
- HH:MM - Incident détecté
- HH:MM - Rollback initié
- HH:MM - Service restauré
- HH:MM - Incident résolu
```
