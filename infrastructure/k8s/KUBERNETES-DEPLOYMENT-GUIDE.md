# Kubernetes Deployment Guide

## Overview
This Helm chart deploys the Agence Immobiliere application to Kubernetes with:
- **Backend**: Node.js API (2-10 replicas with HPA)
- **Frontend**: Next.js app (2-8 replicas with HPA)
- **MongoDB**: StatefulSet with persistent storage (20Gi)
- **Ingress**: NGINX with TLS/SSL (Let's Encrypt)
- **Monitoring**: Prometheus ServiceMonitor
- **Storage**: 50Gi PVC for uploads (ReadWriteMany)

## Prerequisites

### 1. Install Required Tools
```bash
# Helm 3.x
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# kubectl
# Windows (PowerShell):
choco install kubernetes-cli

# Verify installations
helm version
kubectl version --client
```

### 2. Kubernetes Cluster
You need access to a Kubernetes cluster. Options:
- **Local**: Minikube, Kind, Docker Desktop
- **Cloud**: AKS, EKS, GKE
- **On-premise**: kubeadm, k3s

### 3. NGINX Ingress Controller
```bash
# Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

### 4. Cert-Manager (for TLS certificates)
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create Let's Encrypt ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### 5. Prometheus Operator (Optional)
```bash
# For ServiceMonitor support
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```

## Build and Push Docker Images

### Build Images
```bash
# Backend
cd backend
docker build -t your-registry/agence-immobiliere-backend:1.0.0 -f Dockerfile.production .
docker push your-registry/agence-immobiliere-backend:1.0.0

# Frontend
cd ../frontend
docker build -t your-registry/agence-immobiliere-frontend:1.0.0 .
docker push your-registry/agence-immobiliere-frontend:1.0.0
```

## Configuration

### 1. Create Secrets File
Create `secrets.yaml` (DO NOT commit to Git):
```yaml
secrets:
  MONGODB_URI: "mongodb://admin:YOUR_PASSWORD@agence-immobiliere-mongodb:27017/agence_immobiliere?authSource=admin"
  JWT_SECRET: "your-secure-jwt-secret-here"
  GOOGLE_CLIENT_ID: "your-google-client-id"
  GOOGLE_CLIENT_SECRET: "your-google-client-secret"
  SESSION_SECRET: "your-secure-session-secret"
  AZURE_STORAGE_ACCOUNT_NAME: "your-storage-account"
  AZURE_STORAGE_ACCOUNT_KEY: "your-storage-key"

mongodb:
  auth:
    rootPassword: "your-mongodb-password"
```

### 2. Update values.yaml
```yaml
# Update image repositories
backend:
  image:
    repository: your-registry/agence-immobiliere-backend
    tag: "1.0.0"

frontend:
  image:
    repository: your-registry/agence-immobiliere-frontend
    tag: "1.0.0"

# Update domain
global:
  domain: your-domain.com

ingress:
  hosts:
    - host: your-domain.com
    - host: api.your-domain.com
```

## Deployment

### Install the Chart
```bash
# Dry run to verify
helm install agence-immobiliere ./infrastructure/k8s/helm/agence-immobiliere \
  --namespace production --create-namespace \
  -f secrets.yaml \
  --dry-run --debug

# Install
helm install agence-immobiliere ./infrastructure/k8s/helm/agence-immobiliere \
  --namespace production --create-namespace \
  -f secrets.yaml

# Or use --set for individual values
helm install agence-immobiliere ./infrastructure/k8s/helm/agence-immobiliere \
  --namespace production --create-namespace \
  --set mongodb.auth.rootPassword=YOUR_PASSWORD \
  --set secrets.JWT_SECRET=YOUR_JWT_SECRET
```

### Verify Deployment
```bash
# Check pods
kubectl get pods -n production

# Check services
kubectl get svc -n production

# Check ingress
kubectl get ingress -n production

# Check HPA status
kubectl get hpa -n production

# View logs
kubectl logs -n production -l app.kubernetes.io/component=backend --tail=100
kubectl logs -n production -l app.kubernetes.io/component=frontend --tail=100
```

### Check Application Health
```bash
# Port-forward to test locally
kubectl port-forward -n production svc/agence-immobiliere-backend 5000:5000
kubectl port-forward -n production svc/agence-immobiliere-frontend 3000:3000

# Test endpoints
curl http://localhost:5000/health
curl http://localhost:5000/metrics
curl http://localhost:3000
```

## Scaling

### Manual Scaling
```bash
# Scale backend
kubectl scale deployment agence-immobiliere-backend -n production --replicas=5

# Scale frontend
kubectl scale deployment agence-immobiliere-frontend -n production --replicas=3
```

### Auto-scaling (HPA)
Already configured in values.yaml:
- Backend: 2-10 replicas (70% CPU, 80% memory)
- Frontend: 2-8 replicas (70% CPU, 80% memory)

```bash
# Watch HPA in action
kubectl get hpa -n production -w
```

## Updates and Rollbacks

### Update Application
```bash
# Update image version
helm upgrade agence-immobiliere ./infrastructure/k8s/helm/agence-immobiliere \
  --namespace production \
  -f secrets.yaml \
  --set backend.image.tag=1.0.1 \
  --set frontend.image.tag=1.0.1

# Check rollout status
kubectl rollout status deployment/agence-immobiliere-backend -n production
kubectl rollout status deployment/agence-immobiliere-frontend -n production
```

### Rollback
```bash
# View revision history
helm history agence-immobiliere -n production

# Rollback to previous version
helm rollback agence-immobiliere -n production

# Or rollback to specific revision
helm rollback agence-immobiliere 2 -n production

# Kubernetes-level rollback
kubectl rollout undo deployment/agence-immobiliere-backend -n production
```

## Monitoring

### Prometheus Metrics
```bash
# Access Prometheus (if installed)
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# View metrics at http://localhost:9090
# Query examples:
# - rate(http_request_duration_seconds_count[5m])
# - app_process_resident_memory_bytes
```

### Grafana Dashboards
```bash
# Access Grafana (if installed)
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Login: admin / prom-operator
```

## Backup and Restore

### Backup MongoDB
```bash
# Create backup job
kubectl create job --from=cronjob/mongodb-backup mongodb-backup-manual -n production

# Download backup
kubectl cp production/mongodb-backup-pod:/backups/latest.tar.gz ./mongodb-backup.tar.gz
```

### Restore MongoDB
```bash
# Upload backup
kubectl cp ./mongodb-backup.tar.gz production/mongodb-pod:/tmp/backup.tar.gz

# Restore
kubectl exec -n production mongodb-pod -- mongorestore --archive=/tmp/backup.tar.gz --gzip
```

## Troubleshooting

### Pod Not Starting
```bash
# Describe pod
kubectl describe pod <pod-name> -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n production --previous
```

### Ingress Issues
```bash
# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# Test ingress
kubectl describe ingress agence-immobiliere -n production

# Check certificate
kubectl describe certificate agence-immobiliere-tls -n production
```

### Storage Issues
```bash
# Check PVCs
kubectl get pvc -n production

# Check PVs
kubectl get pv

# Describe PVC
kubectl describe pvc agence-immobiliere-uploads -n production
```

### Performance Issues
```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n production

# Check HPA metrics
kubectl describe hpa agence-immobiliere-backend -n production
```

## Uninstall

```bash
# Uninstall chart (keeps PVCs)
helm uninstall agence-immobiliere -n production

# Delete PVCs if needed
kubectl delete pvc -n production --all

# Delete namespace
kubectl delete namespace production
```

## Production Checklist

- [ ] Images pushed to private registry
- [ ] Secrets configured (not in Git)
- [ ] Domain DNS configured
- [ ] TLS certificates working
- [ ] Resource limits set appropriately
- [ ] HPA tested and working
- [ ] Monitoring integrated
- [ ] Backup strategy configured
- [ ] High availability tested (kill pods)
- [ ] Load testing performed
- [ ] Rollback procedure tested
- [ ] Documentation updated

## Security Best Practices

1. **Use private Docker registry**
2. **Enable Pod Security Policies/Standards**
3. **Use Network Policies** (set `networkPolicy.enabled: true`)
4. **Rotate secrets regularly**
5. **Enable RBAC**
6. **Scan images for vulnerabilities**
7. **Use non-root containers** (already configured)
8. **Enable audit logging**
9. **Implement rate limiting** (configured in Ingress)
10. **Use External Secrets Operator** for secret management

## Support

For issues or questions:
- Check logs: `kubectl logs -n production -l app.kubernetes.io/name=agence-immobiliere`
- View events: `kubectl get events -n production`
- Contact DevOps team
