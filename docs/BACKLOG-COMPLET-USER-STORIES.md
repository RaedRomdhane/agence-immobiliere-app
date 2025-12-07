# BACKLOG COMPLET – PLATEFORME IMMOBILIÈRE

> **Regroupé par Épique – 100 % conforme au Cahier des Charges**  
> **Rôle principal : admin** (gestion + création)  
> **Langues : FR / AR (RTL)**  
> **Pays : Tunisie**  
> **Total : 13 Épiques | 60+ User Stories**

---

## 📋 Table des Matières

1. [Épique 1 : Gestion des Biens Immobiliers](#épique-1--gestion-des-biens-immobiliers)
2. [Épique 2 : Recherche et Découverte](#épique-2--recherche-et-découverte)
3. [Épique 3 : Gestion des Utilisateurs et Rôles](#épique-3--gestion-des-utilisateurs-et-rôles)
4. [Épique 4 : Expérience Utilisateur Avancée](#épique-4--expérience-utilisateur-avancée)
5. [Épique 5 : Gestion des Rendez-vous](#épique-5--gestion-des-rendez-vous)
6. [Épique 6 : Fonctionnalités IA & Innovation](#épique-6--fonctionnalités-ia--innovation)
7. [Épique 7 : QR Codes & Analytics Offline](#épique-7--qr-codes--analytics-offline)
8. [Épique 8 : Back-office & Analytics](#épique-8--back-office--analytics)
9. [Épique 9 : Performance & Sécurité](#épique-9--performance--sécurité)
10. [Épique 10 : DevOps & Infrastructure](#épique-10--devops--infrastructure)
11. [Épique 11 : Sécurité Avancée & Conformité](#épique-11--sécurité-avancée--conformité)
12. [Épique 12 : Accessibilité & Localisation](#épique-12--accessibilité--localisation)
13. [Épique 13 : Tests & Qualité](#épique-13--tests--qualité)

---

## ÉPIQUE 1 : Gestion des Biens Immobiliers

### US 1.1 : Ajouter un nouveau bien

**En tant qu'** admin  
**Je veux** pouvoir ajouter un nouveau bien avec photos et caractéristiques  
**Afin de** le proposer à la vente ou location

**Critères d'acceptation :**
- [ ] Formulaire avec tous les champs obligatoires (titre, type, prix, surface, etc.)
- [ ] Upload multiple de photos avec prévisualisation
- [ ] Génération automatique d'un QR Code pour le bien
- [ ] Validation des données avant sauvegarde
- [ ] Notification de confirmation après ajout

---

### US 1.2 : Modifier un bien existant

**En tant qu'** admin  
**Je veux** modifier les informations d'un bien existant  
**Afin de** corriger ou mettre à jour les informations

**Critères d'acceptation :**
- [ ] Accès à la fiche modification depuis le dashboard admin
- [ ] Conservation de l'historique des modifications
- [ ] Mise à jour en temps réel des informations
- [ ] Notification aux utilisateurs ayant mis en favori

---

### US 1.3 : Supprimer/Archiver un bien

**En tant qu'** admin  
**Je veux** supprimer ou archiver un bien  
**Afin de** retirer les annonces vendues/louées ou obsolètes

**Critères d'acceptation :**
- [ ] Option de suppression définitive ou archivage
- [ ] Confirmation avant suppression
- [ ] Notification aux utilisateurs concernés
- [ ] Exclusion des biens supprimés des recherches

---

### US 1.4 : Import/Export CSV des biens

**En tant qu'** admin  
**Je veux** importer et exporter des biens via CSV  
**Afin de** gérer massivement le catalogue

**Critères d'acceptation :**
- [ ] Template CSV téléchargeable avec format défini
- [ ] Validation des données lors de l'import
- [ ] Rapport d'import avec erreurs éventuelles
- [ ] Export avec filtres personnalisables

---

## ÉPIQUE 2 : Recherche et Découverte

### US 2.1 : Recherche multi-critères

**En tant qu'** utilisateur  
**Je veux** rechercher des biens avec plusieurs filtres  
**Afin de** trouver rapidement des biens correspondant à mes critères

**Critères d'acceptation :**
- [ ] Filtres par prix, surface, nombre de pièces, localisation, etc...
- [ ] Recherche texte dans le titre et description
- [ ] Résultats en temps réel pendant la saisie
- [ ] Compteur de résultats
- [ ] Sauvegarde des critères de recherche

---

### US 2.2 : Carte interactive

**En tant qu'** utilisateur  
**Je veux** voir les biens sur une carte interactive  
**Afin de** visualiser leur localisation géographique

**Critères d'acceptation :**
- [ ] Affichage des biens sous forme de marqueurs sur la carte
- [ ] Clustering des marqueurs selon le zoom
- [ ] Filtrage des biens directement sur la carte
- [ ] Recherche par rayon autour d'un point
- [ ] Intégration des transports et services à proximité

---

### US 2.3 : Recherche par géolocalisation

**En tant qu'** utilisateur  
**Je veux** trouver des biens près de ma position  
**Afin de** découvrir des opportunités à proximité

**Critères d'acceptation :**
- [ ] Demande d'autorisation de géolocalisation
- [ ] Recherche automatique autour de la position
- [ ] Ajustement du rayon de recherche
- [ ] Affichage de la distance pour chaque bien

---

## ÉPIQUE 3 : Gestion des Utilisateurs et Rôles

### US 3.1 : Inscription utilisateur

**En tant que** visiteur  
**Je veux** créer un compte utilisateur  
**Afin d'** accéder aux fonctionnalités personnalisées

**Critères d'acceptation :**
- [ ] Formulaire d'inscription avec validation
- [ ] Vérification de l'email
- [ ] Respect RGPD (consentement, politique de confidentialité)
- [ ] Connexion automatique après inscription

---

### US 3.2 : Gestion des profils

**En tant qu'** utilisateur  
**Je veux** gérer mon profil et mes préférences  
**Afin de** personnaliser mon expérience

**Critères d'acceptation :**
- [ ] Édition des informations personnelles
- [ ] Gestion des préférences de recherche
- [ ] Changement de mot de passe sécurisé
- [ ] Téléchargement des données personnelles (RGPD)

---

### US 3.3 : Gestion des rôles et permissions

**En tant qu'** admin  
**Je veux** gérer les rôles et permissions des utilisateurs  
**Afin de** contrôler l'accès aux fonctionnalités

**Critères d'acceptation :**
- [ ] Attribution des rôles (client, admin)
- [ ] Interface de gestion des permissions
- [ ] Audit des actions sensibles
- [ ] Suspension temporaire de comptes

---

## ÉPIQUE 4 : Expérience Utilisateur Avancée

### US 4.1 : Gestion des favoris

**En tant qu'** utilisateur  
**Je veux** sauvegarder des biens en favoris  
**Afin de** les retrouver facilement plus tard

**Critères d'acceptation :**
- [ ] Ajout/retrait en un clic
- [ ] Liste organisable de favoris
- [ ] Partage de la liste de favoris
- [ ] Notifications de modification des biens favoris

---

### US 4.2 : Alertes personnalisées

**En tant qu'** utilisateur  
**Je veux** créer des alertes pour de nouveaux biens  
**Afin d'** être informé des nouvelles opportunités

**Critères d'acceptation :**
- [ ] Définition des critères de l'alerte
- [ ] Choix du canal (email, SMS)
- [ ] Fréquence des notifications
- [ ] Désabonnement en un clic

---

### US 4.3 : Messagerie interne

**En tant qu'** utilisateur  
**Je veux** contacter un admin via messagerie interne  
**Afin de** discuter d'un bien spécifique

**Critères d'acceptation :**
- [ ] Interface de chat en temps réel
- [ ] Historique des conversations
- [ ] Notifications de nouveaux messages
- [ ] Partage de documents dans la conversation

---

## ÉPIQUE 5 : Gestion des Rendez-vous

### US 5.1 : Prise de rendez-vous

**En tant qu'** utilisateur  
**Je veux** prendre rendez-vous pour visiter un bien  
**Afin de** planifier une visite

**Critères d'acceptation :**
- [ ] Voir les créneaux disponibles de l'admin
- [ ] Sélection d'un créneau horaire
- [ ] Confirmation immédiate du rendez-vous
- [ ] Rappel automatique avant le rendez-vous

---

### US 5.2 : Gestion du calendrier admin

**En tant qu'** admin  
**Je veux** gérer mon calendrier de rendez-vous  
**Afin d'** organiser mes visites

**Critères d'acceptation :**
- [ ] Interface calendrier avec vues jour/semaine/mois
- [ ] Blocage de créneaux indisponibles
- [ ] Synchronisation avec Google Calendar
- [ ] Notifications des nouvelles demandes

---

## ÉPIQUE 6 : Fonctionnalités IA & Innovation

### US 6.1 : Moteur de recommandation IA

**En tant qu'** utilisateur  
**Je veux** recevoir des recommandations personnalisées  
**Afin de** découvrir des biens adaptés à mes goûts

**Critères d'acceptation :**
- [ ] Algorithmes basés sur l'historique de navigation
- [ ] Suggestions sur la page d'accueil
- [ ] Explication des recommandations
- [ ] Feedback sur la pertinence des suggestions

---

### US 6.2 : Chatbot immobilier IA

**En tant qu'** utilisateur  
**Je veux** interagir avec un chatbot pour obtenir des informations  
**Afin d'** avoir des réponses immédiates à mes questions

**Critères d'acceptation :**
- [ ] Interface de chat accessible sur toutes les pages
- [ ] Réponses contextuelles sur les biens
- [ ] Transfert vers un admin si nécessaire
- [ ] Historique de la conversation

---

### US 6.3 : Recherche par image

**En tant qu'** utilisateur  
**Je veux** rechercher des biens similaires en uploadant une photo  
**Afin de** trouver des biens avec des caractéristiques visuelles similaires

**Critères d'acceptation :**
- [ ] Upload d'image depuis l'appareil ou URL
- [ ] Analyse des caractéristiques visuelles
- [ ] Retour des biens similaires avec score de similarité
- [ ] Filtrage des résultats par similarité

---

## ÉPIQUE 7 : QR Codes & Analytics Offline

### US 7.1 : Génération de QR Codes

**En tant que** système  
**Je veux** générer un QR Code unique pour chaque bien  
**Afin de** permettre un accès rapide depuis supports physiques

**Critères d'acceptation :**
- [ ] Génération automatique à la création du bien
- [ ] QR Code personnalisable avec logo
- [ ] Téléchargement en différents formats
- [ ] Lien court associé au QR Code

---

### US 7.2 : Tracking des scans QR Code

**En tant qu'** admin  
**Je veux** suivre les statistiques de scans des QR Codes  
**Afin de** mesurer l'efficacité des campagnes offline

**Critères d'acceptation :**
- [ ] Compteur de scans par bien
- [ ] Géolocalisation des scans
- [ ] Historique temporel des scans
- [ ] Export des données statistiques

---

## ÉPIQUE 8 : Back-office & Analytics

### US 8.1 : Dashboard administrateur

**En tant qu'** admin  
**Je veux** un tableau de bord avec les indicateurs clés  
**Afin de** suivre la performance de la plateforme

**Critères d'acceptation :**
- [ ] Métriques en temps réel (visites, contacts, conversions)
- [ ] Graphiques évolutifs et filtrables
- [ ] Alertes sur les anomalies
- [ ] Export des rapports en PDF/Excel

---

### US 8.2 : Gestion du contenu

**En tant qu'** admin  
**Je veux** gérer tout le contenu du site  
**Afin de** maintenir le site à jour et cohérent

**Critères d'acceptation :**
- [ ] Interface centralisée de gestion
- [ ] Prévisualisation des modifications
- [ ] Historique des changements
- [ ] Publication planifiée

---

## ÉPIQUE 9 : Performance & Sécurité

### US 9.1 : Optimisation des performances

**En tant qu'** utilisateur  
**Je veux** une expérience de navigation rapide  
**Afin de** ne pas perdre de temps en chargements

**Critères d'acceptation :**
- [ ] Temps de chargement < 2 secondes pour la page d'accueil
- [ ] Lazyloading des images
- [ ] Cache efficace des données
- [ ] Compression des assets

---

### US 9.2 : Sécurité renforcée

**En tant qu'** admin  
**Je veux** garantir la sécurité des données utilisateurs  
**Afin de** protéger la confidentialité et prévenir les attaques

**Critères d'acceptation :**
- [ ] HTTPS obligatoire sur toutes les pages
- [ ] Protection contre XSS, CSRF, injections SQL
- [ ] Audit de sécurité automatique
- [ ] Journalisation des tentatives d'intrusion

---

### US Perf 1 : Page < 2s

**En tant qu'** utilisateur  
**Je veux** que la page d'accueil charge en moins de 2 secondes  
**Afin d'** avoir une expérience fluide

**Critères d'acceptation :**
- [ ] TTFB < 600ms
- [ ] FCP < 1.2s
- [ ] Lighthouse Performance > 90
- [ ] Testé sur 3G et 4G

---

### US Perf 2 : Optimisation médias

**En tant qu'** utilisateur  
**Je veux** que les images chargent rapidement  
**Afin de** ne pas attendre

**Critères d'acceptation :**
- [ ] Conversion auto en WebP
- [ ] Lazyloading + placeholder LQIP
- [ ] CDN (Cloudflare)
- [ ] Cache Redis (24h)

---

## ÉPIQUE 10 : DevOps & Infrastructure

### US DevOps 11 : Conteneurisation Docker

**En tant qu'** équipe de développement  
**Je veux** conteneuriser l'application avec Docker  
**Afin de** garantir des environnements reproductibles

**Critères d'acceptation :**
- [ ] Dockerfile et docker-compose.yml fonctionnels
- [ ] Images optimisées < 200 Mo
- [ ] Lancement local en une commande
- [ ] Variables d'environnement injectées

---

### US DevOps 12 : Orchestration Kubernetes

**En tant qu'** équipe d'opérations  
**Je veux** déployer sur Kubernetes  
**Afin d'** assurer scalabilité et haute disponibilité

**Critères d'acceptation :**
- [ ] Helm chart versionné
- [ ] Autoscaling horizontal (HPA)
- [ ] Ingress avec TLS
- [ ] Health checks (liveness/readiness)

---

### US DevOps 13 : Sauvegardes automatisées

**En tant qu'** administrateur système  
**Je veux** des sauvegardes automatiques de la base et des médias  
**Afin de** pouvoir restaurer en cas de panne

**Critères d'acceptation :**
- [ ] Sauvegarde DB + médias toutes les 6h
- [ ] Rétention 30 jours
- [ ] Restauration testée mensuellement
- [ ] Alertes en cas d'échec

---

### US DevOps 14 : Monitoring Prod

**En tant qu'** équipe d'opérations  
**Je veux** surveiller les performances et erreurs en production  
**Afin de** réagir rapidement aux incidents

**Critères d'acceptation :**
- [ ] Prometheus + Grafana déployés
- [ ] Métriques : CPU, RAM, latence, erreurs 5xx
- [ ] Alertes Slack/email si latence > 1s
- [ ] Dashboard temps réel

---

### US DevOps 15 : Déploiement Canary

**En tant qu'** équipe de développement  
**Je veux** déployer progressivement les nouvelles versions  
**Afin de** limiter l'impact en cas de bug

**Critères d'acceptation :**
- [ ] Feature flags intégrés
- [ ] Rollout à 10 % des utilisateurs
- [ ] Rollback automatique si erreurs > 5 %
- [ ] Monitoring spécifique au canary

---

### US DevOps 16 : Pipeline Prod + Rollback

**En tant qu'** équipe de développement  
**Je veux** un pipeline de production sécurisé  
**Afin de** livrer en toute confiance

**Critères d'acceptation :**
- [ ] Approbation manuelle avant déploiement
- [ ] Health checks post-déploiement
- [ ] Rollback en < 15 min
- [ ] Sauvegarde DB avant déploiement

---

## ÉPIQUE 11 : Sécurité Avancée & Conformité

### US Secu 1 : HTTPS & HSTS

**En tant qu'** admin  
**Je veux** forcer le HTTPS sur tout le site  
**Afin de** sécuriser les communications

**Critères d'acceptation :**
- [ ] Certificat TLS auto-renew (Let's Encrypt)
- [ ] HSTS activé (1 an)
- [ ] Redirection HTTP → HTTPS
- [ ] Score SSL Labs A+

---

### US Secu 2 : Protection attaques

**En tant qu'** admin  
**Je veux** protéger contre les attaques courantes  
**Afin d'** éviter les compromissions

**Critères d'acceptation :**
- [ ] Rate limiting (100 req/min/IP)
- [ ] WAF (Cloudflare ou mod_security)
- [ ] CSP, CSRF tokens, SameSite cookies
- [ ] Protection XSS (escape output)

---

### US Secu 3 : Audits auto

**En tant qu'** admin  
**Je veux** des audits de sécurité réguliers  
**Afin de** détecter les vulnérabilités

**Critères d'acceptation :**
- [ ] OWASP ZAP dans le pipeline CI
- [ ] Scan hebdomadaire automatisé
- [ ] Rapport PDF généré
- [ ] 0 vulnérabilité critique

---

### US Secu 4 : RGPD complet

**En tant qu'** utilisateur  
**Je veux** contrôler mes données personnelles  
**Afin de** respecter mes droits

**Critères d'acceptation :**
- [ ] Bannière de consentement cookie
- [ ] Droit à l'oubli (suppression totale)
- [ ] Export données en JSON
- [ ] Journalisation des consentements

---

### US Secu 5 : Journalisation

**En tant qu'** admin  
**Je veux** tracer les actions sensibles  
**Afin d'** auditer en cas d'incident

**Critères d'acceptation :**
- [ ] Logs des connexions, modifications, suppressions
- [ ] Stockage centralisé (ELK ou Loki)
- [ ] Rétention 90 jours
- [ ] Recherche par utilisateur/action

---

### US Secu 6 : API sécurisée

**En tant que** développeur tiers  
**Je veux** une API sécurisée et documentée  
**Afin d'** intégrer d'autres systèmes

**Critères d'acceptation :**
- [ ] JWT avec refresh token
- [ ] Scopes par rôle (read/write/admin)
- [ ] Rate limit 100/min
- [ ] Swagger avec exemples authentifiés

---

## ÉPIQUE 12 : Accessibilité & Localisation

### US Access 1 : WCAG 2.1 AA

**En tant qu'** utilisateur en situation de handicap  
**Je veux** naviguer sans obstacle  
**Afin d'** accéder à toutes les fonctionnalités

**Critères d'acceptation :**
- [ ] Contraste ≥ 4.5:1
- [ ] Navigation clavier complète
- [ ] Labels ARIA sur tous les éléments
- [ ] Textes alternatifs sur images

---

### US Access 2 : Tests accessibilité

**En tant qu'** équipe QA  
**Je veux** valider l'accessibilité automatiquement  
**Afin de** garantir la conformité

**Critères d'acceptation :**
- [ ] Lighthouse Accessibility > 90
- [ ] Tests axe-core dans CI
- [ ] Tests manuels avec lecteur d'écran
- [ ] Rapport d'accessibilité PDF

---

### US i18n 1 : Multilinguisme FR/AR

**En tant qu'** utilisateur tunisien  
**Je veux** utiliser le site en arabe ou français  
**Afin de** comprendre parfaitement le contenu

**Critères d'acceptation :**
- [ ] Support RTL (arabe)
- [ ] Traduction dynamique (next-i18next)
- [ ] Formats date, heure, devise adaptés
- [ ] Fallback en français

---

### US i18n 2 : Contenu localisé

**En tant qu'** admin  
**Je veux** publier du contenu dans les deux langues  
**Afin d'** atteindre tous les clients

**Critères d'acceptation :**
- [ ] Champs multilingues dans les biens
- [ ] Éditeur WYSIWYG avec traduction
- [ ] Prévisualisation par langue
- [ ] URL localisées (/fr, /ar)

---

## ÉPIQUE 13 : Tests & Qualité

### US Test 1 : Tests performance

**En tant qu'** équipe QA  
**Je veux** simuler 1000 utilisateurs simultanés  
**Afin de** valider la scalabilité

**Critères d'acceptation :**
- [ ] JMeter scripté
- [ ] 1000 users → réponse moyenne < 1s
- [ ] 0 erreur 5xx
- [ ] Rapport généré

---

### US Test 2 : Tests sécurité

**En tant qu'** équipe sécurité  
**Je veux** scanner les vulnérabilités  
**Afin de** livrer un produit sécurisé

**Critères d'acceptation :**
- [ ] OWASP ZAP + Nuclei
- [ ] 0 vulnérabilité critique
- [ ] Rapport exporté
- [ ] Scan dans CI/CD

---

### US Test 3 : Tests UI/UX

**En tant qu'** équipe QA  
**Je veux** détecter les régressions visuelles  
**Afin de** maintenir la cohérence

**Critères d'acceptation :**
- [ ] Percy ou Chromatic intégré
- [ ] Tests sur mobile + desktop
- [ ] Seuil de différence < 0.1 %
- [ ] Approbation manuelle

---

### US Test 4 : Couverture 80 %

**En tant qu'** équipe de développement  
**Je veux** une couverture de code de 80 %  
**Afin de** limiter les bugs

**Critères d'acceptation :**
- [ ] Jest + Supertest + Cypress
- [ ] Rapport Clover/Sonarqube
- [ ] Couverture ≥ 80 % sur code critique
- [ ] Échec CI si < 75 %

---

### US Test 5 : Documentation API

**En tant que** développeur tiers  
**Je veux** une documentation API claire  
**Afin d'** intégrer facilement

**Critères d'acceptation :**
- [ ] Swagger UI accessible
- [ ] Mise à jour auto à chaque déploiement
- [ ] Exemples de requêtes/réponses
- [ ] Authentification testée

---

### US Test 6 : Recette finale

**En tant qu'** équipe projet  
**Je veux** valider 100 % du Cahier des Charges  
**Afin de** livrer un produit conforme

**Critères d'acceptation :**
- [ ] Checklist CdC signée
- [ ] Tests d'acceptation client passés
- [ ] Documentation technique livrée
- [ ] Formation admin

---

## 📊 Récapitulatif

| Épique | Nombre US | Priorité | Estimation |
|--------|-----------|----------|------------|
| 1. Gestion Biens | 4 | 🔴 CRITIQUE | 3 sprints |
| 2. Recherche | 3 | 🔴 CRITIQUE | 2 sprints |
| 3. Utilisateurs | 3 | 🔴 CRITIQUE | 2 sprints |
| 4. UX Avancée | 3 | 🟡 HAUTE | 2 sprints |
| 5. Rendez-vous | 2 | 🟡 HAUTE | 2 sprints |
| 6. IA | 3 | 🟢 MOYENNE | 3 sprints |
| 7. QR Codes | 2 | 🟢 MOYENNE | 1 sprint |
| 8. Analytics | 2 | 🟡 HAUTE | 2 sprints |
| 9. Performance | 4 | 🔴 CRITIQUE | 2 sprints |
| 10. DevOps | 6 | 🔴 CRITIQUE | 4 sprints |
| 11. Sécurité | 6 | 🔴 CRITIQUE | 3 sprints |
| 12. Accessibilité | 4 | 🟡 HAUTE | 2 sprints |
| 13. Tests | 6 | 🔴 CRITIQUE | 3 sprints |
| **TOTAL** | **48 US** | - | **31 sprints** |

---

## 🎯 Roadmap Recommandée

### **Phase 1 : MVP Fonctionnel** (Sprints 1-10)
- ✅ Épique 1, 2, 3 (CRUD + Recherche + Auth)
- ✅ US Secu 1, 2, 4 (HTTPS, RGPD)
- ✅ US DevOps 11, 13 (Docker, Backups)

### **Phase 2 : Fonctionnalités Premium** (Sprints 11-18)
- ✅ Épique 4, 5, 8 (Favoris, RDV, Analytics)
- ✅ Épique 9 (Performance)
- ✅ US DevOps 14, 16 (Monitoring, CI/CD)

### **Phase 3 : Innovation & Scale** (Sprints 19-25)
- ✅ Épique 6, 7 (IA, QR Codes)
- ✅ Épique 12 (i18n FR/AR)
- ✅ US DevOps 15 (Canary)

### **Phase 4 : Excellence & Conformité** (Sprints 26-31)
- ✅ Épique 11 (Sécurité complète)
- ✅ Épique 13 (Tests exhaustifs)
- ✅ US DevOps 12 (Kubernetes)

---

## 📝 Notes d'Utilisation

1. **Checkboxes** : Cochez `[x]` au fur et à mesure de l'avancement
2. **Priorités** : 🔴 = Critique | 🟡 = Haute | 🟢 = Moyenne
3. **Estimations** : Basées sur équipe de 3-4 développeurs full-stack
4. **Contexte** : Tunisie, multilinguisme FR/AR, rôle admin principal

---

## 🔗 Documents Associés

- [Cahier des Charges](./CAHIER-DES-CHARGES.md)
- [Architecture Technique](./ARCHITECTURE.md)
- [Diagrammes UML](./class-diagram.puml)
- [Diagrammes de Séquence](./connexion-sequence.puml)
- [Guide DevOps](./DOCKER-GUIDE.md)

---

**Dernière mise à jour :** 15 novembre 2025  
**Version :** 2.0  
**Statut :** ✅ Backlog complet validé
