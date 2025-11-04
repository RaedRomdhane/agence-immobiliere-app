# E2E Tests - Agence Immobilière

Tests end-to-end pour l''application Agence Immobilière utilisant Playwright.

## Installation

```bash
cd e2e-tests
npm install
npx playwright install
```

## Exécution des Tests

```bash
npm test              # Tous les tests
npm run test:headed   # Avec interface graphique  
npm run test:debug    # Mode debug
npm run test:report   # Afficher le rapport
```

## Structure

- `tests/auth/` - Tests d''authentification (inscription, connexion)
- `tests/fixtures/` - Page Objects et utilitaires
- `playwright.config.ts` - Configuration Playwright

## Tests Implémentés

-  Inscription utilisateur (email/password)
-  Connexion utilisateur
-  Tests de validation
-  Google OAuth (boutons visibles)

Les tests sont exécutés automatiquement après chaque déploiement staging via GitHub Actions.
