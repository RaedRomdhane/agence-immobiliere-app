# 🚀 SPRINT 2 : Guide de Démarrage Rapide

> **Statut :** 🔄 EN COURS  
> **Durée :** 2 semaines (Semaine 3-4)  
> **Points :** 88 points  
> **Objectif :** MVP Fonctionnel avec CRUD Biens + Recherche + UX

---

## ✅ Prérequis (Sprint 1 - Terminé)

- ✅ Authentification Email/Password
- ✅ Authentification Google OAuth
- ✅ Gestion utilisateurs (signup, login, profil)
- ✅ Infrastructure Next.js 15 + Node.js + MongoDB
- ✅ CI/CD basique
- ✅ Tests E2E initiaux (Playwright)

---

## 🎯 Objectifs Sprint 2

### Fonctionnalités Principales
1. **CRUD Biens Immobiliers** (US 1.1, 1.2, 1.3, 1.4)
2. **Recherche Avancée** (US 2.1, 2.2, 2.3)
3. **Performance < 2s** (US 9.1, Perf 1, Perf 2)
4. **Accessibilité WCAG AA** (US Access 1, 2)
5. **Multilinguisme FR/AR** (US i18n 1, 2)

---

## 📅 SEMAINE 1 : CRUD Biens + Infrastructure

### Jour 1-2 : Setup & Architecture

**Backend Setup**
```bash
cd backend

# Créer les schémas MongoDB
# src/models/Property.js
# src/models/Category.js

# Installer dépendances
npm install multer qrcode cloudinary csv-parse csv-stringify
```

**Schéma Property (MongoDB)**
```javascript
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['vente', 'location'], required: true },
  category: { type: String, enum: ['appartement', 'maison', 'terrain', 'commercial'] },
  price: { type: Number, required: true },
  surface: { type: Number, required: true },
  rooms: { type: Number },
  bathrooms: { type: Number },
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: { type: String, default: 'Tunisie' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  photos: [{ url: String, cloudinaryId: String }],
  qrCode: { url: String, data: String },
  status: { type: String, enum: ['active', 'archived', 'sold'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

**Checklist Jour 1-2**
- [ ] Créer `backend/src/models/Property.js`
- [ ] Créer `backend/src/models/Category.js`
- [ ] Configurer Multer pour upload images
- [ ] Configurer Cloudinary (ou AWS S3)
- [ ] Setup QR Code generation (qrcode library)
- [ ] Tests unitaires sur modèles

---

### Jour 3-5 : US 1.1 - Ajouter un bien

**Backend API**
```bash
# Créer les routes et controllers
# backend/src/routes/propertyRoutes.js
# backend/src/controllers/propertyController.js
```

**Endpoints à créer**
```javascript
POST   /api/properties          // Créer bien
GET    /api/properties          // Liste biens
GET    /api/properties/:id      // Détail bien
PUT    /api/properties/:id      // Modifier bien
DELETE /api/properties/:id      // Supprimer bien
POST   /api/properties/import   // Import CSV
GET    /api/properties/export   // Export CSV
```

**Frontend - Formulaire Admin**
```bash
cd frontend

# Installer dépendances
npm install react-hook-form zod react-dropzone leaflet
```

**Créer composants**
```
frontend/components/admin/
├── PropertyForm.tsx          # Formulaire ajout/édition
├── PropertyList.tsx          # Liste des biens
├── PropertyCard.tsx          # Card bien
├── PhotoUploader.tsx         # Upload multiple photos
└── QRCodeGenerator.tsx       # Génération QR
```

**Checklist Jour 3-5**
- [ ] API POST /api/properties avec validation
- [ ] Upload multiple photos (max 10)
- [ ] Génération QR Code automatique
- [ ] Frontend formulaire avec react-hook-form + zod
- [ ] Prévisualisation photos avant upload
- [ ] Tests E2E : créer un bien complet
- [ ] Middleware auth : seul admin peut créer

---

## 📅 SEMAINE 2 : Recherche + Performance + i18n

### Jour 1-2 : US 1.2, 1.3, 1.4 - Modifier/Supprimer/CSV

**Backend**
```javascript
// Import CSV avec validation
router.post('/import', upload.single('file'), propertyController.importCSV);

// Export CSV avec filtres
router.get('/export', propertyController.exportCSV);
```

**Frontend**
```typescript
// Page admin/properties/[id]/edit
// Composant ImportExportCSV
```

**Checklist Jour 1-2**
- [ ] API PUT /api/properties/:id
- [ ] API DELETE /api/properties/:id (soft delete → archived)
- [ ] Import CSV avec rapport erreurs
- [ ] Export CSV avec filtres
- [ ] Frontend page édition bien
- [ ] Tests E2E : modifier/supprimer bien

---

### Jour 3-4 : US 2.1, 2.2, 2.3 - Recherche

**Backend API Recherche**
```javascript
GET /api/properties/search?q=tunis&minPrice=100000&maxPrice=500000&type=appartement&city=Tunis
```

**Frontend - Carte Interactive**
```bash
npm install react-leaflet leaflet
```

**Composants**
```
frontend/components/search/
├── SearchBar.tsx             # Barre recherche
├── SearchFilters.tsx         # Filtres (prix, surface, etc.)
├── PropertyMap.tsx           # Carte Leaflet
├── SearchResults.tsx         # Résultats liste
└── GeolocationButton.tsx     # Bouton géoloc
```

**Checklist Jour 3-4**
- [ ] API recherche avec filtres multiples
- [ ] Intégration Leaflet (carte interactive)
- [ ] Marqueurs biens sur carte
- [ ] Clustering marqueurs (react-leaflet-cluster)
- [ ] Géolocalisation navigateur
- [ ] Recherche par rayon (radius search)
- [ ] Tests E2E : recherche + filtres

---

### Jour 5 : Performance + i18n + Tests

**Performance**
```bash
# Optimisation images
npm install sharp next-image-export-optimizer

# Cache
npm install redis ioredis
```

**i18n**
```bash
npm install next-i18next i18next react-i18next
```

**Configuration next-i18next**
```javascript
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'ar'],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
```

**Checklist Jour 5**
- [ ] Conversion images en WebP automatique
- [ ] Lazyloading sur toutes les images
- [ ] Cache Redis pour requêtes fréquentes
- [ ] Configuration next-i18next (FR/AR)
- [ ] Traductions fichiers JSON (fr.json, ar.json)
- [ ] Support RTL pour arabe (Tailwind)
- [ ] Tests Lighthouse Performance > 90
- [ ] Tests accessibilité (axe-core)
- [ ] Tests E2E complets sur parcours critiques

---

## 🧪 Tests à Réaliser

### Tests Unitaires (Jest)
```bash
cd backend
npm test

# Tester
- Modèles (Property, User)
- Controllers (CRUD biens)
- Validation des schémas
- Génération QR Code
```

### Tests E2E (Playwright)
```bash
cd e2e-tests
npx playwright test

# Scénarios
1. Admin crée un bien avec photos
2. Admin modifie un bien
3. Admin supprime un bien
4. Admin importe CSV
5. Utilisateur recherche biens
6. Utilisateur utilise carte
7. Utilisateur change langue (FR ↔ AR)
```

### Tests Performance (Lighthouse)
```bash
npm run lighthouse

# Critères
- Performance > 90
- Accessibility > 90
- Best Practices > 90
- SEO > 90
```

---

## 📦 Livrables Sprint 2

### Fonctionnels
- [ ] Admin peut créer/modifier/supprimer biens
- [ ] Upload multiple photos (max 10)
- [ ] QR Code généré automatiquement
- [ ] Import/Export CSV fonctionnel
- [ ] Recherche multi-critères opérationnelle
- [ ] Carte interactive avec marqueurs
- [ ] Géolocalisation utilisateur

### Techniques
- [ ] API REST complète documentée (Swagger)
- [ ] Tests unitaires sur CRUD
- [ ] Tests E2E couvrant tous les parcours
- [ ] Performance < 2s validée
- [ ] Accessibilité WCAG AA validée
- [ ] Site bilingue FR/AR avec RTL

### Documentation
- [ ] Swagger API mis à jour
- [ ] Guide admin pour gestion biens
- [ ] Documentation technique (modèles, API)
- [ ] Rapport tests (couverture, perf, accessibilité)

---

## 🚨 Points d'Attention

### Performance
⚠️ **Images lourdes** → Compression automatique avec sharp
⚠️ **Trop de requêtes DB** → Cache Redis sur recherches
⚠️ **Bundle JS trop gros** → Dynamic imports sur carte Leaflet

### Sécurité
⚠️ **Upload photos** → Validation type MIME + taille max 5Mo
⚠️ **Injection CSV** → Validation stricte avec csv-parse
⚠️ **Permissions** → Middleware auth sur routes admin

### i18n
⚠️ **RTL arabe** → Vérifier tous les composants (Tailwind rtl:)
⚠️ **Dates/Prix** → Format local (TND, format date tunisien)
⚠️ **Traductions manquantes** → Fallback vers français

---

## 📞 Support & Ressources

### Documentation Externe
- [Next.js i18n](https://nextjs.org/docs/advanced-features/i18n-routing)
- [React Leaflet](https://react-leaflet.js.org/)
- [Multer Upload](https://github.com/expressjs/multer)
- [QRCode.js](https://github.com/soldair/node-qrcode)
- [Playwright Testing](https://playwright.dev/)

### Ressources Internes
- [Backlog Complet](./BACKLOG-COMPLET-USER-STORIES.md)
- [Planning Sprints 2-4](./PLANNING-SPRINTS-2-4.md)
- [Diagrammes UML](./class-diagram.puml)
- [Guide Docker](./DOCKER-GUIDE.md)

---

## ✅ Definition of Done (DoD)

Une User Story est terminée quand :
- [ ] Code écrit et testé (unitaire + E2E)
- [ ] Code review approuvée par au moins 1 dev
- [ ] Tests automatisés passent (CI/CD vert)
- [ ] Performance validée (Lighthouse > 90)
- [ ] Accessibilité validée (axe-core sans erreurs)
- [ ] Documentation API mise à jour
- [ ] Déployé sur environnement staging
- [ ] Acceptée par PO/Client (démo)

---

## 🎉 Critères de Succès Sprint 2

### ✅ MVP Fonctionnel
- Admin peut gérer 100% des biens (CRUD + CSV)
- Utilisateurs peuvent rechercher et localiser biens sur carte
- Site accessible (WCAG AA), rapide (<2s), bilingue (FR/AR)

### ✅ Qualité
- Couverture tests > 70%
- 0 bugs critiques
- Performance Lighthouse > 90
- 0 erreur accessibilité (axe-core)

### ✅ Production Ready
- API documentée (Swagger)
- Tests E2E validés
- Déployé sur staging
- Documentation technique à jour

---

**Bonne chance pour le Sprint 2 ! 🚀**

**Prochaine étape :** Sprint 3 - IA, Engagement & Analytics
