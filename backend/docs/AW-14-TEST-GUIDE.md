# AW-14 : Suite de Tests Unitaires - Guide Complet

## 📋 Vue d'ensemble

Ce guide documente la suite de tests unitaires mise en place pour l'application Agence Immobilière. L'objectif était d'atteindre **50% minimum de couverture de code** sur l'ensemble de la base de code testable.

## ✅ Résultats Obtenus

### Couverture de Code
- **Statements** : 94.11% ✅ (objectif : 50%)
- **Branches** : 78.57% ✅ (objectif : 50%)
- **Functions** : 100% ✅ (objectif : 50%)
- **Lines** : 94.11% ✅ (objectif : 50%)

### Statistiques des Tests
- **Total des suites** : 3 suites de tests
- **Total des tests** : 53 tests
- **Tests réussis** : 53/53 (100%)
- **Temps d'exécution** : ~5-6 secondes

## 🔧 Configuration Technique

### Framework de Tests
- **Jest** v29.7.0
- **mongodb-memory-server** : Pour les tests d'intégration avec base de données en mémoire
- **Supertest** : Pour les tests d'API REST

### Configuration Jest (`package.json`)

```json
{
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/server.js",
      "!src/app.js",
      "!src/config/**",
      "!src/database/**"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 50,
        "functions": 50,
        "lines": 50,
        "statements": 50
      }
    },
    "testMatch": ["**/tests/**/*.test.js"],
    "testTimeout": 10000,
    "coverageReporters": ["text", "text-summary", "html", "lcov", "json"]
  }
}
```

### Fichiers Exclus de la Couverture

Pour des raisons de complexité et de dépendances externes, certains fichiers sont exclus :

- `src/server.js` : Point d'entrée de l'application
- `src/app.js` : Configuration Express de base
- `src/config/**` : Configuration (database.js, env.js)
- `src/database/**` : Migrations et seeders

Ces fichiers seront testés via des tests d'intégration ou E2E ultérieurement.

## 📁 Structure des Tests

```
backend/tests/
├── unit/
│   ├── sample.test.js           # Tests de base de l'API (9 tests)
│   └── models/
│       ├── User.test.js         # Tests du modèle User (41 tests)
│       └── index.test.js        # Tests de l'index des modèles (3 tests)
└── integration/                 # (À venir)
```

## 📝 Détails des Suites de Tests

### 1. Tests du Modèle User (`tests/unit/models/User.test.js`)

**41 tests** couvrant toutes les fonctionnalités du modèle User :

#### Création d'utilisateur (3 tests)
- Création avec tous les champs
- Création avec champs minimum requis
- Création d'un admin

#### Validation des champs (12 tests)
- Validation des champs requis (prénom, nom, email, password)
- Format d'email
- Longueur minimum (prénom, password)
- Validation du rôle (admin/client)
- Unicité de l'email
- Format du téléphone français (+33 ou 0)

#### Hash du mot de passe (2 tests)
- Hachage bcrypt automatique avant sauvegarde
- Pas de re-hachage si le mot de passe n'est pas modifié

#### Méthodes d'instance (11 tests)
- `comparePassword()` : Comparaison de mots de passe
- `hasRole()` : Vérification du rôle
- `hasAnyRole()` : Vérification multiple de rôles
- `isAgent()` : Vérification si admin (droits agent)
- `isAdmin()` : Vérification si admin
- `incLoginAttempts()` : Incrémentation des tentatives de connexion
- Verrouillage automatique après 5 tentatives
- `resetLoginAttempts()` : Réinitialisation des tentatives

#### Propriétés virtuelles (2 tests)
- `fullName` : Concaténation prénom + nom
- `isLocked` : Statut de verrouillage du compte

#### Méthodes statiques (5 tests)
- `findByEmail()` : Recherche insensible à la casse
- `findActiveAgents()` : Liste des admins actifs
- `getStats()` : Statistiques des utilisateurs

#### Sérialisation JSON (2 tests)
- Exclusion du mot de passe
- Inclusion des propriétés virtuelles

#### Timestamps (2 tests)
- Présence de createdAt et updatedAt
- Mise à jour automatique de updatedAt

#### Configuration des tests
```javascript
// Setup MongoDB Memory Server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

// Cleanup après chaque test
afterEach(async () => {
  await User.deleteMany({});
});

// Fermeture propre
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

### 2. Tests de l'Index des Modèles (`tests/unit/models/index.test.js`)

**3 tests** vérifiant l'export correct des modèles :

- Export du modèle User
- Structure de l'objet d'export
- Validation Mongoose du modèle

### 3. Tests de Base de l'API (`tests/unit/sample.test.js`)

**9 tests** vérifiant la configuration de base d'Express :

- Route GET /
- Route GET /health (avec timestamp valide)
- Gestion 404
- Headers de sécurité (Helmet)
- Configuration CORS
- Content-Type JSON
- Parsing du body (JSON et URL-encoded)

## 🚀 Commandes de Test

### Exécuter tous les tests avec couverture
```bash
npm test
```

### Exécuter un fichier de test spécifique
```bash
npm test -- User.test.js
```

### Exécuter en mode watch (développement)
```bash
npm test -- --watch
```

### Exécuter sans affichage verbeux
```bash
npm test -- --silent
```

### Générer uniquement le rapport de couverture
```bash
npm test -- --coverage --silent
```

## 📊 Rapports de Couverture

### Formats Disponibles

1. **Console (text)** : Affichage dans le terminal
2. **HTML** : Rapport interactif dans `coverage/index.html`
3. **LCOV** : Format pour les CI/CD (SonarQube, CodeCov)
4. **JSON** : Format machine-readable

### Consulter le Rapport HTML

```bash
# Ouvrir le rapport de couverture
start coverage/index.html  # Windows
open coverage/index.html   # Mac
xdg-open coverage/index.html  # Linux
```

## 🔍 Détails de Couverture par Fichier

| Fichier | Statements | Branches | Functions | Lines | Lignes non couvertes |
|---------|-----------|----------|-----------|-------|---------------------|
| **User.js** | 93.93% | 78.57% | 100% | 93.93% | 156, 165, 180, 191 |
| **index.js** | 100% | 100% | 100% | 100% | - |

### Lignes Non Couvertes dans User.js

Les 4 lignes non couvertes (156, 165, 180, 191) sont des cas d'erreur edge cases difficiles à reproduire :

- **Ligne 156** : Erreur lors de la comparaison bcrypt (cas rare)
- **Ligne 165** : Erreur lors de l'incrémentation des tentatives
- **Ligne 180** : Cas d'erreur sur les stats avec comptes verrouillés
- **Ligne 191** : Erreur générique dans getStats

Ces cas nécessiteraient des mocks avancés de Mongoose/bcrypt pour être testés.

## ✨ Bonnes Pratiques Appliquées

### 1. Isolation des Tests
- Chaque test est indépendant
- `afterEach` nettoie la base de données entre les tests
- Pas d'état partagé entre les tests

### 2. Nommage Descriptif
- Noms de tests en français, descriptifs
- Structure `describe` > `it` claire
- Commentaires pour les cas complexes

### 3. Tests Complets
- Cas positifs et négatifs
- Cas limites (edge cases)
- Validation des erreurs

### 4. Performance
- Utilisation de MongoDB Memory Server (rapide)
- Tests exécutés en < 6 secondes
- Timeout configuré à 10 secondes

### 5. Maintenabilité
- Tests organisés par fonctionnalité
- Helper functions réutilisables
- Constants pour les données de test

## 🔄 Intégration Continue

### Configuration Recommandée

Pour GitHub Actions, GitLab CI, etc. :

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd backend && npm ci
      - run: cd backend && npm test
      - uses: codecov/codecov-action@v3
        with:
          directory: backend/coverage
```

## 📈 Prochaines Étapes

### Tests à Ajouter

1. **Tests d'Intégration** :
   - Routes API complètes
   - Authentification JWT
   - Middleware de validation
   - Gestion des erreurs

2. **Tests E2E** :
   - Scénarios utilisateur complets
   - Tests de workflow métier

3. **Tests de Performance** :
   - Load testing
   - Stress testing

4. **Autres Modèles** (quand créés) :
   - Property (Propriété)
   - Transaction
   - Message
   - etc.

### Améliorations Potentielles

- Augmenter la couverture des branches à 90%+
- Ajouter des tests de mutation (Stryker)
- Mettre en place des snapshots Jest
- Ajouter des tests de sécurité

## 🐛 Troubleshooting

### Problème : Tests Timeout

**Solution** : Augmenter le timeout dans `package.json`
```json
"testTimeout": 20000
```

### Problème : Connexion MongoDB échoue

**Vérifier** :
1. mongodb-memory-server est installé
2. Pas de connexion MongoDB réelle dans les tests
3. `afterAll` ferme correctement les connexions

### Problème : Couverture ne se met pas à jour

**Solution** :
```bash
# Supprimer le cache Jest
rm -rf backend/coverage
rm -rf backend/node_modules/.cache

# Relancer
npm test
```

### Problème : Warning mongoose "duplicate index"

**Note** : Ce warning peut être ignoré en mode test. Il provient de l'index défini à la fois avec `unique: true` et `index: true` dans le schema.

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Mongoose Testing Guide](https://mongoosejs.com/docs/jest.html)

## 👥 Contributeurs

- Tests initiaux : AW-14 (Sprint 2)
- Date de création : Décembre 2024

---

✅ **AW-14 Complété** : Suite de tests unitaires avec 94.11% de couverture (objectif : 50%)
