# Environnement DEV - Configuration Terraform

## 📋 Vue d'ensemble

Cet environnement est optimisé pour le **développement local** avec des coûts minimisés (~**$61/mois**).

### Optimisations de coûts appliquées :
- ❌ **NAT Gateway désactivé** → Économie de ~$32/mois
- ❌ **TLS désactivé** sur DocumentDB → Mode développement
- 🔢 **Une seule instance** de base de données
- 📦 **Rétention des backups** : 1 jour seulement
- 🔍 **Logs d'audit activés** pour debug

## 🏗️ Architecture déployée

```
Internet
   ↓
   VPC (10.0.0.0/16)
   ├── Public Subnets (10.0.1.0/24, 10.0.2.0/24)
   │   └── Application (pas encore déployée)
   │
   └── Private Subnets (10.0.10.0/24, 10.0.20.0/24)
       └── DocumentDB Cluster (1 instance db.t3.medium)
```

## 📦 Ressources créées

### Network Module
- 1 VPC avec DNS activé
- 2 Sous-réseaux publics (Multi-AZ)
- 2 Sous-réseaux privés (Multi-AZ)
- 1 Internet Gateway
- Tables de routage

### Security Module
- Security Group Application (ports 80, 443, 5000, SSH)
- Security Group Base de données (port 27017, accessible uniquement depuis l'app)
- Isolation stricte entre les couches

### Database Module
- Cluster DocumentDB 5.0 (compatible MongoDB 4.0)
- 1 Instance db.t3.medium
- Mot de passe auto-généré (32 caractères)
- Stockage sécurisé dans AWS Secrets Manager
- Alarmes CloudWatch (CPU, connexions)
- Backups quotidiens (rétention 1 jour)

## 💰 Estimation des coûts

| Ressource | Coût mensuel (approximatif) |
|-----------|------------------------------|
| VPC + Subnets | Gratuit |
| DocumentDB (1x db.t3.medium) | ~$61 |
| Secrets Manager | ~$0.40 |
| CloudWatch Logs | ~$0.50 |
| **TOTAL** | **~$62/mois** |

💡 **Économie** : Le NAT Gateway coûterait $32 supplémentaires → désactivé en DEV

## 🚀 Prérequis

1. **Terraform** >= 1.5.0
   ```powershell
   terraform version
   ```

2. **AWS CLI** configuré avec credentials valides
   ```powershell
   aws configure
   # OU vérifier les credentials existantes
   aws sts get-caller-identity
   ```

3. **Droits AWS** nécessaires :
   - VPC (création VPC, subnets, routes)
   - DocumentDB (création clusters)
   - Secrets Manager (création secrets)
   - CloudWatch (création alarmes)
   - IAM (tags sur ressources)

## ⚙️ Configuration

### 1. Créer le fichier de variables

```powershell
# Copier l'exemple
Copy-Item terraform.tfvars.example terraform.tfvars
```

### 2. Éditer `terraform.tfvars`

**IMPORTANT** : Ajouter vos IPs publiques autorisées pour SSH

```hcl
# Votre IP publique (trouvez-la sur https://ifconfig.me)
ssh_allowed_ips = [
  "203.0.113.42/32",  # Remplacer par votre IP
]
```

### 3. (Optionnel) Activer le backend S3

Pour stocker l'état Terraform à distance (recommandé pour le travail en équipe) :

1. Créer un bucket S3 :
   ```powershell
   aws s3 mb s3://agence-immo-terraform-state-dev
   ```

2. Décommenter la section `backend "s3"` dans `main.tf`

3. Mettre à jour les valeurs :
   ```hcl
   backend "s3" {
     bucket = "agence-immo-terraform-state-dev"
     key    = "dev/terraform.tfstate"
     region = "eu-west-3"
   }
   ```

## 🔧 Commandes Terraform

### Initialisation

```powershell
# Première fois : télécharger les providers
terraform init
```

### Formatage et validation

```powershell
# Formater le code
terraform fmt -recursive

# Valider la syntaxe
terraform validate
```

### Planification

```powershell
# Voir les changements prévus (sans appliquer)
terraform plan

# Sauvegarder le plan
terraform plan -out=tfplan
```

### Déploiement

```powershell
# Déployer l'infrastructure
terraform apply

# OU appliquer un plan sauvegardé
terraform apply tfplan
```

⏱️ **Durée** : ~15-20 minutes (création du cluster DocumentDB)

### Destruction

```powershell
# Détruire toute l'infrastructure
terraform destroy
```

⚠️ **ATTENTION** : Supprime TOUTES les ressources, y compris les données !

## 📊 Récupérer les informations

### Voir tous les outputs

```powershell
terraform output
```

### Outputs disponibles

```powershell
# Endpoint de la base de données
terraform output database_endpoint

# IDs des security groups
terraform output app_security_group_id
terraform output database_security_group_id

# Nom du secret (contient le mot de passe DB)
terraform output database_secret_name
```

### Récupérer le mot de passe de la base de données

```powershell
# Via AWS CLI
$secretName = terraform output -raw database_secret_name
aws secretsmanager get-secret-value --secret-id $secretName --query SecretString --output text | ConvertFrom-Json
```

## 🔌 Se connecter à la base de données

### 1. Récupérer les informations

```powershell
$endpoint = terraform output -raw database_endpoint
$username = "admin"  # (ou votre valeur dans terraform.tfvars)
$port = terraform output -raw database_port

# Récupérer le mot de passe
$secretName = terraform output -raw database_secret_name
$password = (aws secretsmanager get-secret-value --secret-id $secretName --query SecretString --output text | ConvertFrom-Json).password
```

### 2. Connexion avec MongoDB Compass

```
mongodb://<username>:<password>@<endpoint>:27017/?tls=false&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
```

### 3. Connexion avec mongosh

```powershell
mongosh "mongodb://${username}:${password}@${endpoint}:${port}/?tls=false&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
```

⚠️ **Note** : TLS est désactivé en DEV uniquement !

## 🐛 Dépannage

### Erreur "No valid credential sources"

```powershell
# Configurer AWS CLI
aws configure

# Ou utiliser des variables d'environnement
$env:AWS_ACCESS_KEY_ID="..."
$env:AWS_SECRET_ACCESS_KEY="..."
$env:AWS_DEFAULT_REGION="eu-west-3"
```

### Erreur "UnauthorizedOperation"

Vérifier que votre utilisateur IAM a les permissions nécessaires.

### Erreur "InvalidParameterValue" sur DocumentDB

Vérifier que les subnets sont dans au moins 2 AZs différentes.

### Timeout lors de la création du cluster

C'est normal, la création d'un cluster DocumentDB prend 15-20 minutes.

## 📝 Variables disponibles

| Variable | Description | Valeur par défaut | Obligatoire |
|----------|-------------|-------------------|-------------|
| `region` | Région AWS | `eu-west-3` | Non |
| `vpc_cidr` | CIDR du VPC | `10.0.0.0/16` | Non |
| `public_subnet_cidrs` | CIDRs des subnets publics | `["10.0.1.0/24", "10.0.2.0/24"]` | Non |
| `private_subnet_cidrs` | CIDRs des subnets privés | `["10.0.10.0/24", "10.0.20.0/24"]` | Non |
| `availability_zones` | Zones de disponibilité | `["eu-west-3a", "eu-west-3b"]` | Non |
| `db_username` | Nom d'utilisateur DB | `admin` | Non |
| `db_port` | Port DocumentDB | `27017` | Non |
| `ssh_allowed_ips` | IPs autorisées pour SSH | `[]` | **OUI** |

## 🔐 Sécurité

### Bonnes pratiques appliquées :
- ✅ Mots de passe générés aléatoirement (32 caractères)
- ✅ Stockage sécurisé dans AWS Secrets Manager
- ✅ Base de données isolée dans subnets privés
- ✅ Security Groups avec principe du moindre privilège
- ✅ Chiffrement au repos activé (KMS)
- ✅ Logs d'audit activés
- ✅ Tags sur toutes les ressources

### À faire avant la production :
- 🔐 Activer TLS sur DocumentDB
- 🔒 Désactiver SSH ou restreindre aux IPs du bureau
- 📦 Augmenter la rétention des backups (7-30 jours)
- 🚀 Ajouter un NAT Gateway pour accès internet sortant
- 🔔 Configurer les notifications SNS pour les alarmes

## 📚 Ressources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Amazon DocumentDB](https://docs.aws.amazon.com/documentdb/)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)

## 🆘 Support

En cas de problème :
1. Vérifier les logs CloudWatch
2. Consulter `terraform plan` pour voir les différences
3. Vérifier les Security Groups et règles de routage
4. Contacter l'équipe DevOps

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024
