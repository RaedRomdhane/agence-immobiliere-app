# Module Database - Amazon DocumentDB

Ce module Terraform crée un cluster Amazon DocumentDB (compatible MongoDB) avec toutes les fonctionnalités de sécurité et de monitoring.

## 📦 Ressources créées

### Cluster DocumentDB
- Cluster DocumentDB 5.0 (compatible MongoDB 4.0+)
- Instances multi-AZ pour haute disponibilité
- Chiffrement au repos avec KMS
- Backups automatiques quotidiens

### Sécurité
- **Mot de passe aléatoire** généré automatiquement
- **AWS Secrets Manager** pour stockage sécurisé
- **TLS/SSL** activé par défaut
- **VPC isolation** (sous-réseaux privés uniquement)
- **Security Groups** pour contrôle d'accès

### Monitoring
- **CloudWatch Alarms** pour CPU et connexions
- **Audit logs** optionnels
- **Profiler logs** optionnels
- Métriques automatiques

### Backups & Maintenance
- Backups quotidiens (rétention configurable)
- Fenêtre de backup : 3h-4h UTC
- Fenêtre de maintenance : Dimanche 4h-5h UTC
- Snapshot final en production

## 📝 Variables

| Variable | Description | Type | Défaut | Production |
|----------|-------------|------|--------|------------|
| `project_name` | Nom du projet | string | - | - |
| `environment` | Environnement | string | - | "prod" |
| `private_subnet_ids` | IDs sous-réseaux privés | list(string) | - | Multi-AZ |
| `security_group_id` | ID du SG database | string | - | - |
| `availability_zones` | Zones de disponibilité | list(string) | - | ≥ 2 AZs |
| `db_username` | Nom d'utilisateur | string | "admin" | "admin" |
| `db_port` | Port | number | 27017 | 27017 |
| `instance_class` | Classe d'instance | string | "db.t3.medium" | "db.r5.large" |
| `instance_count` | Nombre d'instances | number | 1 | ≥ 3 |
| `backup_retention_days` | Jours de rétention | number | 7 | 30 |
| `enable_tls` | Activer TLS | bool | true | **true** |
| `enable_audit_logs` | Logs d'audit | bool | false | **true** |
| `kms_key_id` | Clé KMS | string | null | Recommandé |
| `alarm_actions` | Actions alarmes | list(string) | [] | SNS topic |

## 📤 Outputs

| Output | Description | Sensible |
|--------|-------------|----------|
| `cluster_id` | ID du cluster | Non |
| `cluster_arn` | ARN du cluster | Non |
| `cluster_endpoint` | Endpoint écriture | Non |
| `cluster_reader_endpoint` | Endpoint lecture | Non |
| `cluster_port` | Port | Non |
| `instance_endpoints` | Endpoints instances | Non |
| `secret_arn` | ARN du secret | **Oui** |
| `secret_name` | Nom du secret | Non |
| `db_username` | Username | **Oui** |
| `connection_string` | Chaîne de connexion | **Oui** |

## 🚀 Utilisation

### Configuration Dev
```hcl
module "database" {
  source = "../../modules/database"

  project_name        = "agence-immobiliere"
  environment         = "dev"
  private_subnet_ids  = module.network.private_subnet_ids
  security_group_id   = module.security.database_security_group_id
  availability_zones  = ["eu-west-3a"]
  
  instance_class         = "db.t3.medium"   # Petit pour dev
  instance_count         = 1                 # Une seule instance
  backup_retention_days  = 1                 # Backup minimal
  enable_tls             = false             # TLS désactivé (simplifie dev)
  enable_audit_logs      = false             # Pas de logs en dev
  
  tags = {
    Project   = "Agence Immobiliere"
    ManagedBy = "Terraform"
  }
}
```

### Configuration Production
```hcl
module "database" {
  source = "../../modules/database"

  project_name        = "agence-immobiliere"
  environment         = "prod"
  private_subnet_ids  = module.network.private_subnet_ids
  security_group_id   = module.security.database_security_group_id
  availability_zones  = ["eu-west-3a", "eu-west-3b", "eu-west-3c"]
  
  instance_class         = "db.r5.large"     # Performance
  instance_count         = 3                  # Haute disponibilité
  backup_retention_days  = 30                 # Rétention longue
  enable_tls             = true               # TLS obligatoire
  enable_audit_logs      = true               # Conformité
  kms_key_id             = aws_kms_key.db.id  # Chiffrement custom
  alarm_actions          = [aws_sns_topic.alerts.arn]
  
  tags = {
    Project     = "Agence Immobiliere"
    Environment = "Production"
    ManagedBy   = "Terraform"
    Compliance  = "Required"
  }
}
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│             VPC (10.0.0.0/16)               │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │   Private Subnet (AZ-A)            │    │
│  │   10.0.10.0/24                     │    │
│  │                                    │    │
│  │   ┌──────────────────────────┐    │    │
│  │   │  DocumentDB Instance 1   │    │    │
│  │   │  (Primary - Read/Write)  │    │    │
│  │   └──────────────────────────┘    │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │   Private Subnet (AZ-B)            │    │
│  │   10.0.20.0/24                     │    │
│  │                                    │    │
│  │   ┌──────────────────────────┐    │    │
│  │   │  DocumentDB Instance 2   │    │    │
│  │   │  (Replica - Read Only)   │    │    │
│  │   └──────────────────────────┘    │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │   Secrets Manager                  │    │
│  │   • DB Password (encrypted)        │    │
│  │   • Auto rotation (optional)       │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │   CloudWatch                       │    │
│  │   • CPU Alarm (>80%)               │    │
│  │   • Connections Alarm (>80)        │    │
│  │   • Audit Logs                     │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## 🔐 Sécurité

### Chiffrement
1. **Au repos** : Tous les données chiffrées avec KMS
2. **En transit** : TLS 1.2+ obligatoire en production
3. **Backups** : Chiffrés automatiquement

### Gestion des secrets
```hcl
# Récupérer le mot de passe depuis l'application
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = module.database.secret_name
}

# Utiliser dans la connexion
password = jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string)
```

### Accès réseau
- ✅ **Sous-réseaux privés uniquement** (pas d'IP publique)
- ✅ **Security Group** restreint à l'application
- ✅ **VPC isolation** complète

## 💰 Estimation des coûts

### Dev Environment
```
Instance    : db.t3.medium x1     = $0.082/h  = $60/mois
Storage     : 10 GB                = $0.10/GB  = $1/mois
Backups     : 10 GB (1 jour)       = $0.02/GB  = $0.20/mois
────────────────────────────────────────────────────────
TOTAL DEV                                      ≈ $61/mois
```

### Production Environment
```
Instances   : db.r5.large x3      = $0.29/h   = $626/mois
Storage     : 100 GB               = $0.10/GB  = $10/mois
Backups     : 1 TB (30 jours)      = $0.02/GB  = $20/mois
────────────────────────────────────────────────────────
TOTAL PROD                                    ≈ $656/mois
```

**⚠️ Important** : DocumentDB coûte plus cher que MongoDB self-hosted, mais offre :
- Gestion automatique (pas de DevOps time)
- Backups automatiques
- Haute disponibilité native
- Sécurité AWS

## 📊 Monitoring

### CloudWatch Alarms inclus

1. **CPU High (>80%)**
   - Période : 5 minutes
   - Évaluations : 2 consécutives
   - Action : SNS notification

2. **Connections High (>80)**
   - Période : 5 minutes
   - Évaluations : 2 consécutives
   - Action : SNS notification

### Métriques disponibles
- CPUUtilization
- DatabaseConnections
- FreeableMemory
- WriteIOPS / ReadIOPS
- DatabaseCursors
- Transactions

## 🔧 Connexion à la base

### Depuis l'application Node.js
```javascript
const mongoose = require('mongoose');
const AWS = require('aws-sdk');

// Récupérer le mot de passe depuis Secrets Manager
const secretsManager = new AWS.SecretsManager();
const secret = await secretsManager.getSecretValue({
  SecretId: process.env.DB_SECRET_NAME
}).promise();

const password = JSON.parse(secret.SecretString);

// Connexion avec TLS
const connectionString = `mongodb://${process.env.DB_USERNAME}:${password}@${process.env.DB_ENDPOINT}:27017/agence_immobiliere?tls=true&tlsCAFile=rds-combined-ca-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

mongoose.connect(connectionString);
```

### Certificat TLS
```bash
# Télécharger le certificat CA AWS
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```

## 🛠️ Maintenance

### Backups
- **Automatiques** : Tous les jours pendant la fenêtre définie
- **Rétention** : Configurable (7 jours par défaut)
- **Final snapshot** : Créé automatiquement en prod avant suppression

### Mises à jour
- **Minor versions** : Automatiques pendant la fenêtre de maintenance
- **Major versions** : Manuelles (requiert planification)
- **Fenêtre** : Dimanche 4h-5h UTC (personnalisable)

### Scaling
```hcl
# Scaler verticalement (instance plus grosse)
instance_class = "db.r5.xlarge"  # Au lieu de db.r5.large

# Scaler horizontalement (plus d'instances)
instance_count = 5  # Au lieu de 3
```

## ⚠️ Limitations DocumentDB

1. **Pas 100% compatible MongoDB**
   - Certaines fonctionnalités manquantes
   - Tester votre application avant migration

2. **Coût**
   - Plus cher que MongoDB self-hosted
   - Mais inclut gestion, backups, HA

3. **Performance**
   - Latence légèrement supérieure à MongoDB natif
   - Optimisé pour AWS

## 🎯 Bonnes pratiques

### Dev
- ✅ 1 seule instance (économie)
- ✅ TLS désactivé (simplifie dev)
- ✅ Backup 1 jour
- ✅ db.t3.medium

### Prod
- ✅ 3+ instances (HA)
- ✅ TLS activé (sécurité)
- ✅ Backup 30 jours
- ✅ db.r5.large ou plus
- ✅ KMS custom key
- ✅ Audit logs activés
- ✅ Alarmes SNS configurées
- ✅ Deletion protection activée

## 📋 Prérequis

- Terraform >= 1.0
- Provider AWS configuré
- VPC et subnets créés (module network)
- Security Groups créés (module security)
- KMS key (optionnel, pour prod)

## 📚 Références

- [DocumentDB Documentation](https://docs.aws.amazon.com/documentdb/)
- [MongoDB Compatibility](https://docs.aws.amazon.com/documentdb/latest/developerguide/functional-differences.html)
- [Best Practices](https://docs.aws.amazon.com/documentdb/latest/developerguide/best_practices.html)
