# 🎯 SPRINT 2 - Checklist Quotidienne

> **Sprint 2 : CRUD Biens + Recherche + Performance**  
> **Durée :** 2 semaines | 88 points  
> **Dates :** Semaine 3-4

---

## 📅 SEMAINE 1 (Jours 1-5)

### ☀️ LUNDI - Jour 1
**Objectif :** Setup infrastructure + Modèles MongoDB

- [ ] **Matin (4h)**
  - [ ] Créer `backend/src/models/Property.js` (schéma complet)
  - [ ] Créer `backend/src/models/Category.js`
  - [ ] Tests unitaires sur modèles
  - [ ] Push branch `feature/property-model`

- [ ] **Après-midi (4h)**
  - [ ] Installer dépendances : `multer`, `qrcode`, `cloudinary`
  - [ ] Configurer Cloudinary (variables env)
  - [ ] Créer `backend/src/config/cloudinary.js`
  - [ ] Tests upload basique
  - [ ] Push branch `feature/upload-setup`

**Livrable :** Modèles MongoDB + Upload configuré ✅

---

### 🔧 MARDI - Jour 2
**Objectif :** API POST /api/properties (US 1.1 - partie backend)

- [ ] **Matin (4h)**
  - [ ] Créer `backend/src/controllers/propertyController.js`
  - [ ] Créer `backend/src/routes/propertyRoutes.js`
  - [ ] Implémenter `createProperty()` avec upload photos
  - [ ] Génération QR Code automatique

- [ ] **Après-midi (4h)**
  - [ ] Middleware auth : seul admin peut créer
  - [ ] Validation des données (Joi ou Zod)
  - [ ] Tests Postman sur POST /api/properties
  - [ ] Tests unitaires controller
  - [ ] Push branch `feature/create-property-api`

**Livrable :** API POST fonctionnelle avec QR Code ✅

---

### 💻 MERCREDI - Jour 3
**Objectif :** Frontend formulaire (US 1.1 - partie frontend)

- [ ] **Matin (4h)**
  - [ ] Créer `frontend/components/admin/PropertyForm.tsx`
  - [ ] Setup react-hook-form + zod validation
  - [ ] Formulaire avec tous les champs (titre, prix, surface, etc.)
  - [ ] Créer `frontend/components/admin/PhotoUploader.tsx`

- [ ] **Après-midi (4h)**
  - [ ] Prévisualisation photos avant upload
  - [ ] Intégration API POST /api/properties
  - [ ] Gestion erreurs + messages succès
  - [ ] Tests manuels ajout bien
  - [ ] Push branch `feature/property-form`

**Livrable :** Formulaire admin fonctionnel ✅

---

### ✅ JEUDI - Jour 4
**Objectif :** US 1.2 (Modifier) + US 1.3 (Supprimer)

- [ ] **Matin (4h)**
  - [ ] API PUT /api/properties/:id
  - [ ] API DELETE /api/properties/:id (soft delete → archived)
  - [ ] Frontend page `admin/properties/[id]/edit`
  - [ ] Tests modification bien

- [ ] **Après-midi (4h)**
  - [ ] Historique modifications (logs)
  - [ ] Notification utilisateurs (si bien en favoris)
  - [ ] Tests E2E : modifier + supprimer bien
  - [ ] Push branch `feature/edit-delete-property`

**Livrable :** US 1.2 et 1.3 complètes ✅

---

### 📊 VENDREDI - Jour 5
**Objectif :** US 1.4 (CSV) + Liste biens admin

- [ ] **Matin (4h)**
  - [ ] API POST /api/properties/import (CSV)
  - [ ] API GET /api/properties/export (CSV)
  - [ ] Validation import + rapport erreurs
  - [ ] Tests import/export

- [ ] **Après-midi (4h)**
  - [ ] Frontend `admin/properties` (liste + filtres)
  - [ ] Composant ImportExportCSV
  - [ ] Tests E2E complets CRUD
  - [ ] **Demo interne CRUD complet**
  - [ ] Push branch `feature/csv-import-export`

**Livrable :** ÉPIQUE 1 (Gestion Biens) 100% complète ✅

---

## 📅 SEMAINE 2 (Jours 6-10)

### 🔍 LUNDI - Jour 6
**Objectif :** US 2.1 (Recherche multi-critères)

- [ ] **Matin (4h)**
  - [ ] API GET /api/properties/search avec query params
  - [ ] Indexation MongoDB (prix, surface, city)
  - [ ] Filtres : prix, surface, rooms, type, city
  - [ ] Tests recherche backend

- [ ] **Après-midi (4h)**
  - [ ] Frontend `components/search/SearchBar.tsx`
  - [ ] Frontend `components/search/SearchFilters.tsx`
  - [ ] Frontend `components/search/SearchResults.tsx`
  - [ ] Tests E2E recherche
  - [ ] Push branch `feature/search`

**Livrable :** Recherche multi-critères fonctionnelle ✅

---

### 🗺️ MARDI - Jour 7
**Objectif :** US 2.2 (Carte interactive) - Setup

- [ ] **Matin (4h)**
  - [ ] Installer `react-leaflet`, `leaflet`
  - [ ] Créer `components/search/PropertyMap.tsx`
  - [ ] Affichage carte basique
  - [ ] Marqueurs biens statiques (test)

- [ ] **Après-midi (4h)**
  - [ ] Clustering marqueurs (react-leaflet-cluster)
  - [ ] Popup au clic sur marqueur
  - [ ] Filtrage biens depuis carte
  - [ ] Tests carte desktop + mobile
  - [ ] Push branch `feature/map`

**Livrable :** Carte interactive avec marqueurs ✅

---

### 📍 MERCREDI - Jour 8
**Objectif :** US 2.3 (Géolocalisation) + Performance

- [ ] **Matin (4h)**
  - [ ] Bouton géolocalisation navigateur
  - [ ] Recherche par rayon (MongoDB $geoNear)
  - [ ] Affichage distance pour chaque bien
  - [ ] Tests géolocalisation

- [ ] **Après-midi (4h)**
  - [ ] US Perf 1 : Optimisation images (sharp, WebP)
  - [ ] US Perf 2 : Lazyloading + CDN Cloudinary
  - [ ] Cache Redis pour recherches fréquentes
  - [ ] Tests Lighthouse > 90
  - [ ] Push branch `feature/geolocation-perf`

**Livrable :** Géolocalisation + Performance optimisée ✅

---

### 🌍 JEUDI - Jour 9
**Objectif :** US i18n 1 & 2 (Multilinguisme FR/AR)

- [ ] **Matin (4h)**
  - [ ] Installer `next-i18next`, `i18next`
  - [ ] Configuration `next-i18next.config.js`
  - [ ] Créer `public/locales/fr/common.json`
  - [ ] Créer `public/locales/ar/common.json`

- [ ] **Après-midi (4h)**
  - [ ] Traduire tous les composants
  - [ ] Support RTL pour arabe (Tailwind)
  - [ ] Sélecteur de langue dans Header
  - [ ] Tests manuels FR ↔ AR
  - [ ] Push branch `feature/i18n`

**Livrable :** Site bilingue FR/AR avec RTL ✅

---

### ✅ VENDREDI - Jour 10
**Objectif :** Tests finaux + Documentation + Demo

- [ ] **Matin (4h)**
  - [ ] US Access 1 : Audit accessibilité (axe-core)
  - [ ] Corrections accessibilité (ARIA labels, contrastes)
  - [ ] Tests E2E complets sur tous les parcours
  - [ ] Tests performance finaux (Lighthouse)

- [ ] **Après-midi (4h)**
  - [ ] Mise à jour Swagger API
  - [ ] Documentation guide admin
  - [ ] Fix bugs identifiés
  - [ ] **🎉 DEMO SPRINT 2 COMPLÈTE**
  - [ ] Merge toutes les branches → `develop`

**Livrable :** Sprint 2 100% terminé ✅

---

## 📊 MÉTRIQUES QUOTIDIENNES

### À tracker chaque jour

| Métrique | Objectif | Actuel |
|----------|----------|--------|
| **Story Points complétés** | ~9 pts/jour | ___ |
| **Tests E2E passants** | 100% | ___ |
| **Coverage backend** | > 70% | ___ |
| **Lighthouse Performance** | > 90 | ___ |
| **Bugs critiques** | 0 | ___ |

---

## 🚨 ALERTES QUOTIDIENNES

### À vérifier tous les matins
- [ ] CI/CD pipeline vert ✅
- [ ] Staging accessible et fonctionnel
- [ ] Aucun bug critique ouvert
- [ ] Aucun blocage équipe

### À faire tous les soirs
- [ ] Push du code du jour
- [ ] Tests automatisés passent
- [ ] Mise à jour checklist
- [ ] Note rapide des blocages pour demain

---

## 🎯 DEFINITION OF DONE (DoD) - Rappel

Une US est DONE quand :
- [ ] Code écrit et testé (unitaire + E2E)
- [ ] Code review approuvée
- [ ] CI/CD vert
- [ ] Performance validée (Lighthouse > 90)
- [ ] Accessibilité validée (axe-core)
- [ ] Déployé sur staging
- [ ] Acceptée par PO

---

## 📞 CONTACTS RAPIDES

| Besoin | Contact |
|--------|---------|
| **Blocage technique** | Tech Lead |
| **Clarification US** | Product Owner |
| **Bug critique** | Scrum Master |
| **Accès infra** | DevOps |

---

## 🔗 LIENS RAPIDES

- 📋 [Backlog Sprint 2](./PLANNING-SPRINTS-2-4.md#sprint-2)
- 🚀 [Guide Sprint 2](./SPRINT-2-GUIDE.md)
- 📊 [Statut Projet](./STATUT-PROJET.md)
- 🏗️ [Diagrammes UML](./class-diagram.puml)

---

**Mise à jour :** Cochez les cases au fur et à mesure ✅  
**Fin Sprint 2 :** Vendredi soir, Semaine 4  
**Prochaine Demo :** Vendredi 16h - Sprint Review

---

🎯 **Focus :** Une US à la fois, tests avant merge, qualité > vitesse !
