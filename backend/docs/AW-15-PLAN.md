# AW-15 : Plan de Développement - APIs Back-End Fondamentales

## 🎯 Objectifs

Développer les APIs REST CRUD complètes pour les utilisateurs avec :
- Contrôleurs et routes
- Services métier
- Validation des données
- Gestion d'erreurs
- Documentation Swagger/OpenAPI
- Tests unitaires

## ✅ Critères d'Acceptation

1. ✅ API CRUD pour les utilisateurs fonctionnelle
2. ✅ Modèles de données avec validation (déjà fait dans AW-13)
3. ✅ Contrôleurs et services testés unitairement
4. ✅ Documentation API générée (Swagger/OpenAPI)
5. ✅ Gestion d'erreurs propre avec codes HTTP appropriés

## 📋 Plan de Développement

### Phase 1 : Infrastructure de Base (30 min)

#### 1.1 Middleware de Gestion d'Erreurs
- [ ] Créer `src/middlewares/errorHandler.js`
- [ ] Créer classes d'erreurs personnalisées
- [ ] Centraliser la gestion des erreurs

#### 1.2 Middleware de Validation
- [ ] Installer `express-validator`
- [ ] Créer `src/middlewares/validator.js`
- [ ] Créer schémas de validation pour User

#### 1.3 Utilitaires
- [ ] Créer `src/utils/ApiError.js` (classe d'erreur)
- [ ] Créer `src/utils/ApiResponse.js` (réponses standardisées)
- [ ] Créer `src/utils/asyncHandler.js` (wrapper async)

### Phase 2 : Service Layer (45 min)

#### 2.1 User Service
- [ ] Créer `src/services/userService.js`
- [ ] Méthodes CRUD :
  - `createUser(data)` - Créer un utilisateur
  - `getAllUsers(filters, pagination)` - Liste avec filtres
  - `getUserById(id)` - Récupérer par ID
  - `updateUser(id, data)` - Mettre à jour
  - `deleteUser(id)` - Supprimer (soft delete)
  - `getUserStats()` - Statistiques

### Phase 3 : Controllers (45 min)

#### 3.1 User Controller
- [ ] Créer `src/controllers/userController.js`
- [ ] Méthodes :
  - `POST /api/users` - Créer
  - `GET /api/users` - Liste avec pagination/filtres
  - `GET /api/users/:id` - Détails
  - `PUT /api/users/:id` - Mise à jour complète
  - `PATCH /api/users/:id` - Mise à jour partielle
  - `DELETE /api/users/:id` - Suppression
  - `GET /api/users/stats` - Statistiques

### Phase 4 : Routes (30 min)

#### 4.1 User Routes
- [ ] Créer `src/routes/userRoutes.js`
- [ ] Définir toutes les routes avec :
  - Validation des données
  - Documentation des paramètres
  - Gestion des permissions (préparation)

#### 4.2 Index des Routes
- [ ] Créer `src/routes/index.js`
- [ ] Monter toutes les routes dans `/api`

### Phase 5 : Documentation Swagger (45 min)

#### 5.1 Configuration Swagger
- [ ] Installer `swagger-jsdoc` et `swagger-ui-express`
- [ ] Créer `src/config/swagger.js`
- [ ] Configurer OpenAPI 3.0

#### 5.2 Documentation des Endpoints
- [ ] Documenter chaque route User avec JSDoc
- [ ] Définir les schémas de requête/réponse
- [ ] Exemples de requêtes

### Phase 6 : Tests Unitaires (1h30)

#### 6.1 Tests du Service
- [ ] Créer `tests/unit/services/userService.test.js`
- [ ] Tests CRUD complets
- [ ] Tests des cas d'erreur
- [ ] Couverture > 80%

#### 6.2 Tests du Controller
- [ ] Créer `tests/unit/controllers/userController.test.js`
- [ ] Tests des endpoints
- [ ] Tests de validation
- [ ] Tests des codes HTTP
- [ ] Couverture > 80%

#### 6.3 Tests d'Intégration
- [ ] Créer `tests/integration/userApi.test.js`
- [ ] Tests E2E des routes
- [ ] Tests avec supertest

### Phase 7 : Intégration et Finalisation (30 min)

#### 7.1 Intégration dans app.js
- [ ] Monter les routes
- [ ] Monter Swagger UI
- [ ] Ajouter le middleware d'erreurs

#### 7.2 Documentation
- [ ] Créer `docs/AW-15-API-GUIDE.md`
- [ ] Exemples d'utilisation
- [ ] Guide de test

## 📦 Dépendances à Installer

```bash
npm install --save express-validator swagger-jsdoc swagger-ui-express
npm install --save-dev supertest
```

## 🗂️ Structure de Fichiers à Créer

```
backend/src/
├── controllers/
│   └── userController.js          # Contrôleur User
├── services/
│   └── userService.js              # Service métier User
├── routes/
│   ├── index.js                    # Index des routes
│   └── userRoutes.js               # Routes User
├── middlewares/
│   ├── errorHandler.js             # Gestion d'erreurs
│   └── validator.js                # Validation
├── utils/
│   ├── ApiError.js                 # Classe d'erreur
│   ├── ApiResponse.js              # Réponses standardisées
│   └── asyncHandler.js             # Wrapper async
└── config/
    └── swagger.js                  # Configuration Swagger

backend/tests/
├── unit/
│   ├── services/
│   │   └── userService.test.js
│   └── controllers/
│       └── userController.test.js
└── integration/
    └── userApi.test.js

backend/docs/
└── AW-15-API-GUIDE.md
```

## 🎨 Architecture Pattern

### Layered Architecture

```
Request → Routes → Validation → Controller → Service → Model → Database
                                     ↓
Response ← Error Handler ← ← ← ← ← ←
```

**Responsabilités** :
- **Routes** : Définition des endpoints, montage des middlewares
- **Validators** : Validation des données entrantes
- **Controllers** : Réception des requêtes, appel des services, formatage des réponses
- **Services** : Logique métier, manipulation des modèles
- **Models** : Schéma de données, validation Mongoose
- **Error Handler** : Gestion centralisée des erreurs

## 📝 Standards de Code

### 1. Format des Réponses API

**Succès** :
```json
{
  "success": true,
  "data": { ... },
  "message": "Utilisateur créé avec succès"
}
```

**Erreur** :
```json
{
  "success": false,
  "error": {
    "message": "Email déjà utilisé",
    "statusCode": 400,
    "errors": [...]
  }
}
```

### 2. Codes HTTP

- `200` : OK (GET, PUT, PATCH réussis)
- `201` : Created (POST réussi)
- `204` : No Content (DELETE réussi)
- `400` : Bad Request (validation échouée)
- `401` : Unauthorized (non authentifié)
- `403` : Forbidden (non autorisé)
- `404` : Not Found (ressource introuvable)
- `409` : Conflict (email en double, etc.)
- `500` : Internal Server Error (erreur serveur)

### 3. Pagination

```
GET /api/users?page=1&limit=10&sort=-createdAt&role=admin
```

**Réponse** :
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🔍 Validation Rules

### Création d'utilisateur (POST)
```javascript
{
  firstName: required, string, min:2, max:50
  lastName: required, string, min:2, max:50
  email: required, email, unique
  password: required, string, min:8
  phone: optional, string, format:french
  role: optional, enum:[admin, client], default:client
  address: optional, object
}
```

### Mise à jour (PUT/PATCH)
```javascript
{
  firstName: optional, string, min:2, max:50
  lastName: optional, string, min:2, max:50
  email: optional, email, unique (si changé)
  phone: optional, string, format:french
  role: optional, enum:[admin, client]
  address: optional, object
  // password non modifiable par cette route
}
```

## 🧪 Stratégie de Tests

### Tests Unitaires (Isolés)
- **Services** : Mocker le modèle Mongoose
- **Controllers** : Mocker les services
- Couverture cible : **80%+**

### Tests d'Intégration
- Tests E2E avec base MongoDB en mémoire
- Supertest pour simuler les requêtes HTTP
- Vérifier les codes de statut et le format des réponses

## 📊 Métriques de Succès

- [ ] **100%** des endpoints CRUD fonctionnels
- [ ] **80%+** de couverture de tests
- [ ] **< 200ms** temps de réponse moyen
- [ ] **Documentation Swagger** complète et accessible
- [ ] **0 erreur** non gérée
- [ ] **Tous les tests** passent

## 🚀 Ordre d'Implémentation

1. **Utilitaires** (ApiError, ApiResponse, asyncHandler)
2. **Middleware d'erreurs** (errorHandler)
3. **Middleware de validation** (validator)
4. **Service Layer** (userService)
5. **Controller Layer** (userController)
6. **Routes** (userRoutes + index)
7. **Swagger** (configuration + documentation)
8. **Tests Services** (userService.test.js)
9. **Tests Controllers** (userController.test.js)
10. **Tests Intégration** (userApi.test.js)
11. **Intégration app.js**
12. **Documentation finale**

## ⏱️ Estimation Totale

**Temps estimé** : 5-6 heures

**Répartition** :
- Infrastructure : 30 min
- Service : 45 min
- Controller : 45 min
- Routes : 30 min
- Swagger : 45 min
- Tests : 1h30
- Intégration : 30 min
- Documentation : 30 min

---

**Prêt à commencer !** 🚀

Prochaine étape : Installer les dépendances nécessaires.
