# 🚀 Guide de Configuration - Environnement de Développement

Ce guide vous permettra de configurer votre environnement de développement local en moins de 2 heures.

## 📋 Table des matières

- [Prérequis](#-prérequis)
- [Installation des outils](#-installation-des-outils)
- [Configuration du projet](#-configuration-du-projet)
- [Lancement de l'application](#-lancement-de-lapplication)
- [Tests](#-tests)
- [Troubleshooting](#-troubleshooting)
- [Ressources utiles](#-ressources-utiles)

## 🔧 Prérequis

### Système d'exploitation

- **macOS** : 10.15+ (Catalina ou plus récent)
- **Linux** : Ubuntu 20.04+, Debian 11+, ou équivalent
- **Windows** : Windows 10/11 avec WSL2 (recommandé) ou Git Bash

### Spécifications matérielles minimales

- **Processeur** : 4 cœurs (8 threads recommandé)
- **RAM** : 8 GB minimum (16 GB recommandé)
- **Disque** : 20 GB d'espace libre
- **Connexion Internet** : Requise pour télécharger les dépendances

## 📦 Installation des outils

### 1. Git (Contrôle de version)

#### macOS

```bash
# Via Homebrew
brew install git

# Vérifier l'installation
git --version
```

#### Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install git

# Vérifier l'installation
git --version
```

#### Windows

Télécharger depuis : https://git-scm.com/download/win

#### Configuration initiale :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# Vérifier la configuration
git config --list
```

### 2. Node.js et npm

**Version requise** : Node.js 20.x LTS

#### macOS

```bash
# Via Homebrew
brew install node@20

# Vérifier l'installation
node --version  # Doit afficher v20.x.x
npm --version   # Doit afficher 10.x.x
```

#### Linux

```bash
# Via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

#### Windows

Télécharger depuis : https://nodejs.org/en/download/

#### Configuration npm (optionnel mais recommandé) :

```bash
# Configurer le cache npm
npm config set cache ~/.npm

# Augmenter la limite de mémoire (si nécessaire)
export NODE_OPTIONS="--max-old-space-size=4096"
```

### 3. Stripe CLI (pour le développement local des webhooks)

Pour tester les webhooks Stripe (paiement en ligne) en local, installez le Stripe CLI :

- [Stripe CLI - Installation](https://stripe.com/docs/stripe-cli)

#### Commande à lancer pour recevoir les webhooks Stripe en local :

```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe


### 3. MongoDB (Base de données locale)

#### Option A : Installation native (recommandé pour macOS/Linux)

##### macOS

```bash
# Via Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Démarrer MongoDB comme service
brew services start mongodb-community@7.0

# Vérifier que MongoDB fonctionne
mongosh --eval "db.version()"
```

##### Linux (Ubuntu/Debian)

```bash
# Importer la clé publique MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Ajouter le dépôt MongoDB
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Installer MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Démarrer MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Vérifier
mongosh --eval "db.version()"
```

#### Option B : Docker (recommandé pour Windows et simple pour tous)

```bash
# Installer Docker Desktop depuis https://www.docker.com/products/docker-desktop

# Lancer MongoDB dans un conteneur
docker run -d \
  --name mongodb-dev \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=dev_password_123 \
  -v mongodb-data:/data/db \
  mongo:7.0

# Vérifier que MongoDB fonctionne
docker ps | grep mongodb-dev

# Se connecter à MongoDB
docker exec -it mongodb-dev mongosh -u admin -p dev_password_123
```

### 4. IDE / Éditeur de code

#### Visual Studio Code (recommandé)

**Installation :**

- **macOS** : `brew install --cask visual-studio-code`
- **Linux** : Télécharger depuis https://code.visualstudio.com/
- **Windows** : Télécharger depuis https://code.visualstudio.com/

**Extensions recommandées :**

```bash
# Installer via VS Code ou en ligne de commande
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension mongodb.mongodb-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-azuretools.vscode-docker
code --install-extension hashicorp.terraform
```

**Configuration VS Code** (`.vscode/settings.json`) :

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 5. Outils supplémentaires

#### MongoDB Compass (GUI pour MongoDB)

```bash
# macOS
brew install --cask mongodb-compass

# Ou télécharger depuis : https://www.mongodb.com/try/download/compass
```

#### Postman (pour tester les APIs)

```bash
# macOS
brew install --cask postman

# Ou télécharger depuis : https://www.postman.com/downloads/
```

#### Docker Desktop (optionnel mais recommandé)

Télécharger depuis : https://www.docker.com/products/docker-desktop

## 🔨 Configuration du projet

### 1. Cloner le dépôt

```bash
# Cloner le projet
git clone https://github.com/RaedRomdhane/agence-immobiliere-app.git
cd agence-immobiliere-app

# Vérifier la branche
git branch
git status
```

### 2. Configuration Backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement exemple
cp .env.example .env

# Éditer le fichier .env avec vos valeurs
nano .env  # ou code .env avec VS Code
```

**Fichier `.env` pour le développement local :**

```env
# Environnement
NODE_ENV=development

# Serveur
PORT=5000

# Base de données - Option 1 : MongoDB local sans auth
MONGODB_URI=mongodb://localhost:27017/agence-immobiliere-dev

# Base de données - Option 2 : MongoDB avec Docker
# MONGODB_URI=mongodb://admin:dev_password_123@localhost:27017/agence-immobiliere-dev?authSource=admin

# JWT
JWT_SECRET=dev_super_secret_key_change_in_production_123456789
JWT_EXPIRE=7d

# OAuth Google (à configurer plus tard)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Email (optionnel pour le dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# URLs
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

### 3. Configuration Frontend (Next.js)

```bash
# Retourner à la racine
cd ..

# Aller dans le dossier frontend
cd frontend

# Initialiser le projet Next.js
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Installer les dépendances supplémentaires
npm install axios jwt-decode lucide-react

# Copier le fichier d'environnement
cp .env.example .env.local
```

**Créer le fichier `.env.example` dans frontend :**

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Google Maps (à obtenir plus tard)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# OAuth Google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

**Fichier `.env.local` pour le développement :**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

### 4. Initialiser la base de données

```bash
# Depuis le dossier backend
cd backend

# Se connecter à MongoDB
mongosh

# Ou avec authentification (Docker)
mongosh -u admin -p dev_password_123 --authenticationDatabase admin
```

**Dans le shell MongoDB :**

```javascript
// Créer la base de données
use agence_immobiliere_dev

// Créer une collection test
db.users.insertOne({
  name: "Test User",
  email: "test@example.com",
  createdAt: new Date()
})

// Vérifier
db.users.find()

// Quitter
exit
```

### 5. Vérifier la connexion à la base de données

**Créer un script de test** dans `backend/src/config/database.js` :

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Options de connexion modernes
    });

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**Tester la connexion :**

```bash
# Dans backend/
node -e "require('dotenv').config(); require('./src/config/database')();"
```

## 🚀 Lancement de l'application

### Méthode 1 : Démarrage manuel (2 terminaux)

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

**Résultat attendu :**

```
🚀 Serveur démarré sur le port 5000
📍 Environment: development
🔗 URL: http://localhost:5000
✅ MongoDB connecté: localhost:27017
📊 Base de données: agence_immobiliere_dev
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

**Résultat attendu :**

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

### Méthode 2 : Docker Compose (recommandé)

**Créer `docker-compose.yml` à la racine :**

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: agence-mongodb-dev
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: dev_password_123
    volumes:
      - mongodb-data:/data/db
    networks:
      - agence-network

  backend:
    build: ./backend
    container_name: agence-backend-dev
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: development
      MONGODB_URI: mongodb://admin:dev_password_123@mongodb:27017/agence_immobiliere_dev?authSource=admin
      PORT: 5000
    depends_on:
      - mongodb
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - agence-network
    command: npm run dev

  frontend:
    build: ./frontend
    container_name: agence-frontend-dev
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000/api
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    networks:
      - agence-network
    command: npm run dev

volumes:
  mongodb-data:

networks:
  agence-network:
    driver: bridge
```

**Lancer avec Docker Compose :**

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## 🧪 Tests

### Backend

```bash
cd backend

# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Linting
npm run lint
```

### Frontend

```bash
cd frontend

# Tests unitaires
npm test

# Tests E2E (Cypress - à configurer plus tard)
npm run test:e2e
```

## ✅ Vérification de l'installation

### Checklist complète

- [ ] Git installé et configuré
- [ ] Node.js 20.x installé
- [ ] npm 10.x installé
- [ ] MongoDB fonctionne (port 27017)
- [ ] Projet cloné
- [ ] Backend : dépendances installées
- [ ] Backend : fichier .env configuré
- [ ] Backend : connexion DB réussie
- [ ] Backend : serveur démarre sur port 5000
- [ ] Frontend : dépendances installées
- [ ] Frontend : fichier .env.local configuré
- [ ] Frontend : app démarre sur port 3000
- [ ] Tests backend passent
- [ ] MongoDB Compass connecté (optionnel)
- [ ] Postman configuré (optionnel)
- [ ] VS Code avec extensions installé

### Test de bout en bout

```bash
# 1. Backend
curl http://localhost:5000/health
# Doit retourner: {"status":"OK","message":"API is running",...}

# 2. Frontend
curl http://localhost:3000
# Doit retourner du HTML

# 3. Base de données
mongosh --eval "db.version()"
# Doit afficher la version MongoDB
```

## 🐛 Troubleshooting

### Problème : MongoDB ne démarre pas

#### macOS :

```bash
# Vérifier le statut
brew services list | grep mongodb

# Redémarrer
brew services restart mongodb-community

# Voir les logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

#### Linux :

```bash
# Vérifier le statut
sudo systemctl status mongod

# Redémarrer
sudo systemctl restart mongod

# Voir les logs
sudo journalctl -u mongod -f
```

#### Docker :

```bash
# Vérifier les conteneurs
docker ps -a | grep mongodb

# Redémarrer
docker restart mongodb-dev

# Voir les logs
docker logs -f mongodb-dev
```

### Problème : Port 5000 ou 3000 déjà utilisé

```bash
# Trouver le processus qui utilise le port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Tuer le processus
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Ou changer le port dans .env
PORT=5001
```

### Problème : Erreur "Cannot find module"

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache npm
npm cache clean --force
```

### Problème : Erreur de connexion MongoDB

**Vérifier la chaîne de connexion dans `.env` :**

```bash
# Sans authentification
MONGODB_URI=mongodb://localhost:27017/agence-immobiliere-dev

# Avec authentification
MONGODB_URI=mongodb://admin:dev_password_123@localhost:27017/agence-immobiliere-dev?authSource=admin
```

**Tester la connexion :**

```bash
mongosh "mongodb://localhost:27017/agence-immobiliere-dev"
```

### Problème : Tests échouent

```bash
# Vérifier les variables d'environnement pour les tests
cat backend/.env

# Relancer les tests avec plus de détails
npm test -- --verbose

# Nettoyer et réinstaller
rm -rf node_modules coverage
npm install
npm test
```

## 📚 Ressources utiles

### Documentation officielle

- **Node.js** : https://nodejs.org/docs/
- **MongoDB** : https://docs.mongodb.com/
- **Express** : https://expressjs.com/
- **Next.js** : https://nextjs.org/docs
- **Jest** : https://jestjs.io/docs/getting-started

### Tutoriels et guides

- **MongoDB University** : https://university.mongodb.com/ (cours gratuits)
- **Node.js Best Practices** : https://github.com/goldbergyoni/nodebestpractices
- **Next.js Learn** : https://nextjs.org/learn

### Outils de développement

- **MongoDB Compass** : GUI pour MongoDB
- **Postman** : Tester les APIs
- **VS Code Extensions** : ESLint, Prettier, MongoDB
- **Git GUI** : GitKraken, SourceTree

## ⏱️ Temps estimé d'installation

| Étape | Temps |
|-------|-------|
| Installation des prérequis | 20-30 min |
| Clonage et configuration | 15-20 min |
| Installation des dépendances | 10-15 min |
| Configuration MongoDB | 10-15 min |
| Tests et vérification | 10-15 min |
| **TOTAL** | **65-95 min** |

Avec de l'expérience, vous pourrez réduire ce temps à moins de 30 minutes.

## 📞 Besoin d'aide ?

- **Slack** : #dev-support
- **Email** : dev-team@agence-immobiliere.com
- **Documentation** : https://docs.agence-immobiliere.com
- **Issues GitHub** : https://github.com/RaedRomdhane/agence-immobiliere-app/issues

---

**Dernière mise à jour** : Octobre 2025  
**Version** : 1.0.0  
**Responsable** : Équipe Dev
