# AW-13 : Configuration Base de Données Staging - Checklist de Validation

**Date :** 30 Octobre 2025  
**Ticket :** AW-13  
**Responsable :** Équipe Dev

---

## 📋 Critères d'acceptation

### ✅ 1. La base de données est accessible depuis l'application en staging

- [ ] MongoDB est installé et démarré (local ou Atlas)
- [ ] La variable `MONGODB_URI` est correctement configurée dans `.env`
- [ ] La connexion MongoDB réussit au démarrage de l'application
- [ ] Les logs affichent "✅ MongoDB connecté avec succès!"
- [ ] Le host, database et port sont affichés correctement

**Tests de validation :**

```bash
# Test 1 : Démarrer le serveur
npm run dev

# Résultat attendu :
# ✅ MongoDB connecté avec succès!
# 📍 Host: localhost (ou cluster.mongodb.net)
# 📊 Database: agence-immobiliere-staging
# 🔌 Port: 27017

# Test 2 : Vérifier avec mongosh
mongosh "mongodb://localhost:27017/agence-immobiliere-staging"

# Résultat attendu : Connexion réussie
```

---

### ✅ 2. Le schéma initial est créé avec les tables utilisateurs

- [ ] Le modèle `User.js` est créé avec tous les champs requis
- [ ] La validation des champs fonctionne (email, password, etc.)
- [ ] Les index sont créés sur la collection `users`
- [ ] La migration `001_create_users_collection` existe et fonctionne
- [ ] La collection `users` est créée dans MongoDB

**Tests de validation :**

```bash
# Test 1 : Exécuter la migration
npm run db:migrate

# Résultat attendu : Migration 001 terminée avec succès

# Test 2 : Vérifier le statut
npm run db:migrate:status

# Résultat attendu : 
# [001] CreateUsersCollection
#    └─ ✅ Exécutée

# Test 3 : Vérifier dans MongoDB
mongosh "mongodb://localhost:27017/agence-immobiliere-staging"
> show collections
# Résultat attendu : users, migrations

> db.users.getIndexes()
# Résultat attendu : 5 index (email, role, createdAt, address.city, isActive+role)
```

---

### ✅ 3. Les identifiants de connexion sont stockés de manière sécurisée

- [ ] Les mots de passe sont hashés avec bcrypt (salt factor 10)
- [ ] Les mots de passe ne sont pas retournés dans les queries par défaut
- [ ] Les mots de passe sont exclus de la sérialisation JSON
- [ ] Les variables d'environnement sensibles sont dans `.env` (non committé)
- [ ] Un `.env.staging.example` existe avec des valeurs factices
- [ ] Le JWT_SECRET est fort et unique (32+ caractères)

**Tests de validation :**

```bash
# Test 1 : Vérifier que .env n'est pas tracké
git status

# Résultat attendu : .env ne doit PAS apparaître

# Test 2 : Créer un utilisateur et vérifier le hash
mongosh "mongodb://localhost:27017/agence-immobiliere-staging"
> db.users.findOne({ email: 'admin@agence-immobiliere.fr' })
# Résultat attendu : password commence par "$2a$10$" (bcrypt hash)

# Test 3 : Vérifier que le password n'est pas exposé
# Dans Node.js REPL ou script :
const User = require('./src/models/User');
const user = await User.findOne({ email: 'admin@agence-immobiliere.fr' });
console.log(user.password); // Résultat attendu : undefined

const userWithPassword = await User.findOne({ email: 'admin@agence-immobiliere.fr' }).select('+password');
console.log(userWithPassword.password); // Résultat attendu : hash bcrypt
```

---

### ✅ 4. Les migrations de base de données peuvent être exécutées

- [ ] Le script `npm run db:migrate` fonctionne
- [ ] Le script `npm run db:migrate:down` fonctionne (rollback)
- [ ] Le script `npm run db:migrate:status` fonctionne
- [ ] Les migrations sont suivies dans la collection `migrations`
- [ ] Les migrations peuvent être exécutées plusieurs fois sans erreur
- [ ] Le rollback restaure l'état précédent

**Tests de validation :**

```bash
# Test 1 : Migration complète
npm run db:migrate

# Résultat attendu : 
# ✅ Toutes les migrations sont terminées!

# Test 2 : Vérifier le statut
npm run db:migrate:status

# Résultat attendu :
# [001] CreateUsersCollection
#    └─ ✅ Exécutée

# Test 3 : Rollback
npm run db:migrate:down

# Résultat attendu :
# ✅ Rollback terminé avec succès!
# Collection users supprimée

# Test 4 : Vérifier que la collection n'existe plus
mongosh "mongodb://localhost:27017/agence-immobiliere-staging"
> show collections
# Résultat attendu : users ne doit PAS apparaître

# Test 5 : Re-migrer
npm run db:migrate

# Résultat attendu : Migration réussit à nouveau
```

---

### ✅ 5. Un jeu de données de test est disponible

- [ ] Le seeder `UserSeeder.js` existe et fonctionne
- [ ] Le script `npm run db:seed` fonctionne
- [ ] 10 utilisateurs sont créés (1 admin, 3 agents, 6 clients)
- [ ] Les utilisateurs ont des données réalistes (noms, emails, adresses françaises)
- [ ] Les mots de passe de test sont documentés
- [ ] Le script `npm run db:seed:clear` nettoie les données
- [ ] Le script `npm run db:seed:reseed` re-crée les données

**Tests de validation :**

```bash
# Test 1 : Seeding initial
npm run db:seed

# Résultat attendu :
# ✅ SEEDING TERMINÉ AVEC SUCCÈS
# Total: 10 utilisateurs
# Admins: 1, Agents: 3, Clients: 6

# Test 2 : Vérifier dans MongoDB
mongosh "mongodb://localhost:27017/agence-immobiliere-staging"
> db.users.countDocuments()
# Résultat attendu : 10

> db.users.countDocuments({ role: 'admin' })
# Résultat attendu : 1

> db.users.countDocuments({ role: 'agent' })
# Résultat attendu : 3

> db.users.countDocuments({ role: 'client' })
# Résultat attendu : 6

> db.users.findOne({ email: 'admin@agence-immobiliere.fr' })
# Résultat attendu : Document admin complet

# Test 3 : Nettoyer
npm run db:seed:clear

# Résultat attendu :
# ✅ 10 utilisateur(s) supprimé(s)

> db.users.countDocuments()
# Résultat attendu : 0

# Test 4 : Re-seed
npm run db:seed:reseed

# Résultat attendu :
# Nettoyage puis seeding réussi
# 10 utilisateurs créés
```

---

## 🧪 Tests de validation complets

### Test A : Setup complet from scratch

```bash
# 1. Nettoyer complètement
npm run db:seed:clear
npm run db:migrate:down

# 2. Setup complet
npm run db:setup

# 3. Vérifications
mongosh "mongodb://localhost:27017/agence-immobiliere-staging"
> show collections
# Attendu : users, migrations

> db.users.countDocuments()
# Attendu : 10

> db.migrations.countDocuments()
# Attendu : 1
```

### Test B : Test d'authentification avec un utilisateur seeded

```bash
# Démarrer le serveur
npm run dev

# Dans un autre terminal, tester avec curl ou Postman
# (Une fois les routes d'auth créées dans un prochain ticket)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@agence-immobiliere.fr",
    "password": "Admin123!"
  }'

# Résultat attendu : Token JWT + données utilisateur (sans password)
```

### Test C : Validation du modèle User

Créer un script de test `test-user-model.js` :

```javascript
require('dotenv').config();
const connectDB = require('./src/config/database');
const User = require('./src/models/User');

async function testUserModel() {
  await connectDB();

  // Test 1 : Créer un utilisateur valide
  const validUser = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'Test123!',
    role: 'client',
  });
  console.log('✅ Test 1 : Création utilisateur valide');

  // Test 2 : Vérifier que le password est hashé
  console.assert(validUser.password.startsWith('$2a$10$'), 'Password doit être hashé');
  console.log('✅ Test 2 : Password hashé avec bcrypt');

  // Test 3 : comparePassword
  const isMatch = await validUser.comparePassword('Test123!');
  console.assert(isMatch === true, 'comparePassword doit retourner true');
  console.log('✅ Test 3 : comparePassword fonctionne');

  // Test 4 : Email unique
  try {
    await User.create({
      firstName: 'Duplicate',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Test123!',
      role: 'client',
    });
    console.log('❌ Test 4 : Email unique - ÉCHOUÉ (devrait rejeter)');
  } catch (error) {
    console.log('✅ Test 4 : Email unique respecté');
  }

  // Test 5 : Méthodes statiques
  const foundUser = await User.findByEmail('test@example.com');
  console.assert(foundUser !== null, 'findByEmail doit trouver l\'utilisateur');
  console.log('✅ Test 5 : Méthodes statiques fonctionnent');

  // Test 6 : Propriétés virtuelles
  console.assert(validUser.fullName === 'Test User', 'fullName virtuel');
  console.log('✅ Test 6 : Propriétés virtuelles fonctionnent');

  // Nettoyage
  await User.deleteOne({ email: 'test@example.com' });
  console.log('\n✅ Tous les tests passent!');
  process.exit(0);
}

testUserModel().catch(error => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});
```

```bash
# Exécuter les tests
node test-user-model.js

# Résultat attendu : Tous les tests passent
```

---

## 📊 Métriques de succès

| Critère | Objectif | Méthode de mesure |
|---------|----------|-------------------|
| **Connexion DB** | 100% | Serveur démarre sans erreur |
| **Migrations** | 100% | Toutes les migrations s'exécutent |
| **Seeding** | 10 users | `db.users.countDocuments()` |
| **Sécurité** | Hash bcrypt | Vérification du hash password |
| **Index** | 5 index | `db.users.getIndexes().length` |
| **Rollback** | Fonctionne | Migration down réussie |

---

## 🎯 Validation finale

### Checklist complète

- [ ] **1.1** MongoDB accessible
- [ ] **1.2** Connexion au démarrage réussie
- [ ] **1.3** Logs de connexion affichés
- [ ] **2.1** Modèle User créé avec validation
- [ ] **2.2** Migration 001 exécutée
- [ ] **2.3** Collection users créée
- [ ] **2.4** 5 index créés
- [ ] **3.1** Passwords hashés avec bcrypt
- [ ] **3.2** .env non committé
- [ ] **3.3** JWT_SECRET fort configuré
- [ ] **3.4** Passwords exclus de JSON
- [ ] **4.1** `npm run db:migrate` fonctionne
- [ ] **4.2** `npm run db:migrate:down` fonctionne
- [ ] **4.3** `npm run db:migrate:status` fonctionne
- [ ] **4.4** Suivi dans collection migrations
- [ ] **5.1** UserSeeder créé
- [ ] **5.2** `npm run db:seed` crée 10 users
- [ ] **5.3** Statistiques correctes (1 admin, 3 agents, 6 clients)
- [ ] **5.4** `npm run db:seed:clear` nettoie
- [ ] **5.5** `npm run db:seed:reseed` fonctionne
- [ ] **5.6** Identifiants de test documentés

---

## ✅ Validation par l'équipe

| Critère | Validé | Validateur | Date | Notes |
|---------|--------|------------|------|-------|
| 1. DB accessible | ⬜ | | | |
| 2. Schéma créé | ⬜ | | | |
| 3. Sécurité | ⬜ | | | |
| 4. Migrations | ⬜ | | | |
| 5. Données test | ⬜ | | | |

---

## 📝 Notes

_Ajouter ici les observations, problèmes rencontrés et solutions._

---

**Statut :** 🟡 En attente de validation  
**Dernière mise à jour :** 30/10/2025
