# 🚀 DevOps Quick Start Guide

**Guide de démarrage rapide pour les 5 tâches DevOps restantes**

---

## 📋 Résumé de l'État Actuel

**✅ FAIT** :
1. ✅ **Conteneurisation Docker** - Infrastructure complète avec docker-compose

**⏳ À FAIRE** :
2. ⏳ **Kubernetes** - Orchestration et autoscaling
3. ⏳ **Backups** - Sauvegardes automatiques MongoDB + médias
4. ⏳ **Monitoring** - Prometheus + Grafana en production
5. ⏳ **Canary** - Déploiement progressif avec rollback
6. ⏳ **Pipeline Prod** - CI/CD production avec approbation manuelle

---

## 🎯 Ordre Recommandé d'Exécution

### Priorité 1 (CRITIQUE) - Semaine 1

#### Jour 1-2 : Tâche #3 - Backups Automatisés
**Pourquoi d'abord ?** Protection des données avant tout

```bash
# 1. Créer le dossier
mkdir -p backend/scripts/backup

# 2. Créer backup-mongodb.sh
cat > backend/scripts/backup/backup-mongodb.sh << 'EOF'
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="./backups/mongodb"
BACKUP_FILE="backup-$TIMESTAMP"

# Backup MongoDB
mongodump --uri="$MONGODB_URI" \
  --out="$BACKUP_DIR/$BACKUP_FILE" \
  --gzip

# Créer archive
cd $BACKUP_DIR
tar -czf "$BACKUP_FILE.tar.gz" "$BACKUP_FILE"
rm -rf "$BACKUP_FILE"

# Hash pour vérification
sha256sum "$BACKUP_FILE.tar.gz" > "$BACKUP_FILE.sha256"

echo "✅ Backup créé : $BACKUP_FILE.tar.gz"

# Upload vers Azure Blob Storage
az storage blob upload \
  --account-name $AZURE_STORAGE_ACCOUNT \
  --container-name backups \
  --file "$BACKUP_FILE.tar.gz" \
  --name "mongodb/$BACKUP_FILE.tar.gz"

# Nettoyage (garde 30 jours)
find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +30 -delete
EOF

chmod +x backend/scripts/backup/backup-mongodb.sh

# 3. Créer backup-media.sh
cat > backend/scripts/backup/backup-media.sh << 'EOF'
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="./backups/media"
MEDIA_DIR="./backend/uploads"

mkdir -p $BACKUP_DIR

# Backup fichiers médias
tar -czf "$BACKUP_DIR/media-$TIMESTAMP.tar.gz" $MEDIA_DIR

# Hash
sha256sum "$BACKUP_DIR/media-$TIMESTAMP.tar.gz" > "$BACKUP_DIR/media-$TIMESTAMP.sha256"

echo "✅ Backup médias créé : media-$TIMESTAMP.tar.gz"

# Upload Azure
az storage blob upload \
  --account-name $AZURE_STORAGE_ACCOUNT \
  --container-name backups \
  --file "$BACKUP_DIR/media-$TIMESTAMP.tar.gz" \
  --name "media/media-$TIMESTAMP.tar.gz"

# Nettoyage (30 jours)
find $BACKUP_DIR -name "media-*.tar.gz" -mtime +30 -delete
EOF

chmod +x backend/scripts/backup/backup-media.sh

# 4. Ajouter scripts npm
npm pkg set scripts.backup="./scripts/backup/backup-mongodb.sh && ./scripts/backup/backup-media.sh"
npm pkg set scripts.backup:mongodb="./scripts/backup/backup-mongodb.sh"
npm pkg set scripts.backup:media="./scripts/backup/backup-media.sh"

# 5. Configurer cron (toutes les 6h)
crontab -e
# Ajouter : 0 */6 * * * cd /path/to/project && npm run backup

# 6. Tester
npm run backup
```

**Vérification** :
```bash
# Vérifier que les backups sont créés
ls -lh ./backups/mongodb/
ls -lh ./backups/media/

# Vérifier l'intégrité
sha256sum -c backups/mongodb/backup-*.sha256
```

---

#### Jour 3-4 : Tâche #4 - Monitoring Production

**Stack complet** : Prometheus + Grafana + Alertmanager

```bash
# 1. Le stack de monitoring existe déjà
cd infrastructure/monitoring

# 2. Lancer le stack
docker-compose -f docker-compose.monitoring.yml up -d

# 3. Accéder aux interfaces
# Prometheus : http://localhost:9090
# Grafana : http://localhost:3001 (admin/admin)
# Alertmanager : http://localhost:9093

# 4. Configurer Grafana
# - Ajouter Prometheus comme data source
# - Importer dashboards (Node.js, MongoDB)
# - Créer dashboard custom

# 5. Configurer les alertes
# Éditer : infrastructure/monitoring/prometheus/alerts.yml
cat > infrastructure/monitoring/prometheus/alerts.yml << 'EOF'
groups:
  - name: backend_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Taux d'erreur élevé détecté"
          
      - alert: HighLatency
        expr: http_request_duration_seconds{quantile="0.95"} > 1
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Latence élevée détectée (P95 > 1s)"
          
      - alert: HighCPU
        expr: process_cpu_seconds_total > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU élevé > 80%"
EOF

# 6. Configurer notifications Slack
# Éditer : infrastructure/monitoring/alertmanager/config.yml
cat > infrastructure/monitoring/alertmanager/config.yml << 'EOF'
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-notifications'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - channel: '#alerts'
        title: '🚨 {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
EOF

# 7. Redémarrer avec nouvelle config
docker-compose -f docker-compose.monitoring.yml restart
```

**Dashboards Grafana à créer** :
1. **Backend Performance** :
   - Requêtes/seconde
   - Latence (P50, P95, P99)
   - Taux d'erreur
   - Utilisateurs actifs

2. **Infrastructure** :
   - CPU/RAM usage
   - Disk I/O
   - Network traffic

3. **Business Metrics** :
   - Propriétés créées
   - Utilisateurs inscrits
   - Paiements effectués
   - Conversions

---

#### Jour 5 : Tâche #6 - Pipeline Production

**Créer le workflow GitHub Actions** :

```bash
# Créer le fichier
mkdir -p .github/workflows
cat > .github/workflows/production-deploy.yml << 'EOF'
name: Production Deployment

on:
  workflow_dispatch:
    inputs:
      skip_tests:
        description: 'Skip tests (NOT RECOMMENDED)'
        type: boolean
        default: false
      skip_backup:
        description: 'Skip database backup (DANGEROUS)'
        type: boolean
        default: false

jobs:
  # Job 1 : Approbation manuelle
  approval:
    name: 🔒 Manual Approval
    runs-on: ubuntu-latest
    environment:
      name: production
      # Requires manual approval in GitHub Settings
    steps:
      - name: Waiting for approval
        run: echo "✅ Deployment approved"

  # Job 2 : Tests
  tests:
    name: 🧪 Run Tests
    needs: approval
    if: ${{ !inputs.skip_tests }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd backend
          npm ci
          
      - name: Run tests
        run: |
          cd backend
          npm run test:ci
          
      - name: Check coverage
        run: |
          cd backend
          npm run test:coverage
          # Fail if coverage < 80%

  # Job 3 : Backup
  backup:
    name: 💾 Database Backup
    needs: tests
    if: ${{ !inputs.skip_backup }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install MongoDB tools
        run: |
          wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
          echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
          sudo apt-get update
          sudo apt-get install -y mongodb-database-tools
          
      - name: Create backup
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
        run: |
          TIMESTAMP=$(date +%Y%m%d-%H%M%S)
          mkdir -p backups
          mongodump --uri="$MONGODB_URI" --out="backups/backup-$TIMESTAMP" --gzip
          tar -czf backup-$TIMESTAMP.tar.gz backups/backup-$TIMESTAMP
          
      - name: Upload backup to artifact
        uses: actions/upload-artifact@v4
        with:
          name: db-backup-${{ github.sha }}
          path: backup-*.tar.gz
          retention-days: 30

  # Job 4 : Déploiement Backend
  deploy-backend:
    name: 🚀 Deploy Backend
    needs: backup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --service backend
          
      - name: Wait for deployment
        run: sleep 30

  # Job 5 : Health Check
  health-check:
    name: 🏥 Health Check
    needs: deploy-backend
    runs-on: ubuntu-latest
    steps:
      - name: Check backend health
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://api.immoexpress.com/health)
          if [ $response -ne 200 ]; then
            echo "❌ Health check failed with status $response"
            exit 1
          fi
          echo "✅ Health check passed"
          
      - name: Smoke tests
        run: |
          # Test endpoints critiques
          curl -f https://api.immoexpress.com/api/properties || exit 1
          curl -f https://api.immoexpress.com/api/users || exit 1
          echo "✅ Smoke tests passed"

  # Job 6 : Rollback (si échec)
  rollback:
    name: 🔙 Rollback
    needs: health-check
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - name: Download backup
        uses: actions/download-artifact@v4
        with:
          name: db-backup-${{ github.sha }}
          
      - name: Restore database
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
        run: |
          # Extraire le backup
          tar -xzf backup-*.tar.gz
          
          # Restaurer
          mongorestore --uri="$MONGODB_URI" --dir=backups/backup-* --drop
          
      - name: Rollback backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          railway rollback --service backend
          
      - name: Send alert
        run: |
          echo "❌ PRODUCTION DEPLOYMENT FAILED - ROLLBACK EXECUTED"
          # Envoyer notification Slack/Discord

  # Job 7 : Notifications
  notify:
    name: 📢 Notify
    needs: health-check
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Send success notification
        if: success()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"✅ Production deployment successful!"}'
            
      - name: Send failure notification
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"❌ Production deployment failed! Rollback executed."}'
EOF
```

**Configurer l'environnement production dans GitHub** :
1. GitHub → Settings → Environments
2. Créer "production"
3. Ajouter reviewers (personnes devant approuver)
4. Configurer les secrets

---

### Priorité 2 (MOYENNE) - Semaine 2

#### Jour 1-2 : Tâche #2 - Kubernetes

```bash
# 1. Créer structure Helm
mkdir -p infrastructure/k8s/helm/immoexpress
cd infrastructure/k8s/helm/immoexpress

# 2. Créer Chart.yaml
cat > Chart.yaml << 'EOF'
apiVersion: v2
name: immoexpress
description: Plateforme immobilière complète
type: application
version: 1.0.0
appVersion: "1.0.0"
EOF

# 3. Créer values.yaml
cat > values.yaml << 'EOF'
replicaCount: 2

image:
  backend:
    repository: immoexpress/backend
    tag: latest
    pullPolicy: IfNotPresent
  frontend:
    repository: immoexpress/frontend
    tag: latest
    pullPolicy: IfNotPresent

service:
  type: LoadBalancer
  backend:
    port: 5000
  frontend:
    port: 3000

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: immoexpress.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: immoexpress-tls
      hosts:
        - immoexpress.com

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 75
  targetMemoryUtilizationPercentage: 80

mongodb:
  uri: mongodb://mongo-service:27017/immoexpress
  
resources:
  backend:
    limits:
      cpu: 1000m
      memory: 1Gi
    requests:
      cpu: 500m
      memory: 512Mi
  frontend:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi
EOF

# 4. Créer les templates
mkdir -p templates

# Deployment backend
cat > templates/backend-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: "{{ .Values.image.backend.repository }}:{{ .Values.image.backend.tag }}"
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: uri
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          {{- toYaml .Values.resources.backend | nindent 12 }}
EOF

# 5. Installer dans cluster K8s
helm install immoexpress ./immoexpress

# 6. Vérifier
kubectl get pods
kubectl get services
kubectl get hpa
```

---

#### Jour 3-4 : Tâche #5 - Canary Deployment

```bash
# 1. Installer Flagger (pour canary)
kubectl apply -k github.com/fluxcd/flagger//kustomize/istio

# 2. Créer canary resource
cat > canary-backend.yaml << 'EOF'
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: backend-canary
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  progressDeadlineSeconds: 60
  service:
    port: 5000
  analysis:
    interval: 1m
    threshold: 5
    maxWeight: 50
    stepWeight: 10
    metrics:
    - name: request-success-rate
      thresholdRange:
        min: 95
      interval: 1m
    - name: request-duration
      thresholdRange:
        max: 1000
      interval: 1m
    webhooks:
    - name: load-test
      url: http://load-tester/
      timeout: 5s
EOF

kubectl apply -f canary-backend.yaml

# 3. Déclencher un canary deployment
# Modifier l'image du deployment
kubectl set image deployment/backend backend=immoexpress/backend:v2.0.0

# 4. Surveiller
kubectl describe canary backend-canary
```

---

## 🔍 Comment Vérifier la Completion

### Tâche #2 - Kubernetes ✅
```bash
✅ helm list | grep immoexpress
✅ kubectl get pods | grep backend  # Au moins 2 pods
✅ kubectl get hpa  # Autoscaling configuré
✅ kubectl get ingress  # Ingress avec TLS
✅ curl https://immoexpress.com/health  # Réponse 200
```

### Tâche #3 - Backups ✅
```bash
✅ ls -lh backups/mongodb/  # Backups MongoDB présents
✅ ls -lh backups/media/  # Backups médias présents
✅ crontab -l | grep backup  # Cron configuré
✅ npm run backup  # Script fonctionne
✅ sha256sum -c backups/mongodb/*.sha256  # Intégrité OK
```

### Tâche #4 - Monitoring ✅
```bash
✅ curl http://localhost:9090  # Prometheus accessible
✅ curl http://localhost:3001  # Grafana accessible
✅ curl http://localhost:5000/metrics  # Métriques backend
✅ # Dashboards créés dans Grafana
✅ # Alertes configurées et testées
```

### Tâche #5 - Canary ✅
```bash
✅ kubectl get canary  # Canary resource existe
✅ kubectl describe canary backend-canary  # Configuration OK
✅ # Test de déploiement canary réussi
✅ # Rollback automatique testé
```

### Tâche #6 - Pipeline Prod ✅
```bash
✅ # Workflow .github/workflows/production-deploy.yml existe
✅ # Test de déploiement manuel réussi
✅ # Approbation manuelle fonctionne
✅ # Backup automatique avant déploiement OK
✅ # Health checks post-déploiement OK
✅ # Rollback automatique testé et fonctionnel
```

---

## 📞 Besoin d'Aide ?

**Documentation complète** : `docs/DEVOPS-STATUS.md`  
**Guide Docker** : `docs/DOCKER-GUIDE.md`  
**Documentation principale** : `docs/DOCUMENTATION-PROJET.md`

**Problèmes courants** :
- Docker : S'assurer que Docker Desktop est démarré
- Kubernetes : Installer kubectl et helm
- Azure : Configurer Azure CLI (`az login`)
- MongoDB : Installer mongodb-database-tools

**Commandes utiles** :
```bash
# Vérifier Docker
docker --version
docker-compose --version

# Vérifier Kubernetes
kubectl version
helm version

# Vérifier Azure
az --version
az account show

# Vérifier MongoDB tools
mongodump --version
```

---

## 🎯 Objectif Final

Une fois toutes les tâches terminées :
- ✅ Infrastructure complètement automatisée
- ✅ Déploiements zero-downtime
- ✅ Rollback en < 15 minutes
- ✅ Monitoring 24/7 avec alertes
- ✅ Backups automatiques testés
- ✅ Scaling automatique selon la charge

**Niveau DevOps** : ⭐⭐⭐⭐⭐ (5/5)
