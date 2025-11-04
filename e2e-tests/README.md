# E2E Tests - Agence Immobilière

Tests End-to-End (E2E) avec Playwright pour l''application Agence Immobilière.

##  Objectif

Valider automatiquement les fonctionnalités critiques de l''application après chaque déploiement en staging, notamment :
- Inscription utilisateur
- Connexion utilisateur
- Navigation entre les pages
- Validation des formulaires

##  Couverture Actuelle

 **14 tests implémentés (100% passing)**

### Tests de Configuration (3)
-  Chargement de la page d''accueil
-  Navigation vers la page de connexion
-  Navigation vers la page d''inscription

### Tests de Connexion (6)
-  Affichage du bouton Google Login
-  Navigation vers la page d''inscription
-  Erreur pour identifiants invalides
-  Validation du champ email requis
-  Validation du champ mot de passe requis
-  Connexion réussie avec identifiants valides

### Tests d''Inscription (5)
-  Inscription réussie avec données valides
-  Affichage du bouton Google Signup
-  Navigation vers la page de connexion
-  Validation des champs obligatoires
-  Inscription sans numéro de téléphone (optionnel)

##  Installation

```bash
# Installer les dépendances
npm install

# Installer les navigateurs Playwright
npx playwright install
```

##  Exécution des Tests

### Localement

```bash
# Exécuter tous les tests
npm test

# Exécuter en mode headed (voir le navigateur)
npm run test:headed

# Exécuter sur un navigateur spécifique
npm run test:chromium

# Mode debug
npm run test:debug

# Afficher le rapport HTML
npm run test:report
```

### En CI/CD

Les tests s''exécutent automatiquement après chaque déploiement en staging via GitHub Actions.

##  Structure des Tests

```
e2e-tests/
 tests/
    auth/                    # Tests d''authentification
       login.spec.ts        # Tests de connexion
       registration.spec.ts # Tests d''inscription
       setup.spec.ts        # Tests de navigation basique
    fixtures/                # Utilitaires réutilisables
        LoginPage.ts         # Page Object Model - Login
        RegisterPage.ts      # Page Object Model - Registration
        testData.ts          # Générateur de données de test
 playwright.config.ts         # Configuration Playwright
 package.json                 # Dépendances et scripts
 README.md                    # Documentation
```

##  Architecture

### Page Object Model (POM)

Les tests utilisent le pattern Page Object Model pour une meilleure maintenabilité :

**LoginPage.ts** - Encapsule les interactions avec la page de connexion
**RegisterPage.ts** - Encapsule les interactions avec la page d''inscription

### Génération de Données Uniques

Chaque test génère des données uniques pour éviter les conflits :

```typescript
import { generateUserData, generateUniqueEmail } from '../fixtures/testData';

const userData = generateUserData();
// email: test.1730745896789.4567@e2etest.com
```

##  Configuration

### Variables d''Environnement

- `STAGING_URL` : URL du frontend en staging (défaut: https://agence-immobiliere-app.vercel.app)
- `BACKEND_URL` : URL du backend (défini dans testData.ts)

### Playwright Config

- **Navigateurs** : Chromium (peut être étendu à Firefox, WebKit)
- **Reporters** : HTML, JSON, JUnit, List
- **Retry** : 2 fois en CI, 0 en local
- **Artifacts** : Screenshots et vidéos en cas d''échec

##  Rapports

### HTML Report
```bash
npm run test:report
```
Ouvre un rapport interactif avec :
- Résumé des tests (passed/failed)
- Détails de chaque test
- Screenshots et vidéos des échecs
- Traces d''exécution

### JSON Report
Généré automatiquement dans `test-results.json` pour intégration CI/CD.

### JUnit Report
Généré dans `test-results.xml` pour compatibilité avec les outils CI/CD.

##  Intégration CI/CD

Les tests E2E s''exécutent automatiquement dans le pipeline GitHub Actions :

```yaml
e2e-tests:
  runs-on: ubuntu-latest
  needs: smoke-test
  steps:
    - Install dependencies
    - Install Playwright browsers
    - Run tests against staging
    - Upload test results (30 days)
    - Comment PR with results
```

### Artifacts

Les artifacts suivants sont conservés pendant 30 jours :
-  Rapport HTML complet
-  Résultats JSON et JUnit
-  Screenshots des échecs
-  Vidéos des échecs

##  Développement

### Ajouter un Nouveau Test

1. Créer le fichier de test dans `tests/auth/` ou créer un nouveau dossier
2. Importer les Page Objects nécessaires
3. Utiliser `generateUserData()` pour des données uniques
4. Suivre le pattern Arrange-Act-Assert

Exemple :
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../fixtures/LoginPage';
import { generateUserData } from '../fixtures/testData';

test.describe('My New Tests', () => {
  let loginPage: LoginPage;
  
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should do something', async () => {
    // Arrange
    const userData = generateUserData();
    
    // Act
    await loginPage.login(userData.email, userData.password);
    
    // Assert
    await expect(loginPage.page).toHaveURL(/dashboard/);
  });
});
```

### Mettre à Jour un Page Object

1. Ouvrir le fichier dans `tests/fixtures/`
2. Ajouter les nouveaux locators
3. Créer les méthodes d''interaction
4. Mettre à jour les tests qui l''utilisent

##  Bonnes Pratiques

 **Indépendance des Tests**
- Chaque test doit être indépendant
- Utiliser `generateUserData()` pour éviter les conflits
- Ne pas dépendre de l''ordre d''exécution

 **Page Object Model**
- Encapsuler les interactions dans les Page Objects
- Un fichier par page/composant
- Méthodes réutilisables et expressives

 **Sélecteurs Robustes**
- Préférer les attributs sémantiques (`name`, `type`, `role`)
- Éviter les sélecteurs CSS fragiles
- Utiliser `.first()` ou `.nth()` si plusieurs éléments

 **Assertions Claires**
- Une assertion principale par test
- Messages d''erreur explicites
- Attendre les états asynchrones

##  Debugging

### Localement

```bash
# Mode debug interactif
npm run test:debug

# Voir le navigateur pendant les tests
npm run test:headed
```

### En CI

1. Télécharger les artifacts depuis GitHub Actions
2. Ouvrir le rapport HTML
3. Voir les screenshots et vidéos des échecs

##  Support

Pour toute question ou problème :
- Consulter la [documentation Playwright](https://playwright.dev)
- Vérifier les logs des GitHub Actions
- Examiner les artifacts des tests échoués

##  Résultats Actuels

**Status** :  14/14 tests passing (100%)  
**Dernière exécution** : Tous les tests passent avec succès  
**Couverture** : Authentification complète (login + registration)

---

**AW-22 : Tests Système (End-to-End)** 
