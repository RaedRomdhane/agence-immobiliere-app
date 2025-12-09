# 📋 Organisation du Projet - Agence Immobilière
## Répartition en 3 Sprints (Sans DevOps ni Tests)

---

## 🎯 **SPRINT 1 : Fondations & Authentification**
**Durée estimée : 2 semaines**

### Backend

#### 1. **Infrastructure & Configuration**
- ✅ Initialisation du projet Node.js/Express
- ✅ Configuration MongoDB avec Mongoose
- ✅ Structure des dossiers (MVC pattern)
  ```
  backend/
  ├── src/
  │   ├── models/
  │   ├── controllers/
  │   ├── routes/
  │   ├── middlewares/
  │   ├── services/
  │   ├── config/
  │   └── utils/
  ```
- ✅ Variables d'environnement (.env)
- ✅ Configuration CORS
- ✅ Gestion des erreurs globale (errorHandler)
- ✅ Logger (Morgan + Winston)

#### 2. **Système d'Authentification Complet**
- ✅ **Modèle User** (`User.js`)
  - Champs : firstName, lastName, email, password, role, phone
  - Hashage bcrypt automatique (pre-save hook)
  - Méthodes : comparePassword(), generateToken()
  
- ✅ **Routes Authentication** (`/api/auth`)
  - `POST /register` - Inscription
  - `POST /login` - Connexion
  - `POST /logout` - Déconnexion
  - `GET /me` - Profil utilisateur
  - `POST /forgot-password` - Mot de passe oublié
  - `POST /reset-password` - Réinitialisation
  - `GET /verify-email` - Vérification email
  - `POST /refresh-token` - Rafraîchir JWT

- ✅ **OAuth Google** (Passport.js)
  - `GET /api/auth/google` - Redirection OAuth
  - `GET /api/auth/google/callback` - Callback OAuth
  
- ✅ **Middlewares**
  - `protect` - Vérification JWT
  - `restrictTo('admin')` - Restriction par rôle
  
- ✅ **Service Email** (Nodemailer)
  - Email de bienvenue
  - Email de vérification
  - Email de réinitialisation mot de passe

#### 3. **Gestion Utilisateurs** (`/api/users`)
- ✅ `GET /api/users` - Liste utilisateurs (admin)
- ✅ `GET /api/users/:id` - Détails utilisateur
- ✅ `PUT /api/users/:id` - Modifier profil
- ✅ `DELETE /api/users/:id` - Supprimer compte
- ✅ `GET /api/users/stats` - Statistiques (admin)

### Frontend

#### 4. **Configuration Next.js**
- ✅ Initialisation projet Next.js 14 (App Router)
- ✅ Configuration Tailwind CSS
- ✅ Structure des dossiers
  ```
  frontend/
  ├── app/
  ├── components/
  ├── lib/
  ├── public/
  └── styles/
  ```

#### 5. **Pages d'Authentification**
- ✅ Page Login (`/login`)
  - Formulaire email/password
  - Bouton OAuth Google
  - Lien "Mot de passe oublié"
  
- ✅ Page Register (`/register`)
  - Formulaire inscription complet
  - Validation côté client
  
- ✅ Page Forgot Password
- ✅ Page Reset Password
- ✅ Page Email Verification

#### 6. **Context & Hooks**
- ✅ `AuthProvider` - Contexte authentification global
- ✅ `useAuth()` - Hook pour accéder au contexte
- ✅ Gestion du token JWT (localStorage)
- ✅ Redirection automatique (protéger routes)

#### 7. **Components Réutilisables**
- ✅ Header/Navbar avec état authentification
- ✅ Footer
- ✅ Loading spinners
- ✅ Toast notifications (react-toastify)

---

## 🏠 **SPRINT 2 : Gestion Propriétés & Recherche**
**Durée estimée : 3 semaines**

### Backend

#### 1. **Modèle Property** (`Property.js`)
```javascript
{
  title: String,
  description: String,
  type: ['appartement', 'villa', 'studio', 'terrain', 'bureau'],
  transactionType: ['vente', 'location'],
  price: Number,
  surface: Number,
  rooms: Number,
  bedrooms: Number,
  bathrooms: Number,
  floor: Number,
  location: {
    address: String,
    city: String,
    region: String,
    zipCode: String,
    coordinates: { lat: Number, lng: Number }
  },
  features: {
    parking: Boolean,
    garden: Boolean,
    pool: Boolean,
    elevator: Boolean,
    balcony: Boolean,
    terrace: Boolean,
    furnished: Boolean,
    airConditioning: Boolean,
    heating: Boolean,
    securitySystem: Boolean
  },
  photos: [{ url: String, isPrimary: Boolean }],
  status: ['disponible', 'vendu', 'loué', 'archivé'],
  createdBy: ObjectId (User),
  favorites: [ObjectId (User)]
}
```

#### 2. **Routes Properties** (`/api/properties`)
- ✅ `GET /api/properties` - Liste avec pagination & filtres
  - Query params : type, transactionType, city, minPrice, maxPrice, rooms, etc.
- ✅ `GET /api/properties/:id` - Détails propriété
- ✅ `POST /api/properties` - Créer propriété (admin)
- ✅ `PUT /api/properties/:id` - Modifier (admin)
- ✅ `DELETE /api/properties/:id` - Supprimer (admin)
- ✅ `PATCH /api/properties/:id/archive` - Archiver/Désarchiver

#### 3. **Upload Photos** (Multer)
- ✅ Configuration Multer
- ✅ Upload multiple photos
- ✅ Stockage local (/uploads)
- ✅ Validation (type, taille)
- ✅ Redimensionnement (Sharp)

#### 4. **Import/Export CSV**
- ✅ `GET /api/properties/csv-template` - Template CSV
- ✅ `POST /api/properties/import-csv` - Import propriétés
- ✅ `GET /api/properties/export` - Export CSV

#### 5. **Historique Propriétés** (`PropertyHistory.js`)
- ✅ Modèle PropertyHistory
- ✅ Log automatique des modifications
- ✅ `GET /api/properties/:id/history` - Historique

#### 6. **Système de Favoris**
- ✅ `POST /api/users/:id/favorites` - Ajouter favori
- ✅ `DELETE /api/users/:id/favorites` - Retirer favori
- ✅ `GET /api/users/:id/favorites/properties` - Liste favoris
- ✅ `PATCH /api/users/:id/favorites/order` - Réorganiser

#### 7. **Recherches Sauvegardées**
- ✅ `POST /api/users/:id/saved-searches` - Sauvegarder recherche
- ✅ `GET /api/users/:id/saved-searches` - Liste recherches
- ✅ `DELETE /api/users/:id/saved-searches/:searchId` - Supprimer
- ✅ `POST /api/users/:id/last-property-search-criteria` - Derniers critères

### Frontend

#### 8. **Pages Propriétés**
- ✅ Page Liste Propriétés (`/properties`)
  - Grid/List view
  - Filtres avancés (sidebar)
  - Pagination
  - Tri (prix, date, etc.)
  
- ✅ Page Détails Propriété (`/properties/[id]`)
  - Carousel photos
  - Informations complètes
  - Carte localisation (Google Maps)
  - Bouton "Ajouter aux favoris"
  - Bouton "Demander rendez-vous"
  - Propriétés similaires

#### 9. **Recherche & Filtres**
- ✅ Barre de recherche globale (Header)
- ✅ Filtres sidebar
  - Type de bien
  - Type de transaction
  - Fourchette de prix
  - Nombre de pièces
  - Ville/Région
  - Caractéristiques (features)
- ✅ Sauvegarde recherches (localStorage + API)
- ✅ Suggestions de recherche

#### 10. **Page Favoris** (`/favorites`)
- ✅ Liste favoris utilisateur
- ✅ Drag & drop réorganisation
- ✅ Comparaison propriétés

#### 11. **Admin - Gestion Propriétés**
- ✅ Dashboard admin (`/admin`)
- ✅ Liste propriétés admin
- ✅ Formulaire création/édition
  - Upload photos (multiple)
  - Tous les champs
  - Preview
- ✅ Import/Export CSV
- ✅ Statistiques propriétés

---

## 📅 **SPRINT 3 : Rendez-vous, Notifications & Features Avancées**
**Durée estimée : 3 semaines**

### Backend

#### 1. **Système de Rendez-vous** (`Appointment.js`)
```javascript
{
  user: ObjectId,
  property: ObjectId,
  status: ['pending', 'accepted', 'denied'],
  message: String,
  meetingDate: Date,
  denialReason: String,
  requestedAt: Date,
  decidedAt: Date,
  admin: ObjectId
}
```

#### 2. **Routes Appointments** (`/api/appointments`)
- ✅ `POST /api/appointments` - Demander rendez-vous (user)
- ✅ `GET /api/appointments/user` - Mes rendez-vous (user)
- ✅ `GET /api/appointments` - Tous rendez-vous (admin)
- ✅ `PATCH /api/appointments/:id/accept` - Accepter (admin)
- ✅ `PATCH /api/appointments/:id/deny` - Refuser (admin)
- ✅ `GET /api/appointments/global-status` - Statut global
- ✅ Notifications automatiques (user + admin)

#### 3. **Système de Notifications** (`Notification.js`)
```javascript
{
  user: ObjectId,
  property: ObjectId,
  type: ['property_update', 'appointment_request', 'appointment_accepted', 'appointment_denied'],
  message: String,
  read: Boolean,
  createdAt: Date
}
```

#### 4. **Routes Notifications** (`/api/notifications`)
- ✅ `GET /api/notifications` - Mes notifications
- ✅ `GET /api/notifications/admin` - Notifications admin
- ✅ `PATCH /api/notifications/:id/read` - Marquer comme lue
- ✅ `PATCH /api/notifications/mark-all-read` - Tout marquer
- ✅ `GET /api/notifications/unread-count` - Compteur non lues

#### 5. **WebSocket Notifications** (Socket.io)
- ✅ Configuration Socket.io
- ✅ `useNotificationWebSocket` hook
- ✅ Notifications temps réel
- ✅ Badge notification (Header)

#### 6. **Système de Messages/Contact**
- ✅ Modèle ContactMessage
- ✅ `POST /api/contact` - Envoyer message
- ✅ `GET /api/admin/contact/messages` - Liste messages (admin)
- ✅ `GET /api/admin/contact/messages/:id` - Détails message
- ✅ `POST /api/admin/contact/messages/:id/reply` - Répondre (threading)
- ✅ `GET /api/admin/contact/unread-count` - Compteur non lus

#### 7. **Système d'Avis/Reviews** (`Review.js`)
```javascript
{
  property: ObjectId,
  user: ObjectId,
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

#### 8. **Routes Reviews** (`/api/reviews`)
- ✅ `POST /api/properties/:id/reviews` - Ajouter avis
- ✅ `GET /api/properties/:id/reviews` - Liste avis propriété
- ✅ `PUT /api/reviews/:id` - Modifier avis
- ✅ `DELETE /api/reviews/:id` - Supprimer avis

#### 9. **Feature Flags** (`FeatureFlag.js`)
- ✅ Modèle FeatureFlag
- ✅ Service featureFlagService
- ✅ Middleware `requireFeatureFlag`
- ✅ Routes `/api/feature-flags` (CRUD complet)
  - Activation/désactivation
  - Whitelist utilisateurs
  - Targeting par rôle/email/ID
- ✅ Protection routes admin (toggle on/off)

#### 10. **Dashboard Admin Avancé**
- ✅ **Statistiques** (`/api/admin/stats`)
  - Nombre utilisateurs
  - Nombre propriétés
  - Revenus mensuels
  - Taux de conversion
  
- ✅ **Activités Récentes** (`/api/admin/recent-activities`)
  - Derniers utilisateurs
  - Dernières propriétés
  - Modifications propriétés
  - Messages contact

- ✅ **QR Code** (`/api/admin/qr-codes/:id`)
  - Génération QR code propriété

#### 11. **Chatbot IA** (Ollama)
- ✅ Configuration Ollama (llama3.2:3b)
- ✅ `POST /api/chat` - Endpoint chat
- ✅ Recommandations propriétés basées IA
- ✅ Réponses contextuelles

#### 12. **Documentation API** (Swagger)
- ✅ Configuration Swagger UI
- ✅ `GET /api-docs` - Documentation interactive
- ✅ `GET /api-docs.json` - Spec JSON

### Frontend

#### 13. **Page Rendez-vous**
- ✅ Formulaire demande rendez-vous (modal)
- ✅ Liste mes rendez-vous (`/appointments`)
  - Statut : en attente, accepté, refusé
  - Date rendez-vous
  - Détails propriété

#### 14. **Admin - Gestion Rendez-vous**
- ✅ Liste rendez-vous (`/admin/appointments`)
- ✅ Accepter/Refuser rendez-vous
- ✅ Planification date rendez-vous
- ✅ Filtres par statut

#### 15. **Notifications Temps Réel**
- ✅ Badge notification (Header)
- ✅ Dropdown notifications
- ✅ WebSocket connection
- ✅ Toast notifications
- ✅ Page notifications (`/notifications`)

#### 16. **Admin - Messages Contact**
- ✅ Page messages (`/admin/messages`)
- ✅ Liste messages avec statut (lu/non lu)
- ✅ Détails message
- ✅ Réponse en threading
- ✅ Compteur messages non lus (dashboard)

#### 17. **Dashboard Admin Complet**
- ✅ Accès Rapide (4 cartes)
  - Validations (0 en attente)
  - Messages (X non lus)
  - Alertes (X nouvelles)
  - Planning (voir agenda)

- ✅ Statistiques Clés
  - Utilisateurs totaux
  - Propriétés actives
  - Vendues/Louées ce mois
  - Revenus du mois

- ✅ Graphiques
  - Évolution revenus (Chart.js)
  - Répartition types propriétés
  - Activité utilisateurs

- ✅ Activités Récentes
  - Nouveaux utilisateurs
  - Nouvelles propriétés
  - Modifications récentes
  - Messages récents

#### 18. **Page Feature Flags** (`/admin/feature-flags`)
- ✅ Liste feature flags
- ✅ Toggle on/off
- ✅ Gestion whitelist
- ✅ Création/Modification flags

#### 19. **Chatbot IA Interface**
- ✅ Widget chat (coin de l'écran)
- ✅ Interface conversationnelle
- ✅ Suggestions propriétés
- ✅ Réponses contextuelles

#### 20. **Page Avis/Reviews**
- ✅ Section avis sur page détails propriété
- ✅ Formulaire ajouter avis
- ✅ Affichage note moyenne
- ✅ Liste avis avec pagination

#### 21. **Responsive Design**
- ✅ Mobile-first approach
- ✅ Breakpoints Tailwind (sm, md, lg, xl)
- ✅ Menu burger mobile
- ✅ Grids adaptatives

#### 22. **Optimisations Frontend**
- ✅ Lazy loading images
- ✅ Code splitting (Next.js automatique)
- ✅ Caching (SWR ou React Query)
- ✅ SEO (meta tags, sitemap)

---

## 📦 **Technologies Utilisées**

### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express.js
- **Base de données** : MongoDB (Mongoose)
- **Authentification** : JWT, Passport.js (OAuth Google)
- **Upload** : Multer, Sharp
- **Email** : Nodemailer
- **WebSocket** : Socket.io
- **Documentation** : Swagger UI
- **IA** : Ollama (llama3.2:3b)
- **Validation** : express-validator
- **Sécurité** : Helmet, CORS, bcryptjs

### Frontend
- **Framework** : Next.js 14 (App Router)
- **Styling** : Tailwind CSS
- **UI Components** : Lucide React (icônes)
- **State Management** : React Context API
- **HTTP Client** : Axios
- **Notifications** : React Toastify
- **Graphiques** : Chart.js / Recharts
- **Maps** : Google Maps API
- **WebSocket Client** : socket.io-client

---

## 📊 **Résumé des Modules**

| Module | Endpoints | Modèles | Pages Frontend | Complexité |
|--------|-----------|---------|----------------|------------|
| **Authentication** | 9 | User | 5 | ⭐⭐⭐ |
| **Properties** | 10+ | Property, PropertyHistory | 4 | ⭐⭐⭐⭐ |
| **Appointments** | 6 | Appointment | 2 | ⭐⭐⭐ |
| **Notifications** | 5 | Notification | 1 | ⭐⭐ |
| **Messages** | 5 | ContactMessage | 2 | ⭐⭐⭐ |
| **Reviews** | 4 | Review | 1 | ⭐⭐ |
| **Feature Flags** | 10 | FeatureFlag | 1 | ⭐⭐⭐ |
| **Admin** | 8 | - | 3 | ⭐⭐⭐⭐ |
| **Chatbot IA** | 1 | - | Widget | ⭐⭐⭐ |

---

## 🎯 **Points Clés de l'Architecture**

### Backend
1. **Architecture MVC** : Séparation claire entre routes, controllers, services, modèles
2. **Middleware Pipeline** : Authentification → Validation → Feature Flags → Controller
3. **Error Handling** : Centralisé avec ApiError et errorHandler
4. **Notifications** : Système double (base de données + WebSocket temps réel)
5. **Feature Flags** : Permet d'activer/désactiver fonctionnalités (ex: admin panel)

### Frontend
1. **Component-Based** : Composants réutilisables (Header, Footer, PropertyCard, etc.)
2. **Context API** : Gestion état authentification global
3. **Protected Routes** : Redirection automatique si non authentifié
4. **Responsive Design** : Mobile-first avec Tailwind CSS
5. **Real-time Updates** : WebSocket pour notifications instantanées

---

## 📝 **Notes Importantes**

### Fonctionnalités Exclus (DevOps & Tests)
- ❌ Tests unitaires (Jest)
- ❌ Tests d'intégration
- ❌ Tests E2E
- ❌ CI/CD (GitHub Actions)
- ❌ Docker/Containerisation
- ❌ Déploiement (Railway, Vercel)
- ❌ Monitoring (Prometheus, Grafana)
- ❌ Documentation technique avancée

### Bonnes Pratiques Appliquées
- ✅ Code modulaire et réutilisable
- ✅ Nomenclature cohérente (camelCase, PascalCase)
- ✅ Gestion des erreurs robuste
- ✅ Validation données (backend + frontend)
- ✅ Sécurité (JWT, hashage, CORS, Helmet)
- ✅ Documentation API (Swagger)
- ✅ Commentaires dans le code
- ✅ Structure de dossiers claire

---

## 🚀 **Prochaines Étapes Possibles**

1. **Tests** : Ajouter tests unitaires et d'intégration
2. **DevOps** : Dockerisation et CI/CD
3. **Déploiement** : Production sur Railway/Vercel
4. **Monitoring** : Logs centralisés et alertes
5. **Scaling** : Redis pour sessions, file d'attente (Bull)
6. **Amélioration IA** : Fine-tuning modèle Ollama
7. **Mobile App** : React Native ou Flutter
8. **Paiement** : Intégration Stripe/PayPal

---

**Document créé le** : 7 décembre 2025  
**Version** : 1.0  
**Statut** : ✅ Projet Complété (3 sprints)
