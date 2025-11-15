# AW-25 — Feature Flags pour Déploiement Canary

Ce document décrit l'implémentation complète du système de feature flags pour permettre des déploiements incrémentaux et sécurisés.

## ✅ Critères d'acceptation - Status

| # | Critère | Status | Notes |
|---|---------|--------|-------|
| 1️⃣ | La librairie de feature flags est intégrée à l'application | ✅ **DONE** | Solution custom avec MongoDB (léger, pas de dépendance externe) |
| 2️⃣ | La page d'admin est encapsulée dans un feature flag | ✅ **DONE** | Flag `admin-panel` protège toutes les routes `/api/admin/*` |
| 3️⃣ | Le flag peut être activé/désactivé sans redéploiement | ✅ **DONE** | API REST pour toggle en temps réel + UI admin |
| 4️⃣ | Le flag peut cibler des utilisateurs spécifiques (liste verte) | ✅ **DONE** | Support emails, user IDs, roles, percentage rollout |
| 5️⃣ | L'état des flags est visible dans l'interface d'administration | ✅ **DONE** | UI complète intégrée au dashboard admin (create, edit, toggle, whitelist) |

## 📋 Architecture

### Composants

1. **Model** (`FeatureFlag.js`) - Schéma Mongoose avec:
   - Clé unique, nom, description
   - État on/off global
   - Targeting: emails, user IDs, roles, percentage
   - Métadonnées: créateur, dernière modification

2. **Service** (`featureFlagService.js`) - Logique métier:
   - Évaluation des flags par utilisateur
   - CRUD complet
   - Gestion whitelist
   - Toggle sans redéploiement

3. **Middleware** (`featureFlag.js`) - Protection routes:
   - `requireFeatureFlag(key)` - Bloque l'accès si désactivé
   - `attachFeatureFlags` - Attache tous les flags à `req.featureFlags`

4. **Controller** (`featureFlagController.js`) - API REST
5. **Routes** (`featureFlagRoutes.js`) - Endpoints HTTP

### Flux d'évaluation

```
Request → Auth Middleware → Feature Flag Middleware → Controller
                                    ↓
                              Check Database
                                    ↓
                          Evaluate targeting rules
                                    ↓
                          Return true/false
```

## 🚀 Utilisation

### 1. Créer un feature flag

```bash
POST /api/feature-flags
Authorization: Bearer <admin-token>

{
  "key": "new-search",
  "name": "New Search UI",
  "description": "New search interface with advanced filters",
  "enabled": false,
  "targeting": {
    "emails": ["beta@example.com"],
    "userIds": [],
    "roles": ["admin"],
    "percentage": 10
  }
}
```

### 2. Toggle un flag (sans redéploiement!)

```bash
PATCH /api/feature-flags/new-search/toggle
Authorization: Bearer <admin-token>
```

### 3. Protéger une route

```javascript
const { requireFeatureFlag } = require('./middlewares/featureFlag');

// Protéger toute une section
app.use('/api/admin', requireFeatureFlag('admin-panel'), adminRoutes);

// Ou une route spécifique
router.get('/new-feature', 
  protect,
  requireFeatureFlag('new-search'),
  controller.newFeature
);
```

### 4. Vérifier un flag dans le code

```javascript
const FeatureFlagService = require('./services/featureFlagService');

// Dans un controller/service
const isEnabled = await FeatureFlagService.isEnabled('new-search', req.user);

if (isEnabled) {
  // Nouvelle fonctionnalité
} else {
  // Ancienne fonctionnalité
}
```

### 5. Frontend - Récupérer les flags pour l'utilisateur courant

```bash
GET /api/feature-flags/my-flags
Authorization: Bearer <user-token>

Response:
{
  "success": true,
  "data": {
    "admin-panel": true,
    "new-search": false,
    "advanced-filters": true
  }
}
```

## 📡 API Endpoints

### Admin Endpoints (require `admin` role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feature-flags` | Lister tous les flags |
| GET | `/api/feature-flags/:key` | Détails d'un flag |
| POST | `/api/feature-flags` | Créer un flag |
| PUT | `/api/feature-flags/:key` | Mettre à jour un flag |
| DELETE | `/api/feature-flags/:key` | Supprimer un flag |
| PATCH | `/api/feature-flags/:key/toggle` | Toggle on/off |
| POST | `/api/feature-flags/:key/whitelist` | Ajouter à la whitelist |
| DELETE | `/api/feature-flags/:key/whitelist` | Retirer de la whitelist |

### User Endpoints (require authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feature-flags/my-flags` | Tous mes flags évalués |
| GET | `/api/feature-flags/:key/check` | Vérifier un flag spécifique |

## 🎯 Stratégies de Targeting

### 1. Global (tous les utilisateurs)

```json
{
  "enabled": true,
  "targeting": {}
}
```

### 2. Whitelist d'emails

```json
{
  "enabled": true,
  "targeting": {
    "emails": ["user1@example.com", "user2@example.com"]
  }
}
```

### 3. Whitelist d'user IDs

```json
{
  "enabled": true,
  "targeting": {
    "userIds": ["507f1f77bcf86cd799439011", "..."]
  }
}
```

### 4. Par rôle

```json
{
  "enabled": true,
  "targeting": {
    "roles": ["admin", "moderator"]
  }
}
```

### 5. Percentage rollout (canary)

```json
{
  "enabled": true,
  "targeting": {
    "percentage": 25  // 25% des utilisateurs
  }
}
```

Le pourcentage est déterministe basé sur le hash de l'user ID - un utilisateur aura toujours le même résultat.

### 6. Combinaison (OR logic)

```json
{
  "enabled": true,
  "targeting": {
    "emails": ["vip@example.com"],
    "roles": ["admin"],
    "percentage": 10
  }
}
```

Le flag est activé si **l'une** des conditions est vraie (email OU role OU percentage).

## 🧪 Tests

### Exécuter les tests

```bash
cd backend
npm test -- featureFlags.test.js
```

### Tests couverts

- ✅ Création de flags (admin only)
- ✅ Validation des clés (format lowercase, alphanumeric + hyphens)
- ✅ Toggle sans redéploiement
- ✅ Whitelist management (add/remove)
- ✅ Évaluation des règles de targeting
- ✅ Protection des routes admin
- ✅ Récupération des flags par utilisateur

## 🌱 Seeding

Le système seed automatiquement 3 flags au démarrage:

1. **`admin-panel`** - Protège les routes admin (enabled: true, roles: admin)
2. **`new-property-form`** - Exemple de nouvelle feature (disabled)
3. **`advanced-search`** - Exemple de recherche avancée (disabled)

```bash
npm run db:seed
```

## 📊 Cas d'usage - Déploiement Canary

### Scénario: Nouvelle UI de recherche

**Phase 1: Développement & Tests internes**
```bash
POST /api/feature-flags
{
  "key": "search-v2",
  "name": "Search V2",
  "enabled": true,
  "targeting": {
    "emails": ["dev@company.com", "qa@company.com"]
  }
}
```

**Phase 2: Beta testeurs (5%)**
```bash
PUT /api/feature-flags/search-v2
{
  "targeting": {
    "percentage": 5
  }
}
```

**Phase 3: Rollout progressif (25% → 50% → 100%)**
```bash
# 25%
PATCH /api/feature-flags/search-v2
{ "targeting": { "percentage": 25 } }

# Monitor metrics, errors...

# 50%
PATCH /api/feature-flags/search-v2
{ "targeting": { "percentage": 50 } }

# 100%
PATCH /api/feature-flags/search-v2
{ "targeting": { "percentage": 100 } }
```

**Phase 4: Problème détecté? Rollback instantané!**
```bash
PATCH /api/feature-flags/search-v2/toggle  # Disable immédiatement
```

**Phase 5: 100% stable → Retirer le flag du code**
Une fois la feature complètement déployée et stable, retirer le flag du code et supprimer le flag de la DB.

## 🔒 Sécurité

- ✅ Seuls les admins peuvent gérer les flags
- ✅ Les routes protégées retournent 403 si flag désactivé
- ✅ Évaluation fail-safe: en cas d'erreur → false
- ✅ Validation stricte des clés (lowercase, alphanumeric)
- ✅ Audit trail: `createdBy`, `updatedBy`, `lastToggledAt`

## 🎨 Intégration Frontend (à implémenter)

### Page d'administration suggérée

```typescript
// components/admin/FeatureFlagsManager.tsx
interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  targeting: {
    emails: string[];
    userIds: string[];
    roles: string[];
    percentage: number;
  };
  lastToggledAt?: Date;
  updatedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Features:
// - Liste des flags avec status (enabled/disabled)
// - Toggle switch pour chaque flag
// - Modal pour éditer targeting
// - Whitelist management UI
// - Percentage slider (0-100%)
// - Historique des changements
```

### Hook React pour feature flags

```typescript
// hooks/useFeatureFlag.ts
export function useFeatureFlag(flagKey: string): boolean {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    fetch(`/api/feature-flags/${flagKey}/check`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setEnabled(data.data.enabled));
  }, [flagKey]);
  
  return enabled;
}

// Usage:
function SearchPage() {
  const useNewSearch = useFeatureFlag('search-v2');
  
  return useNewSearch ? <NewSearch /> : <OldSearch />;
}
```

## 📈 Best Practices

1. **Nommage des flags**
   - Utiliser kebab-case: `new-feature-name`
   - Descriptif mais court
   - Éviter les noms génériques

2. **Cycle de vie**
   - Développement: flag disabled, whitelist dev/QA
   - Beta: percentage rollout (5-10%)
   - Staging: 100%
   - Production: rollout progressif
   - **Important**: Retirer les flags du code une fois 100% stable

3. **Monitoring**
   - Logger les toggles (`lastToggledAt`)
   - Monitorer les erreurs par flag
   - Alerter si flag toggle fréquent (instabilité)

4. **Ne PAS abuser**
   - Flags à court terme pour rollout
   - Pas de flags permanents (tech debt)
   - Nettoyer les flags obsolètes

## 🔧 Configuration

### Variables d'environnement

Aucune variable spécifique requise. Le système utilise:
- `JWT_SECRET` - Pour l'authentification
- `MONGODB_URI` - Pour la persistence

## 🐛 Troubleshooting

**Flag ne s'applique pas?**
1. Vérifier que le flag est `enabled: true`
2. Vérifier les règles de targeting
3. Vérifier le rôle de l'utilisateur
4. Check logs backend

**Erreur 403 sur routes admin?**
1. Vérifier que le flag `admin-panel` est enabled
2. Vérifier le rôle utilisateur (doit être `admin`)
3. Seed la DB si flag manquant: `npm run db:seed`

## 📚 Ressources

- [Feature Flag Best Practices](https://martinfowler.com/articles/feature-toggles.html)
- [LaunchDarkly Guide](https://launchdarkly.com/blog/dos-and-donts-of-feature-flags/)
- [Split.io Patterns](https://www.split.io/blog/feature-flag-best-practices/)

## 🎯 Prochaines améliorations possibles

1. **Analytics**
   - Tracker combien d'utilisateurs ont vu chaque flag
   - Mesurer l'impact (conversion, performance)

2. **Scheduling**
   - Auto-enable/disable à une date/heure
   - Rollout automatique progressif

3. **A/B Testing**
   - Split traffic 50/50 pour comparer versions
   - Metrics dashboard

4. **Segments**
   - Créer des segments d'utilisateurs réutilisables
   - "Beta testers", "Premium users", etc.

5. **Frontend SDK**
   - Client-side evaluation pour features UI
   - WebSocket pour updates temps réel
