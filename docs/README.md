# 📚 Documentation Agence Immobilière

> **Bienvenue dans la documentation complète du projet !**  
> Tous les documents nécessaires pour développer, déployer et maintenir la plateforme.

---

## 🚀 DÉMARRAGE RAPIDE

### Vous êtes un nouveau développeur ?
1. 📊 Lisez [STATUT-PROJET.md](./STATUT-PROJET.md) pour comprendre où nous en sommes
2. 🎯 Consultez [SPRINT-2-GUIDE.md](./SPRINT-2-GUIDE.md) pour le sprint actuel
3. 🔧 Suivez [DEV-SETUP-GUIDE.md](./DEV-SETUP-GUIDE.md) pour configurer votre environnement
4. 📋 Explorez [BACKLOG-COMPLET-USER-STORIES.md](./BACKLOG-COMPLET-USER-STORIES.md) pour voir toutes les fonctionnalités

### Vous cherchez quelque chose de précis ?
👉 **Allez directement à [INDEX.md](./INDEX.md)** - Table des matières complète

---

## 📊 DOCUMENTS ESSENTIELS

### 1️⃣ Vue d'Ensemble & Planning
| Document | Description | Utilité |
|----------|-------------|---------|
| 📊 [**STATUT-PROJET.md**](./STATUT-PROJET.md) | Vue d'ensemble du projet (25% complété) | **Voir la progression globale** |
| 📋 [**BACKLOG-COMPLET-USER-STORIES.md**](./BACKLOG-COMPLET-USER-STORIES.md) | 48 User Stories, 13 épiques | **Comprendre toutes les fonctionnalités** |
| 📅 [**PLANNING-SPRINTS-2-4.md**](./PLANNING-SPRINTS-2-4.md) | Planning détaillé 6 semaines | **Planifier le développement** |

### 2️⃣ Sprint Actuel (Sprint 2)
| Document | Description | Utilité |
|----------|-------------|---------|
| 🚀 [**SPRINT-2-GUIDE.md**](./SPRINT-2-GUIDE.md) | Guide complet Sprint 2 | **Développer les fonctionnalités actuelles** |
| 🏗️ [**class-diagram.puml**](./class-diagram.puml) | Diagramme de classes UML | **Comprendre l'architecture** |
| 🔐 [**connexion-sequence.puml**](./connexion-sequence.puml) | Flow d'authentification | **Voir le parcours login** |

### 3️⃣ Guides Techniques
| Document | Description | Utilité |
|----------|-------------|---------|
| 🔧 [**DEV-SETUP-GUIDE.md**](./DEV-SETUP-GUIDE.md) | Configuration environnement local | **Installer et lancer le projet** |
| 🐳 [**DOCKER-GUIDE.md**](./DOCKER-GUIDE.md) | Conteneurisation Docker | **Déployer avec Docker** |
| 🗄️ [**DATABASE-GUIDE.md**](./DATABASE-GUIDE.md) | Guide MongoDB | **Gérer la base de données** |

### 4️⃣ Déploiement & DevOps
| Document | Description | Utilité |
|----------|-------------|---------|
| 🚀 [**DEPLOYMENT_SUCCESS.md**](./DEPLOYMENT_SUCCESS.md) | Historique déploiements | **Voir les déploiements réussis** |
| 📊 [**RAILWAY_MONITORING.md**](./RAILWAY_MONITORING.md) | Monitoring Railway | **Surveiller la production** |
| 🔄 [**ROLLBACK_GUIDE.md**](./ROLLBACK_GUIDE.md) | Procédure de rollback | **Revenir en arrière en cas d'erreur** |

---

## 🎯 PAR RÔLE

### Vous êtes **Développeur Backend** ?
1. [DEV-SETUP-GUIDE.md](./DEV-SETUP-GUIDE.md) - Setup Node.js + MongoDB
2. [SPRINT-2-GUIDE.md](./SPRINT-2-GUIDE.md) - Créer API CRUD biens
3. [DATABASE-GUIDE.md](./DATABASE-GUIDE.md) - Schémas MongoDB
4. [class-diagram.puml](./class-diagram.puml) - Modèles de données

### Vous êtes **Développeur Frontend** ?
1. [DEV-SETUP-GUIDE.md](./DEV-SETUP-GUIDE.md) - Setup Next.js 15
2. [SPRINT-2-GUIDE.md](./SPRINT-2-GUIDE.md) - Créer formulaires biens
3. [AW-17-FRONTEND-PLAN.md](./AW-17-FRONTEND-PLAN.md) - Plan frontend
4. [connexion-sequence.puml](./connexion-sequence.puml) - Flow auth

### Vous êtes **DevOps** ?
1. [DOCKER-GUIDE.md](./DOCKER-GUIDE.md) - Conteneurisation
2. [RAILWAY_MONITORING.md](./RAILWAY_MONITORING.md) - Monitoring
3. [DEPLOYMENT_SUCCESS.md](./DEPLOYMENT_SUCCESS.md) - Déploiements
4. [PLANNING-SPRINTS-2-4.md](./PLANNING-SPRINTS-2-4.md) - Sprint 4 DevOps

### Vous êtes **QA** ?
1. [SPRINT-2-GUIDE.md](./SPRINT-2-GUIDE.md) - Tests à réaliser
2. [AW-9-VERIFICATION.md](./AW-9-VERIFICATION.md) - Checklist validation
3. [ACCEPTANCE_CRITERIA_CHECKLIST.md](./ACCEPTANCE_CRITERIA_CHECKLIST.md) - Critères d'acceptation

### Vous êtes **Product Owner** ?
1. [STATUT-PROJET.md](./STATUT-PROJET.md) - Vue d'ensemble
2. [BACKLOG-COMPLET-USER-STORIES.md](./BACKLOG-COMPLET-USER-STORIES.md) - Backlog complet
3. [PLANNING-SPRINTS-2-4.md](./PLANNING-SPRINTS-2-4.md) - Planning sprints

---

## 📁 STRUCTURE DU DOSSIER

```
docs/
├── README.md                          ← Vous êtes ici
├── INDEX.md                           ← Table des matières complète
│
├── 📊 STATUT & PLANNING
│   ├── STATUT-PROJET.md              ⭐ Vue d'ensemble progression
│   ├── BACKLOG-COMPLET-USER-STORIES.md  ⭐ 48 User Stories
│   ├── PLANNING-SPRINTS-2-4.md       ⭐ Planning 6 semaines
│   └── SPRINT-2-GUIDE.md             ⭐ Guide Sprint 2 actuel
│
├── 🏗️ ARCHITECTURE
│   ├── class-diagram.puml            # Diagramme classes
│   ├── structure-sprint1-actuel.puml # Structure Sprint 1
│   ├── connexion-sequence.puml       # Flow login
│   └── inscription-sequence.puml     # Flow signup
│
├── 🔧 GUIDES TECHNIQUES
│   ├── DEV-SETUP-GUIDE.md            # Setup local
│   ├── DOCKER-GUIDE.md               # Conteneurisation
│   ├── DATABASE-GUIDE.md             # MongoDB
│   └── GOOGLE_OAUTH_SETUP.md         # OAuth Google
│
├── 🚀 DÉPLOIEMENT
│   ├── DEPLOYMENT_SUCCESS.md         # Historique
│   ├── RAILWAY_MONITORING.md         # Monitoring
│   ├── VERCEL_RAILWAY_SETUP.md       # Setup Vercel+Railway
│   └── ROLLBACK_GUIDE.md             # Rollback
│
└── ✅ VALIDATION
    ├── ACCEPTANCE_CRITERIA_CHECKLIST.md
    ├── AW-9-VERIFICATION.md
    └── AW-12-CHECKLIST.md
```

---

## 🔍 RECHERCHE RAPIDE

### Je veux savoir...

**...où en est le projet ?**  
👉 [STATUT-PROJET.md](./STATUT-PROJET.md)

**...ce qu'il faut faire maintenant ?**  
👉 [SPRINT-2-GUIDE.md](./SPRINT-2-GUIDE.md)

**...toutes les fonctionnalités prévues ?**  
👉 [BACKLOG-COMPLET-USER-STORIES.md](./BACKLOG-COMPLET-USER-STORIES.md)

**...comment installer le projet ?**  
👉 [DEV-SETUP-GUIDE.md](./DEV-SETUP-GUIDE.md)

**...comment déployer ?**  
👉 [DEPLOYMENT_SUCCESS.md](./DEPLOYMENT_SUCCESS.md)

**...comment fonctionne l'authentification ?**  
👉 [connexion-sequence.puml](./connexion-sequence.puml)

**...la structure de la base de données ?**  
👉 [class-diagram.puml](./class-diagram.puml) + [DATABASE-GUIDE.md](./DATABASE-GUIDE.md)

**...tous les documents disponibles ?**  
👉 [INDEX.md](./INDEX.md)

---

## 🆘 BESOIN D'AIDE ?

### Problème d'Installation
1. Consultez [DEV-SETUP-GUIDE.md](./DEV-SETUP-GUIDE.md)
2. Vérifiez les versions Node.js, MongoDB
3. Lancez `npm install` dans backend ET frontend

### Erreur de Déploiement
1. Consultez [DEPLOYMENT_SUCCESS.md](./DEPLOYMENT_SUCCESS.md)
2. Vérifiez les variables d'environnement
3. Consultez [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md) si nécessaire

### Question sur une User Story
1. Cherchez dans [BACKLOG-COMPLET-USER-STORIES.md](./BACKLOG-COMPLET-USER-STORIES.md)
2. Consultez les critères d'acceptation
3. Vérifiez les dépendances entre US

### Besoin de la Vue d'Ensemble
👉 Allez directement à [INDEX.md](./INDEX.md)

---

## 📝 CONTRIBUER À LA DOCUMENTATION

### Ajouter un nouveau document
1. Créez le fichier dans le bon dossier
2. Ajoutez une référence dans [INDEX.md](./INDEX.md)
3. Suivez le format Markdown standard
4. Commit avec message clair : `docs: add guide pour XYZ`

### Mettre à jour un document existant
1. Modifiez le fichier
2. Mettez à jour la date en bas du document
3. Si changement majeur, ajoutez une note en haut
4. Commit : `docs: update XYZ with new info`

### Conventions de Nommage
- **Guides** : `*-GUIDE.md`
- **Plans** : `*-PLAN.md`, `ACTION-*.md`
- **Validation** : `*-CHECKLIST.md`, `*-VERIFICATION.md`
- **Diagrammes** : `*-diagram.puml`, `*-sequence.puml`

---

## 🎯 PROCHAINS DOCUMENTS À CRÉER

- [ ] API-DOCUMENTATION.md (Swagger complet)
- [ ] TESTING-STRATEGY.md (Stratégie tests)
- [ ] SECURITY-CHECKLIST.md (Checklist sécurité)
- [ ] PERFORMANCE-OPTIMIZATION.md (Optimisation perf)
- [ ] USER-MANUAL-ADMIN.md (Manuel admin)

---

## 📊 STATISTIQUES DOCUMENTATION

| Métrique | Valeur |
|----------|--------|
| **Nombre total de documents** | 50+ |
| **Guides techniques** | 15+ |
| **Diagrammes UML** | 4 |
| **Checklists validation** | 6 |
| **User Stories documentées** | 48 |
| **Dernière mise à jour** | 15 novembre 2025 |

---

## 🔗 LIENS EXTERNES UTILES

### Technologies
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Playwright Testing](https://playwright.dev/)

### Outils
- [PlantUML](https://plantuml.com/) - Diagrammes UML
- [Railway](https://railway.app/) - Hébergement backend
- [Vercel](https://vercel.com/) - Hébergement frontend
- [GitHub Actions](https://docs.github.com/actions) - CI/CD

---

**Dernière mise à jour :** 15 novembre 2025  
**Version documentation :** 2.0  
**Mainteneurs :** Équipe Agence Immobilière

---

💡 **Astuce :** Marquez cette page en favoris pour un accès rapide à toute la documentation !
