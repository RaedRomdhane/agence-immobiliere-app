# Guide des Tests - Backend

## 📋 Table des Matières

1. [Types de Tests](#types-de-tests)
2. [Structure des Tests](#structure-des-tests)
3. [Exécution des Tests](#exécution-des-tests)
4. [Couverture de Code](#couverture-de-code)
5. [Bonnes Pratiques](#bonnes-pratiques)

---

## Types de Tests

### 1. **Tests Unitaires** (`tests/unit/`)

Tests de composants individuels isolés (models, utils, helpers).

**Fichiers:**
- `models/Property.test.js` - Validation du modèle Property
- `models/User.test.js` - Validation du modèle User

**Ce qu'ils testent:**
- Validation des schemas
- Valeurs par défaut
- Méthodes du modèle
- Hashage de mot de passe
- Business logic isolée

**Exemple:**
```javascript
test('should fail validation with invalid email', () => {
  const user = new User({
    firstName: 'John',
    email: 'invalid-email',
    password: 'Pass123!'
  });
  
  const error = user.validateSync();
  expect(error.errors.email).toBeDefined();
});
```

---

### 2. **Tests d'Intégration** (`tests/integration/`)

Tests d'APIs complètes avec base de données.

**Fichiers:**
- `propertyApi.test.js` - API CRUD des propriétés
- `appointmentApi.test.js` - API des rendez-vous
- `authApi.test.js` - API d'authentification (existant)
- `userApi.test.js` - API utilisateur (existant)

**Ce qu'ils testent:**
- Routes HTTP (GET, POST, PUT, DELETE)
- Authentification et autorisation
- Validation des données
- Réponses d'erreur
- Interactions avec la base de données

**Exemple:**
```javascript
test('should create property as admin', async () => {
  const res = await request(app)
    .post('/api/properties')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(propertyData)
    .expect(201);
    
  expect(res.body.data.title).toBe(propertyData.title);
});
```

---

### 3. **Tests Système** (`tests/system/`)

Tests de parcours utilisateur complets (end-to-end).

**Fichiers:**
- `userJourneys.test.js` - Parcours utilisateur complets

**Ce qu'ils testent:**
- Workflows complets multi-étapes
- Scénarios réels d'utilisation
- Intégration de plusieurs APIs
- Expérience utilisateur complète

**Scénarios testés:**
1. **Inscription et Connexion**
   - Inscription → Login → Récupération du profil

2. **Recherche et Favoris**
   - Recherche propriétés → Ajout favoris → Visualisation → Suppression

3. **Demande de Rendez-vous**
   - Demande utilisateur → Validation admin → Acceptation → Vérification

4. **Gestion Admin**
   - Création propriété → Mise à jour → Archivage → Suppression

5. **Sauvegarde de Recherche**
   - Sauvegarde critères → Récupération → Application filtres

---

## Structure des Tests

```
backend/tests/
├── setup.js                          # Configuration globale
├── unit/                             # Tests unitaires
│   ├── models/
│   │   ├── Property.test.js         # ✅ Nouveau
│   │   └── User.test.js             # ✅ Nouveau
│   └── config/
├── integration/                      # Tests d'intégration
│   ├── authApi.test.js              # ✅ Existant
│   ├── userApi.test.js              # ✅ Existant
│   ├── propertyApi.test.js          # ✅ Nouveau
│   ├── appointmentApi.test.js       # ✅ Nouveau
│   ├── featureFlags.test.js         # ✅ Existant
│   ├── monitoring.test.js           # ✅ Existant
│   └── passwordReset.test.js        # ✅ Existant
└── system/                           # Tests système
    └── userJourneys.test.js          # ✅ Nouveau
```

---

## Exécution des Tests

### Tous les tests
```bash
npm test
```

### Tests avec watch mode (développement)
```bash
npm run test:watch
```

### Tests pour CI/CD
```bash
npm run test:ci
```

### Tests spécifiques

**Tests unitaires uniquement:**
```bash
npm test -- tests/unit
```

**Tests d'intégration uniquement:**
```bash
npm test -- tests/integration
```

**Tests système uniquement:**
```bash
npm test -- tests/system
```

**Un fichier spécifique:**
```bash
npm test -- tests/unit/models/Property.test.js
```

**Avec pattern:**
```bash
npm test -- --testNamePattern="should create property"
```

---

## Couverture de Code

### Générer le rapport de couverture
```bash
npm test -- --coverage
```

### Visualiser le rapport HTML
```bash
# Ouvrir coverage/lcov-report/index.html dans le navigateur
```

### Seuils de couverture requis (jest.config.js)
- **Branches:** 60%
- **Functions:** 60%
- **Lines:** 60%
- **Statements:** 60%

---

## Bonnes Pratiques

### 1. **Isolation des Tests**
```javascript
beforeEach(async () => {
  // Nettoyer la base de données
  await Property.deleteMany({});
  await User.deleteMany({});
});

afterEach(async () => {
  // Cleanup si nécessaire
});
```

### 2. **Utiliser des Données de Test Réalistes**
```javascript
const validProperty = {
  title: 'Appartement moderne centre ville',
  description: 'Bel appartement avec vue, proche commodités',
  type: 'appartement',
  transactionType: 'vente',
  price: 250000,
  surface: 85,
  location: {
    address: '123 Avenue Habib Bourguiba',
    city: 'Tunis',
    region: 'Tunis',
    zipCode: '1000'
  }
};
```

### 3. **Nommer les Tests Clairement**
```javascript
// ✅ Bon
test('should fail validation when price is negative', () => {});

// ❌ Mauvais
test('test price', () => {});
```

### 4. **Tester les Cas Limites**
```javascript
// Tester les valeurs minimales
test('should accept minimum valid surface (1 m²)', () => {});

// Tester les valeurs maximales
test('should fail when title exceeds 200 characters', () => {});

// Tester les valeurs nulles/undefined
test('should handle missing optional fields', () => {});
```

### 5. **Assertions Explicites**
```javascript
// ✅ Bon
expect(res.body.success).toBe(true);
expect(res.body.data.price).toBe(250000);
expect(res.body.data.location.city).toBe('Tunis');

// ❌ Mauvais
expect(res.body).toBeTruthy();
```

### 6. **Utiliser beforeAll pour Setup Coûteux**
```javascript
let adminToken, testProperty;

beforeAll(async () => {
  // Setup une seule fois pour tous les tests
  const admin = await User.create({...});
  adminToken = generateToken(admin);
  testProperty = await Property.create({...});
});

afterAll(async () => {
  // Cleanup
  await User.deleteMany({});
  await Property.deleteMany({});
});
```

---

## Environnement de Test

### Base de Données
- **MongoDB In-Memory** via `mongodb-memory-server`
- Base de données isolée par test suite
- Nettoyage automatique entre les tests

### Variables d'Environnement
```bash
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key-123456789
JWT_EXPIRE=1h
MONGODB_URI=<in-memory>
```

---

## Debugging des Tests

### Logs détaillés
```bash
npm test -- --verbose
```

### Un seul test
```bash
npm test -- --testNamePattern="should create property as admin"
```

### Mode debug
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Puis ouvrir `chrome://inspect` dans Chrome.

---

## Métriques de Tests

### Résumé des Tests Créés

| Type | Fichiers | Tests | Couverture |
|------|----------|-------|------------|
| **Unitaires** | 2 | ~30 tests | Models |
| **Intégration** | 4 (2 nouveaux) | ~50 tests | APIs principales |
| **Système** | 1 | ~5 journeys | Workflows complets |
| **TOTAL** | 7 nouveaux | ~85 tests | Backend complet |

### Couverture Fonctionnelle

✅ **Models:**
- Property (validation, defaults, business logic)
- User (validation, password hashing, roles)

✅ **APIs:**
- Properties CRUD (admin/user permissions)
- Appointments (request, accept, deny)
- Authentication (existant)
- User management (existant)

✅ **Workflows:**
- Registration → Login → Profile
- Search → Favorite → View
- Appointment request → Accept
- Admin property management
- Search criteria save

---

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Tests
  run: npm run test:ci
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### Pre-commit Hook

```bash
# .husky/pre-commit
npm test -- --onlyChanged
```

---

## Commandes Rapides

```bash
# Tests complets avec couverture
npm test

# Mode développement (watch)
npm run test:watch

# Tests CI
npm run test:ci

# Tests unitaires seulement
npm test -- tests/unit

# Tests avec pattern
npm test -- --testNamePattern="Property"

# Couverture détaillée
npm test -- --coverage --verbose
```

---

## Prochaines Étapes

### Tests à Ajouter
- [ ] Tests pour le chatbot IA
- [ ] Tests pour les notifications temps réel
- [ ] Tests pour l'upload de fichiers
- [ ] Tests de performance (load testing)
- [ ] Tests de sécurité

### Améliorations
- [ ] Augmenter la couverture à 80%
- [ ] Ajouter des tests de mutation
- [ ] Intégrer SonarQube
- [ ] Ajouter des tests E2E frontend

---

## Support

Pour toute question sur les tests:
- Consulter la documentation Jest: https://jestjs.io/
- Voir les exemples dans `tests/`
- Lire les commentaires dans `setup.js`
