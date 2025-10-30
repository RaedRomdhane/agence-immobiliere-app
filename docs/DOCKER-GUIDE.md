# 🐳 Guide Docker - Agence Immobilière

Ce guide explique comment utiliser Docker pour développer et déployer l'application.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Développement avec Docker](#développement-avec-docker)
- [Production avec Docker](#production-avec-docker)
- [Commandes utiles](#commandes-utiles)
- [Troubleshooting](#troubleshooting)

## 🔧 Prérequis

### Installer Docker

- **macOS/Windows** : [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux** : [Docker Engine](https://docs.docker.com/engine/install/)

Vérifier l'installation :

```bash
docker --version
docker-compose --version
```

## 🚀 Développement avec Docker

### Option 1 : Docker Compose (Recommandé)

Démarre tous les services (MongoDB, Backend, Frontend) ensemble :

```bash
# Démarrer tous les services en arrière-plan
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs en temps réel
docker-compose -f docker-compose.dev.yml logs -f

# Voir les logs d'un service spécifique
docker-compose -f docker-compose.dev.yml logs -f backend

# Arrêter tous les services
docker-compose -f docker-compose.dev.yml down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose -f docker-compose.dev.yml down -v
```

**URLs d'accès :**
- Frontend : http://localhost:3000
- Backend : http://localhost:5000
- MongoDB : mongodb://admin:dev_password_123@localhost:27017

### Option 2 : Conteneurs individuels

#### MongoDB seulement

```bash
docker run -d \
  --name mongodb-dev \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=dev_password_123 \
  -v mongodb-data:/data/db \
  mongo:7.0
```

#### Backend

```bash
# Construire l'image
cd backend
docker build -f Dockerfile.dev -t agence-backend:dev .

# Lancer le conteneur
docker run -d \
  --name agence-backend-dev \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://admin:dev_password_123@mongodb-dev:27017/agence_immobiliere_dev?authSource=admin \
  -e NODE_ENV=development \
  --link mongodb-dev \
  -v $(pwd):/app \
  -v /app/node_modules \
  agence-backend:dev
```

#### Frontend

```bash
# Construire l'image
cd frontend
docker build -f Dockerfile.dev -t agence-frontend:dev .

# Lancer le conteneur
docker run -d \
  --name agence-frontend-dev \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000/api \
  -v $(pwd):/app \
  -v /app/node_modules \
  -v /app/.next \
  agence-frontend:dev
```

## 🏭 Production avec Docker

### Construire les images de production

```bash
# Backend
cd backend
docker build -t agence-backend:latest -t agence-backend:1.0.0 .

# Frontend
cd frontend
docker build -t agence-frontend:latest -t agence-frontend:1.0.0 .
```

### Multi-stage builds

Les Dockerfiles de production utilisent des builds multi-étapes pour optimiser la taille :

- **Stage 1 (dependencies)** : Installation des dépendances
- **Stage 2 (build)** : Build de l'application
- **Stage 3 (production)** : Image finale légère avec seulement les fichiers nécessaires

**Avantages :**
- ✅ Images plus petites (~50% de réduction)
- ✅ Sécurité accrue (moins de packages)
- ✅ Builds plus rapides (cache des layers)

## 📝 Commandes utiles

### Gestion des conteneurs

```bash
# Lister les conteneurs en cours d'exécution
docker ps

# Lister tous les conteneurs (y compris arrêtés)
docker ps -a

# Arrêter un conteneur
docker stop <container-name>

# Démarrer un conteneur
docker start <container-name>

# Redémarrer un conteneur
docker restart <container-name>

# Supprimer un conteneur
docker rm <container-name>

# Supprimer un conteneur en cours d'exécution (force)
docker rm -f <container-name>
```

### Gestion des images

```bash
# Lister les images
docker images

# Supprimer une image
docker rmi <image-name>

# Supprimer les images non utilisées
docker image prune

# Supprimer toutes les images non utilisées
docker image prune -a
```

### Logs et debugging

```bash
# Voir les logs d'un conteneur
docker logs <container-name>

# Suivre les logs en temps réel
docker logs -f <container-name>

# Voir les 100 dernières lignes
docker logs --tail 100 <container-name>

# Exécuter une commande dans un conteneur
docker exec -it <container-name> sh

# Accéder au shell du conteneur
docker exec -it <container-name> /bin/sh
```

### Volumes

```bash
# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect <volume-name>

# Supprimer un volume
docker volume rm <volume-name>

# Supprimer les volumes non utilisés
docker volume prune
```

### Réseaux

```bash
# Lister les réseaux
docker network ls

# Inspecter un réseau
docker network inspect <network-name>

# Créer un réseau
docker network create <network-name>

# Supprimer un réseau
docker network rm <network-name>
```

### Nettoyage complet

```bash
# Supprimer tous les conteneurs arrêtés
docker container prune

# Supprimer toutes les images non utilisées
docker image prune -a

# Supprimer tous les volumes non utilisés
docker volume prune

# Supprimer tous les réseaux non utilisés
docker network prune

# Nettoyage complet du système
docker system prune -a --volumes
```

## 🐛 Troubleshooting

### Problème : Port déjà utilisé

```bash
# Trouver le processus qui utilise le port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Changer le port dans docker-compose.dev.yml
ports:
  - "5001:5000"  # Port hôte:Port conteneur
```

### Problème : Conteneur ne démarre pas

```bash
# Voir les logs pour identifier l'erreur
docker logs <container-name>

# Vérifier le statut
docker ps -a | grep <container-name>

# Redémarrer le conteneur
docker restart <container-name>
```

### Problème : MongoDB connection refused

```bash
# Vérifier que MongoDB est en cours d'exécution
docker ps | grep mongodb

# Vérifier les logs MongoDB
docker logs mongodb-dev

# Tester la connexion depuis le backend
docker exec -it agence-backend-dev sh
# Puis dans le conteneur :
ping mongodb
```

### Problème : Hot reload ne fonctionne pas

Pour le **backend** (nodemon), vérifier :
```bash
# Le volume est bien monté
docker inspect agence-backend-dev | grep Mounts -A 10

# nodemon est configuré dans package.json
"dev": "nodemon src/server.js"
```

Pour le **frontend** (Next.js), ajouter dans docker-compose.dev.yml :
```yaml
environment:
  WATCHPACK_POLLING: "true"
```

### Problème : Erreur "Cannot find module"

```bash
# Reconstruire l'image sans cache
docker-compose -f docker-compose.dev.yml build --no-cache

# Ou supprimer le volume node_modules
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Problème : Espace disque insuffisant

```bash
# Voir l'utilisation de l'espace
docker system df

# Nettoyer les ressources non utilisées
docker system prune -a --volumes

# Nettoyer spécifiquement les build caches
docker builder prune
```

## 📊 Bonnes pratiques

### Développement

- ✅ Utilisez `docker-compose.dev.yml` pour le développement
- ✅ Montez le code source en volume pour le hot reload
- ✅ Utilisez `.dockerignore` pour exclure les fichiers inutiles
- ✅ Activez les health checks
- ✅ Utilisez des tags de version explicites

### Production

- ✅ Utilisez les Dockerfiles multi-stage
- ✅ Minimisez la taille des images (Alpine Linux)
- ✅ Ne copiez que les fichiers nécessaires
- ✅ Utilisez un utilisateur non-root
- ✅ Configurez les health checks
- ✅ Définissez des limites de ressources
- ✅ Utilisez des secrets pour les données sensibles

### Sécurité

- ⚠️ Ne committez jamais les fichiers `.env`
- ⚠️ Changez les mots de passe par défaut en production
- ⚠️ Scannez les images pour les vulnérabilités
- ⚠️ Gardez Docker et les images à jour
- ⚠️ Limitez l'accès aux sockets Docker

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)

---

**Dernière mise à jour** : Octobre 2025  
**Version** : 1.0.0
