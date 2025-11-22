# 📅 PLANNING AGILE – SPRINTS 2 à 4 (6 SEMAINES)

> **Projet :** Plateforme Immobilière – 100 % conforme CdC  
> **Rôles :** admin, utilisateur, visiteur  
> **Langues :** FR / AR (RTL)  
> **Pays :** Tunisie  
> **Équipe :** 4 devs + 1 QA + 1 DevOps  
> **Vélocité cible :** 85–90 points / sprint  
> **Total points :** 256 points sur 3 sprints

---

## ✅ SPRINT 1 : TERMINÉ

**Statut :** ✅ Complété  
**Durée :** 2 semaines  
**Réalisations :**
- ✅ Authentification complète (Email/Password + Google OAuth)
- ✅ Gestion utilisateurs et rôles
- ✅ Infrastructure de base (Next.js 15 + Node.js + MongoDB)
- ✅ CI/CD basique
- ✅ Tests E2E initiaux

---

## 🚀 SPRINT 2 : MVP Fonctionnel, Recherche & UX de Base

**Durée :** 2 semaines (Sprint actuel)  
**Points :** 88 points  
**Objectif :** Plateforme utilisable + CRUD biens + recherche + accessibilité + i18n

### 📋 User Stories Sprint 2

| Épique | US | Description | Points | Priorité |
|--------|-----|-------------|--------|----------|
| **ÉPIQUE 1 : Gestion Biens** | | | **24** | 🔴 CRITIQUE |
| | US 1.1 | Ajouter un nouveau bien | 8 | P0 |
| | US 1.2 | Modifier un bien existant | 5 | P0 |
| | US 1.3 | Supprimer/Archiver un bien | 3 | P0 |
| | US 1.4 | Import/Export CSV des biens | 8 | P1 |
| **ÉPIQUE 2 : Recherche** | | | **26** | 🔴 CRITIQUE |
| | US 2.1 | Recherche multi-critères | 8 | P0 |
| | US 2.2 | Carte interactive | 13 | P0 |
| | US 2.3 | Recherche par géolocalisation | 5 | P1 |
| **ÉPIQUE 3 : Utilisateurs** | | | **10** | 🔴 CRITIQUE |
| | US 3.1 | Inscription utilisateur | 5 | P0 |
| | US 3.2 | Gestion des profils | 5 | P0 |
| **ÉPIQUE 9 : Performance** | | | **24** | 🔴 CRITIQUE |
| | US 9.1 | Optimisation des performances | 8 | P0 |
| | US Perf 1 | Page < 2s | 8 | P0 |
| | US Perf 2 | Optimisation médias | 8 | P0 |
| **ÉPIQUE 12 : Accessibilité** | | | **21** | 🟡 HAUTE |
| | US Access 1 | WCAG 2.1 AA | 13 | P0 |
| | US Access 2 | Tests accessibilité | 8 | P1 |
| **ÉPIQUE 12 : Localisation** | | | **18** | 🟡 HAUTE |
| | US i18n 1 | Multilinguisme FR/AR | 13 | P0 |
| | US i18n 2 | Contenu localisé | 5 | P1 |

### 🎯 Objectifs Sprint 2

**Fonctionnalités Métier :**
- [ ] Admin peut créer/modifier/supprimer des biens immobiliers
- [ ] Upload multiple de photos avec prévisualisation
- [ ] Génération automatique de QR Code par bien
- [ ] Import/Export CSV pour gestion massive
- [ ] Recherche avancée avec filtres (prix, surface, localisation)
- [ ] Carte interactive avec marqueurs de biens
- [ ] Géolocalisation utilisateur

**Expérience Utilisateur :**
- [ ] Site bilingue FR/AR avec support RTL
- [ ] Interface accessible WCAG 2.1 AA
- [ ] Performance < 2s sur toutes les pages
- [ ] Images optimisées (WebP, lazyload, CDN)

**Technique :**
- [ ] Base de données MongoDB avec schémas Property et User
- [ ] API REST complète pour CRUD biens
- [ ] Tests unitaires et E2E sur parcours critiques
- [ ] Documentation API Swagger

### 📦 Livrables Sprint 2

✅ **Fonctionnel :**
- Application web bilingue (FR/AR) avec RTL
- CRUD complet des biens immobiliers
- Recherche multi-critères + carte interactive
- Interface admin opérationnelle

✅ **Technique :**
- API REST documentée (Swagger)
- Tests E2E couvrant login + CRUD biens
- Performance Lighthouse > 90
- Accessibilité validée (axe-core)

✅ **Documentation :**
- Guide admin pour gestion des biens
- Documentation API mise à jour
- Rapport de tests accessibilité

---

## 🎨 SPRINT 3 : Engagement, IA & Back-office

**Durée :** 2 semaines  
**Points :** 86 points  
**Objectif :** Expérience utilisateur complète + IA + analytics + QR codes

### 📋 User Stories Sprint 3

| Épique | US | Description | Points | Priorité |
|--------|-----|-------------|--------|----------|
| **ÉPIQUE 4 : UX Avancée** | | | **26** | 🟡 HAUTE |
| | US 4.1 | Gestion des favoris | 5 | P0 |
| | US 4.2 | Alertes personnalisées | 8 | P1 |
| | US 4.3 | Messagerie interne | 13 | P1 |
| **ÉPIQUE 5 : Rendez-vous** | | | **16** | 🟡 HAUTE |
| | US 5.1 | Prise de rendez-vous | 8 | P0 |
| | US 5.2 | Gestion calendrier admin | 8 | P0 |
| **ÉPIQUE 6 : IA** | | | **39** | 🟢 MOYENNE |
| | US 6.1 | Moteur de recommandation IA | 13 | P1 |
| | US 6.2 | Chatbot immobilier IA | 13 | P1 |
| | US 6.3 | Recherche par image | 13 | P2 |
| **ÉPIQUE 7 : QR Codes** | | | **13** | 🟡 HAUTE |
| | US 7.1 | Génération de QR Codes | 5 | P0 |
| | US 7.2 | Tracking des scans QR | 8 | P1 |
| **ÉPIQUE 8 : Back-office** | | | **13** | 🟡 HAUTE |
| | US 8.1 | Dashboard administrateur | 8 | P0 |
| | US 8.2 | Gestion du contenu | 5 | P1 |

### 🎯 Objectifs Sprint 3

**Engagement Utilisateur :**
- [ ] Système de favoris avec notifications
- [ ] Alertes email/SMS pour nouveaux biens
- [ ] Messagerie temps réel (Socket.io)
- [ ] Prise de rendez-vous avec créneaux disponibles
- [ ] Synchronisation Google Calendar

**Intelligence Artificielle :**
- [ ] Recommandations personnalisées basées sur historique
- [ ] Chatbot conversationnel (OpenAI/Anthropic)
- [ ] Recherche visuelle par upload d'image

**Analytics & Offline :**
- [ ] QR Code unique par bien avec tracking
- [ ] Dashboard admin avec KPIs temps réel
- [ ] Statistiques de scans géolocalisées
- [ ] Export rapports PDF/Excel

**Technique :**
- [ ] WebSocket pour chat et notifications
- [ ] Redis pour cache et sessions
- [ ] Intégration API IA (OpenAI, Google Vision)
- [ ] Génération QR avec logo personnalisable

### 📦 Livrables Sprint 3

✅ **Fonctionnel :**
- Système complet de favoris + alertes
- Messagerie interne temps réel
- Calendrier de rendez-vous synchronisé
- Chatbot opérationnel
- QR codes générés automatiquement

✅ **Analytics :**
- Dashboard admin avec métriques clés
- Tracking complet des interactions
- Export des statistiques

✅ **Technique :**
- WebSocket configuré et testé
- Intégrations IA fonctionnelles
- Redis déployé pour cache
- Tests E2E sur parcours complets

---

## 🔒 SPRINT 4 : Industrialisation, Sécurité & Qualité

**Durée :** 2 semaines  
**Points :** 82 points  
**Objectif :** Production fiable, sécurisée, scalable + tests exhaustifs

### 📋 User Stories Sprint 4

| Épique | US | Description | Points | Priorité |
|--------|-----|-------------|--------|----------|
| **ÉPIQUE 3 : Rôles** | | | **5** | 🔴 CRITIQUE |
| | US 3.3 | Gestion rôles & permissions | 5 | P0 |
| **ÉPIQUE 9 : Sécurité** | | | **8** | 🔴 CRITIQUE |
| | US 9.2 | Sécurité renforcée | 8 | P0 |
| **ÉPIQUE 10 : DevOps** | | | **68** | 🔴 CRITIQUE |
| | US DevOps 11 | Conteneurisation Docker | 8 | P0 |
| | US DevOps 12 | Orchestration Kubernetes | 13 | P0 |
| | US DevOps 13 | Sauvegardes automatisées | 13 | P0 |
| | US DevOps 14 | Monitoring Prod | 13 | P0 |
| | US DevOps 15 | Déploiement Canary | 8 | P1 |
| | US DevOps 16 | Pipeline Prod + Rollback | 13 | P0 |
| **ÉPIQUE 11 : Sécurité Avancée** | | | **42** | 🔴 CRITIQUE |
| | US Secu 1 | HTTPS & HSTS | 5 | P0 |
| | US Secu 2 | Protection attaques | 8 | P0 |
| | US Secu 3 | Audits automatiques | 8 | P0 |
| | US Secu 4 | RGPD complet | 8 | P0 |
| | US Secu 5 | Journalisation | 5 | P0 |
| | US Secu 6 | API sécurisée | 8 | P0 |
| **ÉPIQUE 13 : Tests** | | | **36** | 🔴 CRITIQUE |
| | US Test 1 | Tests performance (JMeter) | 8 | P0 |
| | US Test 2 | Tests sécurité (OWASP ZAP) | 5 | P0 |
| | US Test 3 | Tests UI/UX (Percy) | 5 | P1 |
| | US Test 4 | Couverture 80% | 8 | P0 |
| | US Test 5 | Documentation API | 5 | P0 |
| | US Test 6 | Recette finale | 5 | P0 |

### 🎯 Objectifs Sprint 4

**Infrastructure DevOps :**
- [ ] Conteneurisation complète (Docker + docker-compose)
- [ ] Déploiement Kubernetes avec Helm charts
- [ ] Autoscaling horizontal (HPA)
- [ ] Sauvegardes DB + médias toutes les 6h
- [ ] Monitoring Prometheus + Grafana
- [ ] Pipeline CI/CD complet avec rollback < 15min
- [ ] Déploiement Canary avec feature flags

**Sécurité Renforcée :**
- [ ] HTTPS obligatoire + HSTS (SSL Labs A+)
- [ ] WAF (Cloudflare ou mod_security)
- [ ] Rate limiting (100 req/min/IP)
- [ ] Protection XSS, CSRF, injections SQL
- [ ] Conformité RGPD complète (droit à l'oubli, export données)
- [ ] Audits OWASP ZAP automatisés
- [ ] Journalisation centralisée (ELK/Loki)
- [ ] API sécurisée (JWT, refresh tokens, scopes)

**Tests & Qualité :**
- [ ] Tests de charge (1000 users simultanés)
- [ ] Tests sécurité automatisés (OWASP ZAP, Nuclei)
- [ ] Tests visuels de régression (Percy/Chromatic)
- [ ] Couverture de code ≥ 80%
- [ ] Documentation API Swagger complète
- [ ] Recette client avec checklist CdC signée

### 📦 Livrables Sprint 4

✅ **Infrastructure :**
- Application conteneurisée et orchestrée (K8s)
- CI/CD complet avec rollback automatique
- Monitoring temps réel (Prometheus + Grafana)
- Sauvegardes automatiques testées

✅ **Sécurité :**
- Score SSL Labs A+
- Conformité RGPD validée
- Audits de sécurité automatisés
- Journalisation complète (90 jours)

✅ **Qualité :**
- Couverture tests ≥ 80%
- Tests de charge validés (1000 users)
- Rapport OWASP ZAP sans vulnérabilités critiques
- Documentation API complète

✅ **Production :**
- Application déployée en production
- Formation admin réalisée
- Recette client signée
- Handover documentation complète

---

## 📊 RÉSUMÉ DES 3 SPRINTS (2-4)

| Sprint | Durée | Points | Objectif Principal | Statut |
|--------|-------|--------|-------------------|--------|
| **Sprint 1** | 2 sem | - | Auth + Infrastructure | ✅ **TERMINÉ** |
| **Sprint 2** | 2 sem | 88 | CRUD Biens + Recherche + UX | 🔄 **EN COURS** |
| **Sprint 3** | 2 sem | 86 | IA + Engagement + Analytics | ⏳ **À VENIR** |
| **Sprint 4** | 2 sem | 82 | DevOps + Sécurité + Tests | ⏳ **À VENIR** |
| **TOTAL** | **6 sem** | **256 pts** | **100% CdC livré** | - |

---

## 🔗 DÉPENDANCES ENTRE SPRINTS

| Dépendance | Sprint Source → Cible | Explication |
|------------|----------------------|-------------|
| **US 1.1 → US 7.1** | Sprint 2 → Sprint 3 | QR auto-généré nécessite bien créé |
| **US 3.1 → US 4.1** | Sprint 1 → Sprint 3 | Favoris nécessite utilisateur inscrit |
| **US 2.2 → US 2.3** | Sprint 2 (même sprint) | Géoloc dépend de la carte |
| **US DevOps 11 → US DevOps 12** | Sprint 4 (même sprint) | K8s nécessite Docker |
| **US 9.1 → US Perf 1/2** | Sprint 2 (même sprint) | Optimisations liées |
| **US Secu 6 → US Test 5** | Sprint 4 (même sprint) | Doc API nécessite API sécurisée |

---

## 🎯 CRITÈRES DE SUCCÈS GLOBAUX

### Sprint 2 (MVP Fonctionnel)
- ✅ Admin peut gérer 100% des biens (CRUD + CSV)
- ✅ Utilisateurs peuvent rechercher et localiser biens
- ✅ Site < 2s, accessible WCAG AA, bilingue FR/AR
- ✅ Tests E2E couvrant parcours critiques

### Sprint 3 (Engagement & IA)
- ✅ Utilisateurs engagés (favoris, alertes, RDV, chat)
- ✅ IA opérationnelle (recommandations + chatbot)
- ✅ QR codes générés avec tracking
- ✅ Dashboard admin avec analytics temps réel

### Sprint 4 (Production)
- ✅ Application déployée sur K8s avec monitoring
- ✅ Sécurité validée (HTTPS, RGPD, WAF, audits)
- ✅ Tests exhaustifs (80% couverture, perf, sécu)
- ✅ Recette client signée + formation admin

---

## 📅 CALENDRIER PRÉVISIONNEL

| Sprint | Dates (Exemple) | Jalons Clés |
|--------|-----------------|-------------|
| **Sprint 1** | ✅ Sem 1-2 | Authentification + Base |
| **Sprint 2** | 🔄 Sem 3-4 | CRUD Biens + Recherche |
| **Sprint 3** | ⏳ Sem 5-6 | IA + Engagement |
| **Sprint 4** | ⏳ Sem 7-8 | DevOps + Production |
| **Buffer** | Sem 9 | Corrections post-recette |

---

## 🚀 PROCHAINES ACTIONS (Sprint 2)

### Semaine 1 (Sprint 2)
**Jour 1-2 : Setup & Architecture**
- [ ] Créer schémas MongoDB (Property, User, Category)
- [ ] Setup Multer pour upload photos
- [ ] Configurer QR Code library (qrcode)
- [ ] Setup Cloudinary/AWS S3 pour stockage images

**Jour 3-5 : US 1.1 (Ajouter bien)**
- [ ] Formulaire admin avec validation
- [ ] API POST /api/properties avec upload photos
- [ ] Génération QR Code automatique
- [ ] Tests E2E ajout bien

### Semaine 2 (Sprint 2)
**Jour 1-2 : US 1.2, 1.3, 1.4**
- [ ] Modifier/Supprimer/Archiver bien
- [ ] Import/Export CSV avec validation

**Jour 3-4 : US 2.1, 2.2 (Recherche)**
- [ ] Filtres multi-critères (prix, surface, ville)
- [ ] Intégration carte (Leaflet/Mapbox)

**Jour 5 : Performance & i18n**
- [ ] Optimisation images (WebP, lazyload)
- [ ] Configuration next-i18next (FR/AR)

---

## 📝 CHECKLIST SPRINT 2 (Actuel)

### Développement
- [ ] CRUD biens complet (US 1.1, 1.2, 1.3)
- [ ] Import/Export CSV (US 1.4)
- [ ] Recherche multi-critères (US 2.1)
- [ ] Carte interactive (US 2.2)
- [ ] Géolocalisation (US 2.3)
- [ ] Inscription/Profil (US 3.1, 3.2)
- [ ] Performance < 2s (US 9.1, Perf 1, Perf 2)
- [ ] Accessibilité WCAG AA (US Access 1, 2)
- [ ] i18n FR/AR (US i18n 1, 2)

### Tests
- [ ] Tests unitaires sur CRUD biens
- [ ] Tests E2E Playwright (login + CRUD)
- [ ] Tests accessibilité (axe-core)
- [ ] Tests performance (Lighthouse > 90)

### Documentation
- [ ] Swagger API mis à jour
- [ ] Guide admin pour gestion biens
- [ ] README i18n pour traductions

### DevOps
- [ ] CI/CD avec tests automatisés
- [ ] Déploiement staging fonctionnel
- [ ] Variables d'environnement configurées

---

## 🔗 DOCUMENTS ASSOCIÉS

- [Backlog Complet](./BACKLOG-COMPLET-USER-STORIES.md)
- [Diagrammes UML](./class-diagram.puml)
- [Diagrammes Séquence](./connexion-sequence.puml)
- [Index Documentation](./INDEX.md)
- [Guide Docker](./DOCKER-GUIDE.md)
- [Guide Déploiement](./DEPLOYMENT_SUCCESS.md)

---

**Version :** 1.0  
**Dernière mise à jour :** 15 novembre 2025  
**Statut :** Sprint 2 en cours | Sprint 3-4 planifiés  
**Équipe :** 4 devs + 1 QA + 1 DevOps
