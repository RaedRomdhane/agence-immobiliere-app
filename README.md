# 🏠 Agence Immobilière - Plateforme Web Moderne

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.x-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

## 📋 Description

Plateforme web moderne et intelligente pour la gestion et la promotion de biens immobiliers. Le site offre des fonctionnalités avancées telles que la recherche intelligente, la géolocalisation, la génération de QR Codes, et un chatbot IA.

---

## ✨ Fonctionnalités principales

- 🔍 **Recherche avancée** avec filtres multi-critères
- 🗺️ **Carte interactive** avec géolocalisation
- 🤖 **Chatbot IA** pour assistance instantanée
- 📱 **QR Codes** uniques pour chaque bien
- 🔔 **Alertes personnalisées** par email/SMS
- 📊 **Dashboard analytique** pour les admins
- 💬 **Messagerie interne** sécurisée
- 📅 **Système de rendez-vous** intégré

---

## 🛠️ Stack Technique

### Frontend
- **Framework:** Next.js 14
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit / Zustand

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **API:** RESTful + GraphQL (optionnel)
- **Authentication:** JWT + OAuth2 (Google)

### Base de données
- **Database:** MongoDB 7.0
- **ODM:** Mongoose
- **Cache:** Redis

### DevOps & Infrastructure
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions
- **Cloud:** AWS / Azure / GCP
- **Monitoring:** Prometheus + Grafana

### Tests
- **Unit Tests:** Jest
- **E2E Tests:** Cypress
- **API Tests:** Supertest
- **Load Tests:** k6

---

## � Déploiement

### 🌐 Environnement Staging

L'application dispose d'un déploiement automatique en **staging** via **GitHub Actions** :

- **Frontend (Vercel):** `https://[votre-app]-staging.vercel.app`
- **Backend (Railway):** `https://[votre-app]-staging.railway.app`
- **Base de données:** MongoDB Atlas (M0 Free Tier)

#### Déploiement automatique
- ✅ Déclenché automatiquement après un **merge sur main**
- ✅ Tests automatiques (lint, unit tests, build)
- ✅ Health checks et smoke tests
- ✅ Rollback automatique en cas d'échec

#### Guides de déploiement
- 📘 **[Guide de configuration staging](docs/STAGING_SETUP_GUIDE.md)** - Configuration complète MongoDB Atlas, Railway, Vercel et GitHub Secrets
- 📕 **[Guide de rollback](docs/ROLLBACK_GUIDE.md)** - Procédures de rollback automatique et manuel
- 📗 **[Plan de déploiement AW-21](docs/AW-21-DEPLOYMENT-PLAN.md)** - Architecture et stratégie de déploiement

#### Variables d'environnement

**Backend (Railway):**
```bash
NODE_ENV=staging
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=https://[votre-app]-staging.vercel.app
```

**Frontend (Vercel):**
```bash
NEXT_PUBLIC_API_URL=https://[votre-app]-staging.railway.app/api
NEXT_PUBLIC_APP_NAME=Agence Immobilière (Staging)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

#### Workflow CI/CD

Le pipeline GitHub Actions exécute :
1. **Test** - Lint, tests unitaires, build
2. **Deploy Backend** - Déploiement Railway + health check
3. **Deploy Frontend** - Déploiement Vercel
4. **Smoke Test** - Validation des endpoints critiques
5. **Rollback** - Retour automatique à la version précédente si échec

Voir [`.github/workflows/staging-deploy.yml`](.github/workflows/staging-deploy.yml) pour plus de détails.

---

## �📁 Structure du projet

```
agence-immobiliere-app/
├── frontend/               # Application Next.js
│   ├── src/
│   │   ├── app/           # App Router (Next.js 14)
│   │   ├── components/    # Composants réutilisables
│   │   ├── lib/           # Utilitaires et helpers
│   │   └── styles/        # Styles globaux
│   ├── public/            # Assets statiques
│   └── package.json
│
├── backend/               # API Node.js + Express
│   ├── src/
│   │   ├── controllers/   # Contrôleurs
│   │   ├── models/        # Modèles Mongoose
│   │   ├── routes/        # Routes API
│   │   ├── middlewares/   # Middlewares
│   │   ├── services/      # Logique métier
│   │   └── utils/         # Utilitaires
│   ├── tests/             # Tests unitaires et d'intégration
│   └── package.json
│
├── infrastructure/        # Infrastructure as Code
│   ├── terraform/         # Scripts Terraform
│   ├── kubernetes/        # Manifests K8s
│   └── docker/            # Dockerfiles
│
├── docs/                  # Documentation
│   ├── BRANCHING_STRATEGY.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── .github/
│   └── workflows/         # GitHub Actions
│
├── docker-compose.yml     # Environnement de dev local
├── .gitignore
└── README.md
```

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js >= 20.x
- npm >= 10.x ou yarn >= 1.22
- Docker >= 24.x
- MongoDB >= 7.0 (ou Docker)
- Git >= 2.40

### Installation

#### 1. Cloner le dépôt

```bash
git clone https://github.com/RaedRomdhane/agence-immobiliere-app.git
cd agence-immobiliere-app
```

#### 2. Installer les dépendances Frontend

```bash
cd frontend
npm install
```

#### 3. Installer les dépendances Backend

```bash
cd ../backend
npm install
```

#### 4. Configurer les variables d'environnement

**Frontend (`.env.local`):**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

**Backend (`.env`):**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agence-immobiliere
JWT_SECRET=your_super_secret_key_change_in_production
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

#### 5. Démarrer avec Docker (recommandé)

```bash
# Depuis la racine du projet
docker-compose up -d
```

#### 6. Démarrer en mode développement (sans Docker)

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### 🌐 Accès aux services

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Backend Health Check:** http://localhost:5000/health
- **MongoDB:** localhost:27017

---

## 📚 Documentation pour les développeurs

Pour configurer votre environnement de développement complet, consultez nos guides détaillés :

### 📖 Guides disponibles

- 👉 **[Guide de Configuration Développeur](./docs/DEV-SETUP-GUIDE.md)** - Setup complet en < 2h
- 🐳 **[Guide Docker](./docs/DOCKER-GUIDE.md)** - Configuration Docker pour dev et prod
- ✅ **[Checklist de Validation](./docs/AW-12-CHECKLIST.md)** - Critères d'acceptation et tests
- 📊 **[Rapport de Complétion](./docs/AW-12-COMPLETION-REPORT.md)** - Documentation du projet

### ⚡ Démarrage ultra-rapide

Si vous êtes pressé, voici la version condensée :

```bash
# 1. Cloner et installer
git clone https://github.com/RaedRomdhane/agence-immobiliere-app.git
cd agence-immobiliere-app
cd backend && npm install && cd ..

# 2. Configurer les variables d'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos paramètres (MONGODB_URI, JWT_SECRET, etc.)

# 3. Démarrer MongoDB
# Option A: Local (macOS)
brew services start mongodb-community

# Option B: Local (Linux)
sudo systemctl start mongod

# Option C: Docker (Recommandé - toutes plateformes)
docker-compose -f docker-compose.dev.yml up -d

# 4. Lancer l'application backend
cd backend && npm run dev

# 5. Vérifier que tout fonctionne
# Linux/macOS/WSL
chmod +x scripts/verify-setup.sh
./scripts/verify-setup.sh

# Windows PowerShell
.\scripts\verify-setup.ps1
```

### 🔍 Script de vérification

Utilisez notre script automatique pour vérifier votre environnement :

**Linux/macOS/WSL :**
```bash
./scripts/verify-setup.sh
```

**Windows PowerShell :**
```powershell
.\scripts\verify-setup.ps1
```

Le script vérifie :
- ✅ Installation de Git, Node.js, npm, MongoDB, Docker
- ✅ Structure du projet
- ✅ Configuration des fichiers .env
- ✅ Dépendances installées
- ✅ Connectivité aux services

### 🐳 Démarrage avec Docker (Recommandé)

La méthode la plus simple pour démarrer tous les services :

```bash
# Démarrer tous les services (MongoDB + Backend + Frontend)
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f

# Vérifier l'état des services
docker-compose -f docker-compose.dev.yml ps

# Arrêter tous les services
docker-compose -f docker-compose.dev.yml down
```

### ⏱️ Temps de setup estimé

| Expérience | Temps estimé |
|------------|--------------|
| Premier setup (débutant) | 65-95 minutes |
| Setup avec expérience | 20-30 minutes |
| Setup avec Docker uniquement | 10-15 minutes |

### 🆘 Besoin d'aide ?

Consultez notre section troubleshooting dans :
- [Guide de Setup](./docs/DEV-SETUP-GUIDE.md#troubleshooting)
- [Guide Docker](./docs/DOCKER-GUIDE.md#dépannage)

---

## 🧪 Exécuter les tests

### Tests unitaires

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Tests avec couverture

```bash
npm run test:coverage
```

### Tests E2E

```bash
npm run test:e2e
```

---

## 📖 Documentation

- [📋 Stratégie de branchement (GitHub Flow)](docs/BRANCHING_STRATEGY.md)
- [📡 Documentation API](docs/API.md)
- [🚀 Guide de déploiement](docs/DEPLOYMENT.md)
- [🎯 Déploiement Automatique Staging](docs/STAGING_DEPLOYMENT.md) - **NEW! AW-21**
- [⚙️ Configuration Azure pour Staging](docs/AZURE_SETUP.md) - Guide de setup Azure
- [📝 Cahier des charges complet](docs/SPECIFICATIONS.md)

---

## 🤝 Contribution

Nous suivons le workflow **GitHub Flow**. Veuillez lire notre [guide de contribution](docs/BRANCHING_STRATEGY.md) avant de soumettre une Pull Request.

### Processus de contribution

1. **Créer une branche depuis `main`**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/[JIRA-ID]-description
   ```

2. **Faire vos modifications et commiter**
   ```bash
   git add .
   git commit -m "[JIRA-ID]: Description du changement"
   ```

3. **Pousser et créer une Pull Request**
   ```bash
   git push origin feature/[JIRA-ID]-description
   ```

4. **Attendre la code review et l'approbation** ✅

---

## 📊 Roadmap

### Sprint 1 (En cours)
- [x] Configuration du dépôt Git et stratégie de branchement
- [ ] Pipeline CI/CD de base
- [ ] Infrastructure as Code (Terraform)
- [ ] Configuration environnement de développement

### Sprint 2
- [ ] API Backend fondamentales (CRUD)
- [ ] Pages d'inscription et authentification
- [ ] Dashboard utilisateur et admin

### Sprint 3
- [ ] Déploiement automatique en staging
- [ ] Tests E2E automatisés
- [ ] Monitoring et surveillance

### Sprint 4+
- [ ] Feature flags
- [ ] Déploiement production avec rollback
- [ ] Optimisation des performances

---

## 👥 Équipe

- **Product Owner:** [Nom]
- **Scrum Master:** [Nom]
- **Développeurs:** [Noms]
- **DevOps Engineer:** [Nom]

---

## 📝 License

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📧 Contact

Pour toute question ou suggestion :

- **Email:** contact@agence-immobiliere.com
- **Jira:** [Lien vers le projet Jira](https://votre-instance.atlassian.net)
- **GitHub:** [Issues](https://github.com/RaedRomdhane/agence-immobiliere-app/issues)

---

**Dernière mise à jour:** Octobre 2025  
**Version:** 1.0.0
