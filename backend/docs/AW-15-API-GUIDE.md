# AW-15 : Guide d'Utilisation de l'API Users

## 🎉 Résumé

**Ticket AW-15 Complété avec Succès !**

L'API CRUD complète pour les utilisateurs a été développée avec :
- ✅ 10 endpoints REST fonctionnels
- ✅ Validation des données avec express-validator
- ✅ Gestion d'erreurs centralisée
- ✅ Documentation Swagger/OpenAPI complète
- ✅ 28 tests (100% passants)
- ✅ 78.52% de couverture de code

---

## 📚 Documentation Swagger

**URL** : http://localhost:5000/api-docs

La documentation interactive Swagger UI est disponible et permet de :
- Visualiser tous les endpoints
- Tester les requêtes directement
- Voir les schémas de données
- Consulter les codes de réponse

---

## 🚀 Endpoints Disponibles

### Base URL
```
http://localhost:5000/api
```

### 1. Créer un Utilisateur
```http
POST /api/users
Content-Type: application/json

{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "password": "Password123!",
  "phone": "+33612345678",
  "role": "client",
  "address": {
    "street": "123 Rue de la Paix",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France"
  }
}
```

**Réponse (201 Created)** :
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+33612345678",
    "role": "client",
    "isActive": true,
    "address": {
      "street": "123 Rue de la Paix",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France"
    },
    "fullName": "Jean Dupont",
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

---

### 2. Récupérer Tous les Utilisateurs
```http
GET /api/users?page=1&limit=10&role=client&isActive=true&search=jean&sort=-createdAt
```

**Query Parameters** :
- `page` (integer) : Numéro de page (défaut : 1)
- `limit` (integer) : Nombre par page (défaut : 10, max : 100)
- `role` (string) : Filtrer par rôle (admin | client)
- `isActive` (boolean) : Filtrer par statut actif
- `search` (string) : Rechercher dans nom/email
- `sort` (string) : Tri (ex: `-createdAt`, `firstName`)

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Utilisateurs récupérés avec succès",
  "data": [
    {
      "_id": "...",
      "firstName": "Jean",
      "lastName": "Dupont",
      ...
    }
  ],
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

---

### 3. Récupérer un Utilisateur par ID
```http
GET /api/users/:id
```

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Utilisateur récupéré avec succès",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Jean",
    ...
  }
}
```

**Erreur (404 Not Found)** :
```json
{
  "success": false,
  "error": {
    "message": "Utilisateur introuvable",
    "statusCode": 404
  }
}
```

---

### 4. Mettre à Jour un Utilisateur
```http
PUT /api/users/:id
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33687654321"
}
```

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Utilisateur mis à jour avec succès",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}
```

**Note** : Le mot de passe ne peut pas être modifié par cette route.

---

### 5. Mise à Jour Partielle (PATCH)
```http
PATCH /api/users/:id
Content-Type: application/json

{
  "phone": "+33687654321"
}
```

Même réponse que PUT.

---

### 6. Supprimer un Utilisateur
```http
DELETE /api/users/:id
```

**Réponse (204 No Content)** :
Pas de corps de réponse.

**Note** : Suppression logique (soft delete) - l'utilisateur est marqué comme inactif.

---

### 7. Statistiques des Utilisateurs
```http
GET /api/users/stats
```

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Statistiques récupérées avec succès",
  "data": {
    "total": 156,
    "active": 142,
    "byRole": {
      "admin": 12,
      "client": 144
    }
  }
}
```

---

### 8. Liste des Agents Actifs
```http
GET /api/users/agents
```

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Agents actifs récupérés avec succès",
  "data": [
    {
      "_id": "...",
      "firstName": "Admin",
      "lastName": "Test",
      "role": "admin",
      "isActive": true,
      ...
    }
  ]
}
```

---

### 9. Activer/Désactiver un Utilisateur
```http
PATCH /api/users/:id/status
Content-Type: application/json

{
  "isActive": false
}
```

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Utilisateur désactivé avec succès",
  "data": {
    "_id": "...",
    "isActive": false,
    ...
  }
}
```

---

### 10. Changer le Rôle d'un Utilisateur
```http
PATCH /api/users/:id/role
Content-Type: application/json

{
  "role": "admin"
}
```

**Réponse (200 OK)** :
```json
{
  "success": true,
  "message": "Rôle modifié avec succès",
  "data": {
    "_id": "...",
    "role": "admin",
    ...
  }
}
```

---

## 🔒 Validation des Données

### Règles de Validation

#### Création d'utilisateur (POST)
- `firstName` : Requis, 2-50 caractères
- `lastName` : Requis, 2-50 caractères
- `email` : Requis, format email valide, unique
- `password` : Requis, minimum 8 caractères
- `phone` : Optionnel, format français (+33... ou 0...)
- `role` : Optionnel, `admin` ou `client` (défaut : `client`)
- `address.street` : Optionnel, max 200 caractères
- `address.city` : Optionnel, max 100 caractères
- `address.postalCode` : Optionnel, 5 chiffres
- `address.country` : Optionnel, max 100 caractères

#### Mise à jour (PUT/PATCH)
Mêmes règles sauf :
- Tous les champs sont optionnels
- Le `password` ne peut pas être modifié

---

## ❌ Gestion des Erreurs

### Codes HTTP

| Code | Signification | Description |
|------|--------------|-------------|
| 200 | OK | Requête réussie (GET, PUT, PATCH) |
| 201 | Created | Ressource créée (POST) |
| 204 | No Content | Suppression réussie (DELETE) |
| 400 | Bad Request | Validation échouée |
| 404 | Not Found | Ressource introuvable |
| 409 | Conflict | Email déjà utilisé |
| 500 | Internal Server Error | Erreur serveur |

### Format des Erreurs

```json
{
  "success": false,
  "error": {
    "message": "Validation échouée",
    "statusCode": 400,
    "errors": [
      {
        "field": "email",
        "message": "Email invalide",
        "value": "invalid-email"
      }
    ]
  }
}
```

---

## 📦 Exemples avec cURL

### Créer un utilisateur
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "password": "Password123!"
  }'
```

### Récupérer tous les utilisateurs
```bash
curl http://localhost:5000/api/users?page=1&limit=10
```

### Récupérer un utilisateur par ID
```bash
curl http://localhost:5000/api/users/507f1f77bcf86cd799439011
```

### Mettre à jour un utilisateur
```bash
curl -X PUT http://localhost:5000/api/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Supprimer un utilisateur
```bash
curl -X DELETE http://localhost:5000/api/users/507f1f77bcf86cd799439011
```

---

## 🧪 Tests

### Exécuter les Tests
```bash
# Tous les tests
npm test

# Tests d'intégration uniquement
npm test -- userApi.test.js

# Tests unitaires uniquement
npm test -- sample.test.js

# Avec couverture
npm test -- --coverage
```

### Résultats des Tests
- **Total** : 28 tests
- **Passants** : 28/28 (100%)
- **Couverture** :
  - Statements : 78.52%
  - Functions : 70%
  - Lines : 78.36%
  - Branches : 36.58%

---

## 🏗️ Architecture

### Layered Architecture

```
Request
  ↓
Routes (userRoutes.js)
  ↓
Validation (express-validator)
  ↓
Controller (userController.js)
  ↓
Service (userService.js)
  ↓
Model (User.js)
  ↓
MongoDB
  ↓
Response ← Error Handler (errorHandler.js)
```

### Fichiers Créés

**Infrastructure** :
- `src/utils/ApiError.js` - Classe d'erreur personnalisée
- `src/utils/ApiResponse.js` - Réponses standardisées
- `src/utils/asyncHandler.js` - Wrapper async/await
- `src/middlewares/errorHandler.js` - Gestion centralisée des erreurs
- `src/middlewares/validator.js` - Middleware de validation

**Business Logic** :
- `src/services/userService.js` - Service métier User
- `src/controllers/userController.js` - Contrôleur User

**Routes & Validation** :
- `src/routes/index.js` - Index des routes
- `src/routes/userRoutes.js` - Routes User
- `src/validators/userValidator.js` - Validation User

**Documentation** :
- `src/config/swagger.js` - Configuration Swagger

**Tests** :
- `tests/integration/userApi.test.js` - Tests E2E (19 tests)
- `tests/unit/sample.test.js` - Tests unitaires mis à jour (9 tests)

---

## 🚦 Prochaines Étapes

### Pour l'Authentification (AW-16)
- Routes `/api/auth/login`, `/api/auth/register`
- Middleware JWT `protect`, `authorize`
- Tokens d'accès et de rafraîchissement

### Pour les Propriétés (AW-17)
- Modèle `Property`
- Service `propertyService`
- Routes `/api/properties`

### Améliorations Possibles
- Rate limiting par utilisateur
- Cache Redis pour les stats
- Upload d'images (avatar)
- Export CSV des utilisateurs
- Logs détaillés (Winston)

---

## ✅ Critères d'Acceptation Validés

- [x] **API CRUD pour les utilisateurs fonctionnelle** ✅
  - 10 endpoints créés et testés
  - CRUD complet (Create, Read, Update, Delete)
  - Endpoints spécialisés (stats, agents, statut, rôle)

- [x] **Modèles de données implémentés avec validation** ✅
  - Modèle User avec validation Mongoose
  - Validation express-validator sur routes
  - Validation format téléphone français
  - Unicité email

- [x] **Contrôleurs et services testés unitairement** ✅
  - 19 tests d'intégration (100% passants)
  - 9 tests unitaires (100% passants)
  - Couverture : 78.52% statements, 70% functions

- [x] **Documentation API générée (Swagger/OpenAPI)** ✅
  - Swagger UI accessible sur `/api-docs`
  - OpenAPI 3.0 complète
  - Schémas de données documentés
  - Exemples de requêtes/réponses

- [x] **Erreurs gérées proprement avec codes HTTP appropriés** ✅
  - Middleware de gestion d'erreurs centralisé
  - Codes HTTP standards (200, 201, 204, 400, 404, 409, 500)
  - Messages d'erreur clairs
  - Format d'erreur standardisé

---

**Date** : Décembre 2024  
**Ticket** : AW-15 - Développement des APIs Back-End Fondamentales  
**Status** : ✅ **COMPLÉTÉ**  
**Tests** : 28/28 passants (100%)  
**Couverture** : 78.52% statements
