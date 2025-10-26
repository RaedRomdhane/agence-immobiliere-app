# Stratégie de Branchement - GitHub Flow

## 📌 Vue d'ensemble

Notre projet utilise **GitHub Flow**, une stratégie simple et efficace pour les équipes DevOps.

## 🌳 Structure des branches

### Branche principale : `main`

- Contient toujours du code prêt pour la production
- Protégée contre les pushs directs
- Tous les commits doivent passer par des Pull Requests (PR)
- Les tests CI/CD doivent passer avant tout merge

### Branches de fonctionnalités

**Format :** `feature/[JIRA-ID]-description-courte`

**Exemples :**
- `feature/DEV-101-page-inscription`
- `feature/DEV-102-api-biens-immobiliers`
- `feature/DEVOPS-01-pipeline-ci`

### Branches de correction

**Format :** `fix/[JIRA-ID]-description-bug`

**Exemples :**
- `fix/BUG-50-erreur-connexion-db`
- `fix/BUG-51-validation-email`

### Branches de hotfix (urgences en production)

**Format :** `hotfix/[JIRA-ID]-description`

**Exemple :**
- `hotfix/CRIT-10-faille-securite-auth`

## 🔄 Workflow de développement

### 1. Créer une nouvelle branche

```powershell
# Toujours partir de main à jour
git checkout main
git pull origin main

# Créer votre branche de feature
git checkout -b feature/DEV-101-page-inscription
```

### 2. Développer et commiter

```powershell
# Faire vos modifications
git add .

# Commit avec référence Jira
git commit -m "DEV-101: Ajout formulaire inscription avec validation"

# Pusher régulièrement
git push origin feature/DEV-101-page-inscription
```

### 3. Créer une Pull Request

1. Aller sur GitHub
2. Cliquer sur "Compare & pull request"
3. **Titre :** `[DEV-101] Ajout page d'inscription`
4. Description détaillée des changements
5. Assigner des reviewers
6. Lier le ticket Jira

### 4. Code Review

- Au moins **1 approbation** requise
- Les tests CI/CD doivent passer
- Résoudre les commentaires
- Mettre à jour si nécessaire

### 5. Merger vers main

```bash
# Méthode : Squash and merge (recommandé)
# Cela crée un seul commit propre dans main
```

### 6. Déploiement automatique

- Le merge vers `main` déclenche le pipeline CI/CD
- Déploiement automatique en staging
- Tests E2E exécutés
- Si succès → prêt pour la production

## 📋 Règles de commit

### Format des messages

```
[JIRA-ID]: Description courte (max 50 caractères)

Description détaillée si nécessaire (max 72 caractères par ligne)
- Point 1
- Point 2

Références: #issue-number
```

### ✅ Exemples de bons commits

```powershell
git commit -m "DEV-101: Ajout validation email côté client"
git commit -m "DEVOPS-05: Configuration pipeline staging"
git commit -m "FIX-23: Correction erreur 500 sur endpoint /users"
```

### ❌ Mauvais exemples

```powershell
git commit -m "fix"
git commit -m "WIP"
git commit -m "modifications"
```

## 🔒 Protection de la branche main

### Paramètres à configurer sur GitHub

1. **Settings** → **Branches** → **Add rule**
2. **Nom de la branche :** `main`
3. **Cocher :**
   - ✅ Require pull request reviews before merging (1 approbation minimum)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators
   - ✅ Restrict who can push to matching branches

## 🚀 Intégration avec Jira

### Configuration

1. Installer l'intégration GitHub pour Jira
2. Lier le dépôt à votre projet Jira
3. Les commits avec ID Jira seront automatiquement liés

### Exemple de lien automatique

```powershell
# Ce commit sera automatiquement lié au ticket DEV-101 dans Jira
git commit -m "DEV-101: Implémentation authentification OAuth"
```

### Commandes Jira dans les commits

- `DEV-101: #comment Ajout de la validation` → Ajoute un commentaire
- `DEV-101: #time 2h` → Log le temps passé
- `DEV-101: #done` → Marque le ticket comme terminé

## 📊 Bonnes pratiques

### ✅ À faire

- Créer des branches courtes et focalisées (1 feature = 1 branche)
- Commiter souvent avec des messages clairs
- Pousser régulièrement pour backup
- Faire des PR petites et faciles à review
- Supprimer les branches après merge
- Garder `main` toujours déployable

### ❌ À éviter

- Travailler directement sur `main`
- Créer des branches qui vivent plusieurs semaines
- Faire des commits géants avec 50 fichiers
- Oublier de référencer le ticket Jira
- Merger sans code review
- Laisser des branches mortes

## 🆘 Commandes utiles

```powershell
# Voir toutes les branches
git branch -a

# Supprimer une branche locale
git branch -d feature/DEV-101-page-inscription

# Supprimer une branche distante
git push origin --delete feature/DEV-101-page-inscription

# Mettre à jour votre branche avec main
git checkout feature/DEV-101-page-inscription
git pull origin main
git push origin feature/DEV-101-page-inscription

# Annuler le dernier commit (garde les modifications)
git reset --soft HEAD~1

# Voir l'historique propre
git log --oneline --graph --all
```

## 📅 Checklist avant de merger

- [ ] Les tests unitaires passent localement
- [ ] Le code respecte les conventions du projet
- [ ] La documentation est à jour si nécessaire
- [ ] Le commit référence le ticket Jira
- [ ] La PR a une description claire
- [ ] Au moins 1 approbation reçue
- [ ] Les tests CI/CD sont verts
- [ ] Pas de conflits avec `main`

## 🎓 Ressources

- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Jira GitHub Integration](https://support.atlassian.com/jira-cloud-administration/docs/integrate-with-github/)

---

**Date de dernière mise à jour :** Octobre 2025  
**Responsable :** Équipe DevOps  
**Version :** 1.0
