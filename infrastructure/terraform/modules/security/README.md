# Module Security

Ce module Terraform crée les Security Groups pour sécuriser l'infrastructure AWS.

## 📦 Ressources créées

### Security Group Application (Backend API)
- **Port 80 (HTTP)** : Accessible depuis Internet
- **Port 443 (HTTPS)** : Accessible depuis Internet
- **Port 5000** : Port applicatif Node.js (configurable)
- **Port 22 (SSH)** : Optionnel, pour debug uniquement (désactivé par défaut)
- **Egress** : Tout le trafic sortant autorisé

### Security Group Database
- **Port 27017 (MongoDB)** : Accessible uniquement depuis l'application
- **Port 27017 (MongoDB)** : Accessible depuis le VPC pour maintenance
- **Egress** : Tout le trafic sortant autorisé

### Security Group Load Balancer (Optionnel)
- **Port 80 (HTTP)** : Accessible depuis Internet
- **Port 443 (HTTPS)** : Accessible depuis Internet
- **Egress** : Tout le trafic sortant autorisé

## 🔒 Principe de sécurité

### Defense in Depth (Défense en profondeur)
```
Internet
    ↓
[ALB SG] → Port 80/443
    ↓
[APP SG] → Port 5000 (depuis ALB ou VPC)
    ↓
[DB SG]  → Port 27017 (depuis APP uniquement)
```

### Règles de sécurité
1. **Moindre privilège** : Chaque SG n'autorise que le strict nécessaire
2. **Isolation** : La DB n'est accessible QUE depuis l'application
3. **SSH désactivé par défaut** : À activer uniquement pour debug
4. **Traffic sortant** : Limité aux besoins (updates, monitoring)

## 📝 Variables

| Variable | Description | Type | Défaut |
|----------|-------------|------|--------|
| `project_name` | Nom du projet | string | - |
| `environment` | Environnement | string | - |
| `vpc_id` | ID du VPC | string | - |
| `vpc_cidr` | CIDR du VPC | string | - |
| `allowed_cidr_blocks` | CIDRs autorisés pour l'app | list(string) | ["0.0.0.0/0"] |
| `db_port` | Port de la DB | number | 27017 |
| `enable_ssh` | Activer SSH | bool | false |
| `ssh_allowed_ips` | IPs autorisées SSH | list(string) | [] |
| `enable_load_balancer` | Créer SG pour ALB | bool | false |
| `tags` | Tags communs | map(string) | {} |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `app_security_group_id` | ID du SG application |
| `app_security_group_name` | Nom du SG application |
| `database_security_group_id` | ID du SG database |
| `database_security_group_name` | Nom du SG database |
| `alb_security_group_id` | ID du SG ALB (si activé) |
| `alb_security_group_name` | Nom du SG ALB (si activé) |

## 🚀 Utilisation

```hcl
module "security" {
  source = "../../modules/security"

  project_name        = "agence-immobiliere"
  environment         = "dev"
  vpc_id              = module.network.vpc_id
  vpc_cidr            = "10.0.0.0/16"
  db_port             = 27017
  enable_ssh          = true  # Uniquement en dev
  ssh_allowed_ips     = ["203.0.113.0/24"]  # Votre IP publique
  enable_load_balancer = false  # true en prod

  tags = {
    Project   = "Agence Immobiliere"
    ManagedBy = "Terraform"
  }
}
```

## 🏗️ Règles détaillées

### Application Security Group
```
Ingress:
  - 0.0.0.0/0     → 80/tcp    (HTTP)
  - 0.0.0.0/0     → 443/tcp   (HTTPS)
  - VPC CIDR      → 5000/tcp  (Application)
  - Specific IPs  → 22/tcp    (SSH - if enabled)

Egress:
  - 0.0.0.0/0     → All       (Internet access)
```

### Database Security Group
```
Ingress:
  - APP SG        → 27017/tcp (MongoDB from app)
  - VPC CIDR      → 27017/tcp (Maintenance)

Egress:
  - 0.0.0.0/0     → All       (Updates)
```

### Load Balancer Security Group
```
Ingress:
  - 0.0.0.0/0     → 80/tcp    (HTTP)
  - 0.0.0.0/0     → 443/tcp   (HTTPS)

Egress:
  - 0.0.0.0/0     → All       (To targets)
```

## 🔐 Bonnes pratiques

### Dev Environment
```hcl
enable_ssh          = true   # Pour debugging
ssh_allowed_ips     = ["YOUR_IP/32"]  # Votre IP uniquement
enable_load_balancer = false  # Pas nécessaire en dev
```

### Production Environment
```hcl
enable_ssh          = false  # Désactiver SSH
enable_load_balancer = true   # ALB pour HA
allowed_cidr_blocks = ["10.0.0.0/16"]  # Limiter au VPC
```

## ⚠️ Considérations de sécurité

### SSH Access
- **Ne jamais** utiliser `0.0.0.0/0` pour SSH
- Utiliser des IPs spécifiques ou un bastion host
- Désactiver complètement en production

### Application Port
- Port 5000 : Limiter au VPC ou ALB uniquement
- Ne pas exposer directement sur Internet en production

### Database Access
- **Jamais** exposer le port DB sur Internet
- Accès uniquement depuis l'application
- Utiliser des Security Groups (pas des CIDRs) pour lier APP→DB

### HTTPS
- Activer HTTPS en production
- Utiliser AWS Certificate Manager pour les certificats
- Rediriger HTTP → HTTPS au niveau ALB

## 💰 Coûts

Les Security Groups sont **gratuits** !
- Pas de frais pour la création
- Pas de frais pour les règles
- Seulement le trafic réseau est facturé

## 📋 Prérequis

- VPC créé (module network)
- Terraform >= 1.0
- Provider AWS configuré

## 🔍 Debugging

### Vérifier les règles
```bash
# Lister les security groups
aws ec2 describe-security-groups --filters "Name=vpc-id,Values=vpc-xxxxx"

# Voir les règles d'un SG
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

### Tester la connectivité
```bash
# Depuis l'application vers la DB
telnet <db-host> 27017

# Depuis Internet vers l'application
curl http://<app-host>:5000/health
```

## 🎯 Checklist de sécurité

- [ ] SSH désactivé en production
- [ ] Port DB accessible uniquement depuis APP
- [ ] IPs SSH limitées (pas 0.0.0.0/0)
- [ ] HTTPS configuré en production
- [ ] Egress limité aux besoins réels
- [ ] Tags appliqués à tous les SG
- [ ] Monitoring activé (CloudWatch)
