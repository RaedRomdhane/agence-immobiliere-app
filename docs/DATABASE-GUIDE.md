# Configuration Base de Données Staging - Guide Complet

## 📋 Vue d'ensemble

Ce guide explique comment configurer, migrer et alimenter la base de données MongoDB pour l'environnement de staging de l'agence immobilière.

---

## 🎯 Objectifs

- ✅ Configurer MongoDB pour le staging
- ✅ Créer le schéma de la base de données (collection users)
- ✅ Exécuter les migrations
- ✅ Alimenter avec des données de test
- ✅ Sécuriser les identifiants de connexion

---

## 📁 Structure des fichiers

```
backend/
├── src/
│   ├── models/
│   │   ├── User.js              # Modèle Mongoose pour les utilisateurs
│   │   └── index.js             # Export centralisé des modèles
│   ├── database/
│   │   ├── Migration.js         # Classe de base pour les migrations
│   │   ├── MigrationRunner.js   # Gestionnaire de migrations
│   │   ├── SeederRunner.js      # Gestionnaire de seeding
│   │   ├── migrations/
│   │   │   └── 001_create_users_collection.js
│   │   └── seeders/
│   │       └── UserSeeder.js    # Seeder pour les utilisateurs
│   └── config/
│       └── database.js          # Configuration MongoDB
├── scripts/
│   ├── migrate.js               # Script CLI pour migrations
│   └── seed.js                  # Script CLI pour seeding
└── .env.staging.example         # Variables d'environnement staging

```

---

## 🗄️ Modèle de données : User

### Schéma utilisateur

```javascript
{
  // Informations de base
  firstName: String (requis, 2-50 caractères)
  lastName: String (requis, 2-50 caractères)
  email: String (requis, unique, format email)
  password: String (requis, min 6 caractères, hashé avec bcrypt)
  
  // Contact
  phone: String (format français)
  address: {
    street: String
    city: String
    postalCode: String
    country: String (défaut: 'France')
  }
  
  // Rôle et permissions
  role: String (enum: 'client', 'agent', 'admin')
  
  // Statut
  isActive: Boolean (défaut: true)
  isEmailVerified: Boolean (défaut: false)
  
  // Tokens
  emailVerificationToken: String
  resetPasswordToken: String
  
  // OAuth
  googleId: String
  avatar: String
  
  // Métadonnées
  lastLogin: Date
  loginAttempts: Number
  lockUntil: Date
  
  // Timestamps automatiques
  createdAt: Date
  updatedAt: Date
}
```

### Index créés

- `email` (unique, case-insensitive)
- `role`
- `createdAt` (descendant)
- `address.city`
- `isActive + role` (composé)

### Méthodes disponibles

**Méthodes d'instance :**
- `comparePassword(candidatePassword)` - Vérifier un mot de passe
- `incLoginAttempts()` - Incrémenter tentatives échouées
- `resetLoginAttempts()` - Réinitialiser après succès
- `hasRole(role)` - Vérifier un rôle spécifique
- `hasAnyRole(roles)` - Vérifier plusieurs rôles

**Méthodes statiques :**
- `User.findByEmail(email)` - Trouver par email
- `User.findActiveAgents()` - Liste des agents actifs
- `User.getStats()` - Statistiques des utilisateurs

**Propriétés virtuelles :**
- `fullName` - Prénom + Nom
- `isLocked` - Compte verrouillé ?

---

## 🚀 Configuration initiale

### 1. Prérequis

- Node.js 20+ installé
- MongoDB 7.0+ installé localement OU compte MongoDB Atlas
- Variables d'environnement configurées

### 2. Configuration MongoDB

#### Option A : MongoDB Local

```bash
# Démarrer MongoDB
mongod --dbpath /path/to/data

# Vérifier que MongoDB fonctionne
mongosh
```

#### Option B : MongoDB Atlas (Recommandé pour staging)

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un nouveau cluster
3. Configurer les accès réseau (IP Whitelist)
4. Créer un utilisateur de base de données
5. Obtenir la chaîne de connexion

### 3. Variables d'environnement

Créer un fichier `.env` dans `backend/` :

```bash
# Copier le template staging
cp .env.staging.example .env

# Éditer et remplir les valeurs réelles
nano .env
```

**Variables essentielles :**

```bash
NODE_ENV=staging
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/agence-immobiliere-staging
JWT_SECRET=<générer_une_clé_forte>
```

**Générer un JWT_SECRET fort :**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📦 Installation

```bash
cd backend

# Installer les dépendances (si pas déjà fait)
npm install
```

---

## 🔄 Exécution des migrations

### Commandes disponibles

```bash
# Exécuter toutes les migrations en attente
npm run db:migrate

# Voir le statut des migrations
npm run db:migrate:status

# Annuler la dernière migration (rollback)
npm run db:migrate:down
```

### Exemple de sortie

```
========================================
🔄 Démarrage des migrations...
========================================

📋 1 migration(s) en attente:

   - [001] CreateUsersCollection

▶️  Exécution: [001] CreateUsersCollection
----------------------------------------
[Migration 001] Création de la collection users...
[Migration 001] Collection users créée avec succès
[Migration 001] Création des index...
[Migration 001] ✅ Index créé: email (unique)
[Migration 001] ✅ Index créé: role
[Migration 001] ✅ Index créé: createdAt
[Migration 001] ✅ Index créé: address.city
[Migration 001] ✅ Index créé: isActive + role (composé)
[Migration 001] ✅ Migration 001 terminée avec succès!
✅ Migration 001 terminée

========================================
✅ Toutes les migrations sont terminées!
========================================
```

---

## 🌱 Seeding (Données de test)

### Commandes disponibles

```bash
# Insérer les données de test
npm run db:seed

# Nettoyer toutes les données
npm run db:seed:clear

# Re-seed (nettoyer puis réinsérer)
npm run db:seed:reseed

# Setup complet (migration + seed)
npm run db:setup
```

### Données de test créées

Le seeder crée **10 utilisateurs** :

| Rôle    | Nombre | Emails                                  |
|---------|--------|-----------------------------------------|
| Admin   | 1      | admin@agence-immobiliere.fr             |
| Agent   | 3      | jean.dupont@..., marie.martin@..., pierre.dubois@... |
| Client  | 6      | sophie.bernard@..., thomas.petit@..., etc. |

**Mot de passe par défaut pour tous :**
- Admin: `Admin123!`
- Agent: `Agent123!`
- Client: `Client123!`

### Exemple de sortie

```
╔════════════════════════════════════════╗
║   🌱 SEEDING BASE DE DONNÉES          ║
╚════════════════════════════════════════╝

▶️  Exécution: UserSeeder
──────────────────────────────────────────

🌱 Seeding users...
========================================

📝 Insertion de 10 utilisateurs...

✅ Utilisateurs créés avec succès!

========================================
📊 Résumé:
========================================
Total: 10 utilisateurs
Actifs: 9 utilisateurs

Par rôle:
  - Admins: 1
  - Agents: 3
  - Clients: 6
========================================

🔑 Identifiants de test:
========================================
👤 Admin:
   Email: admin@agence-immobiliere.fr
   Password: Admin123!

👤 Agent (Jean Dupont):
   Email: jean.dupont@agence-immobiliere.fr
   Password: Agent123!

👤 Client (Sophie Bernard):
   Email: sophie.bernard@example.com
   Password: Client123!
========================================

╔════════════════════════════════════════╗
║   ✅ SEEDING TERMINÉ AVEC SUCCÈS      ║
╚════════════════════════════════════════╝
⏱️  Durée totale: 1.23s
```

---

## 🔒 Sécurité

### Bonnes pratiques

1. **Jamais committer les credentials**
   - `.env` est dans `.gitignore`
   - Utiliser `.env.example` comme template

2. **Utiliser des secrets forts**
   ```bash
   # Générer JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Générer SESSION_SECRET
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **MongoDB Atlas : Configuration sécurisée**
   - Activer l'authentification par nom d'utilisateur/mot de passe
   - Configurer IP Whitelist (limiter les accès)
   - Utiliser des rôles MongoDB appropriés (readWrite, pas root)
   - Activer l'audit logging

4. **Environnement staging**
   - Utiliser HTTPS
   - Limiter les accès par IP
   - Activer les logs détaillés
   - Sauvegarder régulièrement

5. **Mots de passe**
   - Tous les mots de passe sont hashés avec bcrypt (salt factor 10)
   - Jamais stockés en clair
   - Comparaison avec `user.comparePassword()`

---

## 🧪 Vérification

### 1. Vérifier la connexion MongoDB

```bash
# Démarrer le serveur
npm run dev

# Vous devriez voir :
✅ MongoDB connecté avec succès!
📍 Host: cluster0.mongodb.net
📊 Database: agence-immobiliere-staging
```

### 2. Vérifier les collections

```bash
# Se connecter avec mongosh
mongosh "mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/agence-immobiliere-staging"

# Lister les collections
show collections
# Résultat attendu: users, migrations

# Compter les users
db.users.countDocuments()
# Résultat attendu: 10

# Voir les index
db.users.getIndexes()
```

### 3. Tester un utilisateur

```javascript
// Trouver un utilisateur
db.users.findOne({ email: 'admin@agence-immobiliere.fr' })

// Vérifier les rôles
db.users.find({ role: 'agent' }).count()
```

---

## 🐛 Dépannage

### Erreur : "MONGODB_URI non défini"

**Solution :**
```bash
# Vérifier que .env existe
ls -la backend/.env

# Vérifier le contenu
cat backend/.env | grep MONGODB_URI

# Si absent, copier depuis l'example
cp .env.staging.example .env
```

### Erreur : "MongoServerError: User already exists"

**Cause :** Tentative de re-seed sans nettoyer

**Solution :**
```bash
# Re-seed proprement
npm run db:seed:reseed
```

### Erreur : "Connection refused"

**Cause :** MongoDB n'est pas démarré

**Solution :**
```bash
# MongoDB local
mongod --dbpath /path/to/data

# OU vérifier que MongoDB Atlas est accessible
```

### Erreur : "Authentication failed"

**Cause :** Mauvais credentials MongoDB

**Solution :**
- Vérifier MONGODB_URI dans `.env`
- Vérifier que l'utilisateur existe dans MongoDB
- Vérifier que l'IP est whitelistée (MongoDB Atlas)

---

## 📚 Ressources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

## 🎯 Prochaines étapes

Après avoir configuré la base de données :

1. ✅ Créer les routes d'authentification (login, register)
2. ✅ Implémenter les middlewares JWT
3. ✅ Créer les contrôleurs utilisateurs
4. ✅ Tester les endpoints avec Postman/Thunder Client
5. ✅ Documenter l'API avec Swagger

---

## 📝 Notes de version

- **Version 1.0.0** (30/10/2025)
  - Migration initiale : création collection users
  - Seeder : 10 utilisateurs de test
  - Modèle User complet avec validation
  - Scripts CLI pour migrations et seeding

---

**Auteur :** Équipe Dev Agence Immobilière  
**Date :** 30 Octobre 2025  
**Ticket :** AW-13 - Configuration Base de Données Staging
