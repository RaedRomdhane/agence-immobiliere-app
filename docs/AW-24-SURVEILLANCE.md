# AW-24 — Surveillance et Monitoring (staging)

Ce document décrit la configuration complète de surveillance pour l'environnement de staging : centralisation des logs, health checks, métriques (CPU/mémoire/latence), dashboard et alertes.

## ✅ Éléments livrés

### 1. Centralisation des logs (Winston + Loki)
- **Winston logger** configuré dans `backend/src/config/logger.js`
- Logs écrits dans `backend/logs/combined.log` et `backend/logs/error.log`
- **Promtail** collecte et envoie les logs vers **Loki**
- Logs consultables via l'interface Grafana (Explore → Loki datasource)

### 2. Health checks
- Endpoint existant : `GET /health`
- Retourne le statut de l'API, l'environnement et un timestamp
- Surveillé par Prometheus (peut être utilisé pour uptime monitoring)

### 3. Métriques Prometheus
- **Endpoint metrics** : `GET /metrics` (format Prometheus)
- **Métriques collectées** :
  - Métriques système : CPU, mémoire, event loop (préfixe `app_`)
  - Durée des requêtes HTTP : histogram `http_request_duration_seconds`
  - Labels : method, route, status code
- **Middleware** enregistre automatiquement chaque requête

### 4. Dashboard Grafana
- Dashboard pré-configuré : "Agence - Basic Monitoring"
- **Panneaux inclus** :
  - CPU usage (process)
  - Memory RSS
  - HTTP P95 latency
  - 5xx error rate
- Auto-importé au démarrage de Grafana via provisioning

### 5. Alertes Prometheus
- **Règles d'alertes** définies dans `infrastructure/monitoring/prometheus/alerts.yml`
- **Alertes configurées** :
  - `HighErrorRate` : >5 erreurs 5xx en 5min (critical)
  - `HighRequestLatency` : P95 >1s (warning)
  - `HighMemoryUsage` : >500MB (warning)
  - `HighCPUUsage` : >80% (warning)
- **Alertmanager** route les alertes vers Slack/email (configurable)

## 🚀 Installation et démarrage

### Prérequis
- Docker et Docker Compose installés
- Backend API démarré (écrit les logs dans `backend/logs/`)

### Étape 1 : Installer les dépendances backend

```powershell
cd backend
npm install
```

Les nouvelles dépendances installées : `prom-client`, `winston`

### Étape 2 : Configurer les variables d'environnement (optionnel)

```powershell
cd infrastructure/monitoring
cp .env.example .env
# Éditer .env pour ajouter SLACK_WEBHOOK_URL ou config email
```

### Étape 3 : Démarrer le stack de monitoring

```powershell
cd infrastructure/monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

### Étape 4 : Vérifier les services

```powershell
docker compose -f docker-compose.monitoring.yml ps
```

5 conteneurs doivent être en statut "running" :
- prometheus
- alertmanager
- grafana
- loki
- promtail

## 📊 Accès aux interfaces

| Service | URL | Identifiants |
|---------|-----|--------------|
| Grafana | http://localhost:3000 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Alertmanager | http://localhost:9093 | - |
| Loki | http://localhost:3100 | API only |

## 🔍 Utilisation

### Consulter les métriques dans Grafana
1. Ouvrir Grafana (http://localhost:3000)
2. Aller dans "Dashboards"
3. Sélectionner "Agence - Basic Monitoring"
4. Visualiser CPU, mémoire, latence, erreurs

### Consulter les logs dans Grafana
1. Aller dans "Explore"
2. Sélectionner datasource "Loki"
3. Requêtes LogQL :
   - `{job="backend"}` — tous les logs
   - `{job="backend"} |= "error"` — filtrer les erreurs
   - `{job="backend"} | json | level="error"` — logs JSON niveau error

### Vérifier les targets Prometheus
1. Ouvrir Prometheus (http://localhost:9090)
2. Status → Targets
3. Vérifier que `agence-backend` est UP

### Voir les alertes actives
1. Ouvrir Alertmanager (http://localhost:9093)
2. Consulter les alertes en cours
3. Les alertes sont aussi visibles dans Prometheus → Alerts

## ⚙️ Configuration avancée

### Changer la cible de scraping
Par défaut Prometheus scrape `host.docker.internal:5000`. Pour utiliser le backend dans le même réseau Docker :
1. Éditer `prometheus/prometheus.yml`
2. Changer target vers `backend:5000`

### Configurer les receivers d'alertes

**Slack :**
```bash
# Dans .env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Email :**
```bash
# Dans .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_EMAIL_TO=team@example.com
ALERT_EMAIL_FROM=alerts@example.com
```

### Ajuster les seuils d'alertes
Éditer `prometheus/alerts.yml` et modifier les seuils selon vos besoins de staging.

## 🧪 Tests

### Tester les métriques
```powershell
# Health check
Invoke-WebRequest http://localhost:5000/health

# Métriques brutes
Invoke-WebRequest http://localhost:5000/metrics
```

### Tester les logs
Faire des requêtes API pour générer des logs. Promtail les collecte automatiquement depuis `backend/logs/`.

### Tester les alertes
1. Baisser temporairement les seuils dans `alerts.yml`
2. Ou générer des conditions d'alerte (erreurs, charge)
3. Vérifier dans Alertmanager

## 📈 Tests automatisés

Des tests d'intégration vérifient les endpoints :

```powershell
cd backend
npm test -- monitoring.test.js
```

Tests couverts :
- `GET /health` retourne 200 et JSON valide
- `GET /metrics` retourne métriques Prometheus

## 🎯 Critères d'acceptation — Statut

| Critère | Statut | Notes |
|---------|--------|-------|
| Logs centralisés et consultables | ✅ Complet | Winston → fichiers → Promtail → Loki → Grafana |
| Health checks configurés et surveillés | ✅ Complet | `/health` endpoint, Prometheus peut le scraper |
| Métriques de base collectées | ✅ Complet | CPU, mémoire, temps de réponse via Prometheus |
| Dashboard avec métriques clés | ✅ Complet | Grafana dashboard auto-importé |
| Alertes pour erreurs critiques | ✅ Complet | Règles Prometheus + Alertmanager routing |

## 🚀 Prochaines étapes (production)

1. **Sécuriser Grafana** : HTTPS, changement mot de passe admin
2. **Configurer receivers réels** : Slack/PagerDuty/email avec vraies credentials
3. **Rétention des données** : Configurer policies Prometheus et Loki
4. **Volumes persistants** : Utiliser stockage externe en prod
5. **Mode distribué Loki** : Pour gros volumes de logs
6. **Authentication** : Ajouter auth proxy devant Prometheus/Alertmanager
7. **Monitoring du monitoring** : Uptime checks pour le stack lui-même

## 📚 Documentation complète

Voir `infrastructure/monitoring/README.md` pour :
- Guide détaillé d'utilisation
- Troubleshooting
- Configuration avancée
- Déploiement production
