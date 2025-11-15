# 📚 Index de Documentation - Agence Immobilière

> **Projet :** Plateforme Immobilière Tunisie  
> **Stack :** Next.js 15 + Node.js + MongoDB  
> **Langues :** FR / AR (RTL)  
> **Dernière mise à jour :** 15 novembre 2025

---

## 🎯 Documents Principaux

### � Statut & Suivi
- **[STATUT-PROJET.md](./STATUT-PROJET.md)** 📊 **VUE D'ENSEMBLE**
  - Progression globale du projet (25%)
  - Statut détaillé Sprint 2 en cours
  - Prochaines actions prioritaires
  - Risques et métriques

### �📋 Backlog & User Stories
- **[BACKLOG-COMPLET-USER-STORIES.md](./BACKLOG-COMPLET-USER-STORIES.md)** ⭐
  - 13 Épiques
  - 48+ User Stories détaillées
  - Roadmap sur 31 sprints
  - Priorisations et estimations
- **[PLANNING-SPRINTS-2-4.md](./PLANNING-SPRINTS-2-4.md)** 🎯 **NOUVEAU**
  - Planning détaillé Sprints 2-4 (6 semaines)
  - 256 points story répartis
  - Dépendances et livrables
  - Checklist et actions par sprint

### 🏗️ Architecture & Diagrammes UML
- **[class-diagram.puml](./class-diagram.puml)** - Diagramme de classes complet (20+ classes)
- **[structure-sprint1-actuel.puml](./structure-sprint1-actuel.puml)** - Vue simplifiée Sprint 1
- **[connexion-sequence.puml](./connexion-sequence.puml)** ⭐ - Flow login (email + Google OAuth)
- **[inscription-sequence.puml](./inscription-sequence.puml)** ⭐ - Flow signup (email + Google OAuth)

---

## 📖 Guides Techniques

### 🚀 Déploiement
- **[DEPLOYMENT_SUCCESS.md](./DEPLOYMENT_SUCCESS.md)** - Historique des déploiements réussis
- **[RAILWAY_MONITORING.md](./RAILWAY_MONITORING.md)** - Monitoring Railway
- **[RAILWAY_VARIABLES.md](./RAILWAY_VARIABLES.md)** - Variables d'environnement Railway
- **[ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md)** - Procédure de rollback
- **[STAGING_DEPLOYMENT.md](./STAGING_DEPLOYMENT.md)** - Déploiement staging
- **[VERCEL_RAILWAY_SETUP.md](./VERCEL_RAILWAY_SETUP.md)** - Setup Vercel + Railway
- **[VERCEL_QUICK_SETUP.md](./VERCEL_QUICK_SETUP.md)** - Setup rapide Vercel

### 🔧 Configuration
- **[DOCKER-GUIDE.md](./DOCKER-GUIDE.md)** - Guide Docker complet
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Configuration OAuth Google
- **[AZURE_SETUP.md](./AZURE_SETUP.md)** - Setup Azure
- **[GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)** - Secrets GitHub Actions
- **[DATABASE-GUIDE.md](./DATABASE-GUIDE.md)** - Guide MongoDB

### 👨‍💻 Développement
- **[DEV-SETUP-GUIDE.md](./DEV-SETUP-GUIDE.md)** - Setup environnement local
- **[STAGING_SETUP_GUIDE.md](./STAGING_SETUP_GUIDE.md)** - Setup environnement staging
- **[BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md)** - Stratégie Git

---

## ✅ Validation & Acceptance

### 📝 Checklists
- **[ACCEPTANCE_CRITERIA_CHECKLIST.md](./ACCEPTANCE_CRITERIA_CHECKLIST.md)** - Critères d'acceptation globaux
- **[AW-9-FINAL-VALIDATION.md](./AW-9-FINAL-VALIDATION.md)** - Validation finale AW-9
- **[AW-9-VERIFICATION.md](./AW-9-VERIFICATION.md)** - Vérification AW-9
- **[AW-12-CHECKLIST.md](./AW-12-CHECKLIST.md)** - Checklist AW-12
- **[AW-12-COMPLETION-REPORT.md](./AW-12-COMPLETION-REPORT.md)** - Rapport AW-12
- **[AW-13-CHECKLIST.md](./AW-13-CHECKLIST.md)** - Checklist AW-13

---

### 📅 Plans d'Action

### 🎯 Sprint Plans
- **[PLANNING-SPRINTS-2-4.md](./PLANNING-SPRINTS-2-4.md)** 🎯 - Planning complet 6 semaines
- **[SPRINT-2-GUIDE.md](./SPRINT-2-GUIDE.md)** 🚀 **EN COURS** - Guide détaillé Sprint 2
- **[ACTION_PLAN_STAGING.md](./ACTION_PLAN_STAGING.md)** - Plan d'action staging
- **[AW-17-FRONTEND-PLAN.md](./AW-17-FRONTEND-PLAN.md)** - Plan frontend AW-17
- **[AW-21-DEPLOYMENT-PLAN.md](./AW-21-DEPLOYMENT-PLAN.md)** - Plan déploiement AW-21

### 📚 API Documentation
- **[backend/docs/AW-15-API-GUIDE.md](../backend/docs/AW-15-API-GUIDE.md)** - Guide API complet
- **[backend/docs/AW-15-PLAN.md](../backend/docs/AW-15-PLAN.md)** - Plan API AW-15

---

## 🗂️ Organisation par Thématique

### 🔐 Authentification
```
├── GOOGLE_OAUTH_SETUP.md       # Configuration Google OAuth
├── connexion-sequence.puml     # Diagramme login
├── inscription-sequence.puml   # Diagramme signup
└── backend/docs/AW-15-API-GUIDE.md  # Endpoints auth
```

### 🏢 Gestion Biens Immobiliers
```
├── BACKLOG-COMPLET-USER-STORIES.md  # US Épique 1
├── class-diagram.puml               # Modèle Property
└── DATABASE-GUIDE.md                # Schema MongoDB
```

### 🚀 DevOps & Infrastructure
```
├── DOCKER-GUIDE.md              # Conteneurisation
├── RAILWAY_MONITORING.md        # Monitoring production
├── DEPLOYMENT_SUCCESS.md        # Historique déploiements
├── ROLLBACK_GUIDE.md            # Procédure rollback
└── BACKLOG-COMPLET-USER-STORIES.md  # US Épique 10
```

### 🔒 Sécurité
```
├── GITHUB_SECRETS_SETUP.md      # Secrets CI/CD
├── AZURE_SETUP.md               # Sécurité Azure
└── BACKLOG-COMPLET-USER-STORIES.md  # US Épique 11
```

### 📊 Tests & Qualité
```
├── AW-9-VERIFICATION.md         # Tests AW-9
├── ACCEPTANCE_CRITERIA_CHECKLIST.md  # Critères globaux
└── BACKLOG-COMPLET-USER-STORIES.md  # US Épique 13
```

---

## 🎨 Visualisation des Diagrammes

### PlantUML - Comment utiliser ?

**Option 1 : Extension VSCode**
```bash
# Installer l'extension PlantUML
code --install-extension jebbs.plantuml

# Ouvrir un fichier .puml
# Clic droit → "Preview Current Diagram"
```

**Option 2 : En ligne**
- [PlantText](https://www.planttext.com/) - Rendu instantané
- [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)

**Option 3 : CLI Local**
```bash
# Installer PlantUML
npm install -g node-plantuml

# Générer PNG
puml generate docs/connexion-sequence.puml -o docs/images/
```

---

## 📊 Statistiques Documentation

| Type | Nombre | Statut |
|------|--------|--------|
| User Stories | 48+ | ✅ Complètes |
| Diagrammes UML | 4 | ✅ À jour |
| Guides techniques | 15+ | ✅ Validés |
| Checklists | 6 | ✅ Opérationnelles |
| Plans d'action | 3 | ✅ En cours |

---

## 🔄 Dernières Mises à Jour

### 🔄 Dernières Mises à Jour

### 15 novembre 2025
- ✅ Ajout `BACKLOG-COMPLET-USER-STORIES.md` (48 US, 13 épiques)
- ✅ Ajout `PLANNING-SPRINTS-2-4.md` (planning détaillé 6 semaines)
- ✅ Ajout `SPRINT-2-GUIDE.md` (guide pratique Sprint 2)
- ✅ Ajout `STATUT-PROJET.md` (vue d'ensemble progression)
- ✅ Création `connexion-sequence.puml` (français)
- ✅ Création `inscription-sequence.puml` (français)
- ✅ Création `INDEX.md` (ce fichier)

### Prochaines Étapes
- [ ] Générer images PNG des diagrammes PlantUML
- [ ] Créer diagrammes de séquence pour CRUD biens
- [ ] Ajouter diagramme d'architecture système complet
- [ ] Compléter guide API avec exemples Postman

---

## 🔗 Liens Rapides

### Développement
- **Local Backend** : http://localhost:5000
- **Local Frontend** : http://localhost:3000
- **Swagger API** : http://localhost:5000/api-docs (à configurer)

### Production
- **Frontend Vercel** : https://votre-app.vercel.app
- **Backend Railway** : https://votre-backend.railway.app
- **Monitoring Grafana** : (à configurer)

### Ressources Externes
- [Next.js 15 Docs](https://nextjs.org/docs)
- [MongoDB Atlas](https://cloud.mongodb.com/)
- [Railway](https://railway.app/)
- [Vercel](https://vercel.com/)

---

## 🤝 Contribution

### Structure des Documents
```markdown
# Titre Principal

> **Description courte**
> **Stack/Tech utilisée**

## Section 1
### Sous-section

**Points clés :**
- Point 1
- Point 2

\```bash
# Commandes
\```

## 🔗 Documents Associés
- [Lien](./fichier.md)
```

### Conventions de Nommage
- **Backlog/US** : `BACKLOG-*.md`, `US-*.md`
- **Guides** : `*-GUIDE.md`, `*-SETUP.md`
- **Plans** : `*-PLAN.md`, `ACTION-*.md`
- **Validation** : `*-CHECKLIST.md`, `*-VERIFICATION.md`
- **Diagrammes** : `*-diagram.puml`, `*-sequence.puml`

---

**Maintenu par :** Équipe Agence Immobilière  
**Dernière révision :** 15 novembre 2025  
**Version :** 2.0
