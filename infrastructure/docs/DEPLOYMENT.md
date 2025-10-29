# 🏗️ Infrastructure as Code - Agence Immobilière

Documentation complète pour le déploiement et la gestion de l'infrastructure AWS via Terraform.

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Prérequis](#-prérequis)
- [Architecture](#️-architecture)
- [Structure des fichiers](#-structure-des-fichiers)
- [Déploiement](#-déploiement)
- [Gestion de l'infrastructure](#️-gestion-de-linfrastructure)
- [Environnements](#-environnements)
- [Troubleshooting](#-troubleshooting)

## 🎯 Vue d'ensemble

L'infrastructure est définie comme du code (IaC) en utilisant Terraform pour garantir :

- ✅ Reproductibilité des environnements
- ✅ Versionning de l'infrastructure
- ✅ Déploiements automatisés
- ✅ Rollback facile en cas de problème
- ✅ Documentation vivante

### Composants déployés

- **VPC** : Réseau privé virtuel isolé
- **Subnets** : Sous-réseaux publics et privés multi-AZ
- **Security Groups** : Règles de pare-feu pour l'app et la DB
- **DocumentDB** : Base de données MongoDB managée
- **Internet Gateway** : Accès Internet pour les ressources publiques
- **NAT Gateway** : Accès Internet sortant pour les ressources privées (staging/prod uniquement)

## 🔧 Prérequis

### Outils requis

```bash
# Terraform >= 1.5.0
terraform --version

# AWS CLI >= 2.0
aws --version

# jq (pour parser les outputs JSON)
jq --version
```

### Installation

#### Terraform

```bash
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Windows
choco install terraform
```

#### AWS CLI

```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows (PowerShell en tant qu'administrateur)
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

### Configuration AWS

```bash
# Configurer les credentials AWS
aws configure

# Vérifier la configuration
aws sts get-caller-identity
```

Résultat attendu :

```json
{
    "UserId": "AIDXXXXXXXXXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/votre-nom"
}
```

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         VPC (10.0.0.0/16)                   │
│                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐     │
│  │  Public Subnet 1     │    │  Public Subnet 2     │     │
│  │  (10.0.1.0/24)       │    │  (10.0.2.0/24)       │     │
│  │  AZ: eu-west-3a      │    │  AZ: eu-west-3b      │     │
│  │                      │    │                      │     │
│  │  ┌──────────────┐    │    │  ┌──────────────┐   │     │
│  │  │ NAT Gateway  │    │    │  │ Load Balancer│   │     │
│  │  └──────────────┘    │    │  └──────────────┘   │     │
│  └──────────────────────┘    └──────────────────────┘     │
│             │                            │                 │
│             ▼                            ▼                 │
│  ┌──────────────────────┐    ┌──────────────────────┐     │
│  │  Private Subnet 1    │    │  Private Subnet 2    │     │
│  │  (10.0.10.0/24)      │    │  (10.0.20.0/24)      │     │
│  │  AZ: eu-west-3a      │    │  AZ: eu-west-3b      │     │
│  │                      │    │                      │     │
│  │  ┌──────────────┐    │    │  ┌──────────────┐   │     │
│  │  │ DocumentDB   │    │    │  │ DocumentDB   │   │     │
│  │  │ Instance 1   │    │    │  │ Instance 2   │   │     │
│  │  └──────────────┘    │    │  └──────────────┘   │     │
│  └──────────────────────┘    └──────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Internet Gateway │
                    └──────────────────┘
```

## 📁 Structure des fichiers

```
infrastructure/
├── terraform/
│   ├── modules/
│   │   ├── network/          # Module VPC, Subnets, IGW, NAT
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   └── README.md
│   │   ├── security/         # Module Security Groups
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   └── README.md
│   │   └── database/         # Module DocumentDB
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       ├── outputs.tf
│   │       └── README.md
│   ├── environments/
│   │   ├── dev/              # Configuration dev
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   ├── terraform.tfvars.example
│   │   │   └── README.md
│   │   ├── staging/          # Configuration staging
│   │   └── prod/             # Configuration production
│   ├── variables.tf          # Variables globales
│   └── .gitignore
├── scripts/
│   ├── deploy.ps1            # Script de déploiement (Windows)
│   ├── deploy.sh             # Script de déploiement (Linux/Mac)
│   ├── validate.ps1          # Script de validation
│   └── README.md
├── docs/
│   └── DEPLOYMENT.md         # Cette documentation
└── README.md
```

## 🚀 Déploiement

### Méthode 1 : Avec le script automatisé (recommandé)

#### Windows (PowerShell)

```powershell
# Validation avant déploiement
.\infrastructure\scripts\validate.ps1 -Environment dev

# Voir le plan de déploiement
.\infrastructure\scripts\deploy.ps1 -Environment dev -Action plan

# Appliquer les changements
.\infrastructure\scripts\deploy.ps1 -Environment dev -Action apply

# Détruire l'infrastructure (attention!)
.\infrastructure\scripts\deploy.ps1 -Environment dev -Action destroy
```

#### Linux/Mac (Bash)

```bash
# Se placer à la racine du projet
cd infrastructure/scripts

# Voir le plan de déploiement
./deploy.sh dev plan

# Appliquer les changements
./deploy.sh dev apply

# Détruire l'infrastructure (attention!)
./deploy.sh dev destroy
```

### Méthode 2 : Manuellement avec Terraform

```bash
# Se placer dans le dossier de l'environnement
cd infrastructure/terraform/environments/dev

# Initialiser Terraform
terraform init

# Voir le plan
terraform plan

# Appliquer
terraform apply

# Voir les outputs
terraform output

# Détruire
terraform destroy
```

### Première utilisation

```bash
# 1. Copier et configurer les variables
cd infrastructure/terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
# Éditer terraform.tfvars et ajouter vos IPs SSH

# 2. Initialiser Terraform
terraform init

# 3. Valider la configuration
terraform validate

# 4. Générer un plan
terraform plan -out=tfplan

# 5. Examiner le plan
terraform show tfplan

# 6. Appliquer le plan
terraform apply tfplan

# 7. Récupérer les informations de connexion
terraform output
```

## 🔐 Récupération du mot de passe de la base de données

Le mot de passe est stocké de manière sécurisée dans AWS Secrets Manager.

### Windows (PowerShell)

```powershell
# Récupérer le nom du secret
$secretName = terraform output -raw database_secret_name

# Récupérer le mot de passe
$secret = aws secretsmanager get-secret-value --secret-id $secretName --region eu-west-3 --query SecretString --output text | ConvertFrom-Json
$password = $secret.password
Write-Host "Password: $password"
```

### Linux/Mac (Bash)

```bash
# Récupérer le nom du secret
SECRET_NAME=$(terraform output -raw database_secret_name)

# Récupérer le mot de passe
aws secretsmanager get-secret-value \
  --secret-id $SECRET_NAME \
  --region eu-west-3 \
  --query SecretString \
  --output text | jq -r '.password'
```

## 🌍 Environnements

### DEV (Développement)

**Caractéristiques :**

- ✅ 1 instance DocumentDB (db.t3.medium)
- ❌ NAT Gateway désactivé (économie de coûts)
- ✅ SSH activé
- ❌ TLS désactivé (simplicité)
- 📦 Backup : 1 jour de rétention
- ⚠️ Pas de protection contre la suppression

**Coût estimé :** ~61€/mois

### Staging (Pré-production)

**Caractéristiques :**

- ✅ 2 instances DocumentDB
- ✅ NAT Gateway activé
- ✅ TLS activé
- 📦 Backup : 7 jours de rétention
- ❌ SSH désactivé
- ⚠️ Protection modérée

**Coût estimé :** ~300€/mois

### Production

**Caractéristiques :**

- ✅ 3 instances DocumentDB (haute disponibilité)
- ✅ Multi-AZ
- ✅ NAT Gateway activé
- ✅ TLS obligatoire
- ✅ Audit logs activés
- 📦 Backup : 30 jours de rétention
- 🔒 Protection contre la suppression activée
- 🔐 Chiffrement avec KMS

**Coût estimé :** ~656€/mois

## 🛠️ Gestion de l'infrastructure

### Mettre à jour l'infrastructure

```bash
# 1. Modifier les fichiers Terraform
# 2. Voir les changements
terraform plan

# 3. Appliquer les changements
terraform apply
```

### Rollback

```bash
# Si le state est sauvegardé dans S3
terraform state pull > backup.tfstate

# Revenir à l'état précédent
terraform apply -state=backup.tfstate
```

### Importer des ressources existantes

```bash
# Exemple : importer un VPC existant
terraform import module.network.aws_vpc.main vpc-xxxxxxxxx

# Exemple : importer un security group
terraform import module.security.aws_security_group.app sg-xxxxxxxxx
```

### Détruire proprement

```bash
# Environnement dev
./scripts/deploy.sh dev destroy

# Pour staging/prod, confirmation supplémentaire requise
./scripts/deploy.sh prod destroy
```

## 🐛 Troubleshooting

### Erreur : "Error locking state"

**Cause :** Verrouillage du state Terraform (un autre déploiement est en cours)

**Solution :**

```bash
# Forcer le déverrouillage (ATTENTION : seulement si vous êtes sûr)
terraform force-unlock <LOCK_ID>
```

### Erreur : "InvalidParameterException: Cannot create a cluster with the specified parameters"

**Cause :** Paramètres incompatibles (ex: db.t3.micro non supporté pour DocumentDB)

**Solution :** Utiliser au minimum `db.t3.medium`

### Erreur : "Insufficient capacity"

**Cause :** AWS n'a pas de capacité dans la zone choisie

**Solution :** Changer les zones de disponibilité dans `variables.tf`

```hcl
availability_zones = ["eu-west-3a", "eu-west-3c"]  # Essayer une autre AZ
```

### La base de données est inaccessible

**Vérifications :**

```bash
# 1. Vérifier le security group
aws ec2 describe-security-groups --group-ids <SG_ID>

# 2. Vérifier que la DB est dans un subnet privé
terraform output private_subnet_ids

# 3. Vérifier l'endpoint de la DB
terraform output database_endpoint

# 4. Tester la connectivité depuis une instance dans le VPC
# (la DB n'est accessible que depuis le VPC)
```

### Les coûts sont trop élevés

**Optimisations pour DEV :**

- ❌ Désactiver le NAT Gateway → Économie de ~32€/mois
- 📉 Utiliser une seule instance DocumentDB
- 📦 Réduire la rétention des backups à 1 jour
- ⏰ Arrêter les ressources la nuit (via Lambda scheduler)
- 🔍 Désactiver les audit logs en DEV

### Erreur : "No valid credential sources found"

**Solution :**

```bash
# Configurer AWS CLI
aws configure

# Ou utiliser des variables d'environnement
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="eu-west-3"
```

## 📊 Monitoring des coûts

```bash
# Voir les coûts AWS par service
aws ce get-cost-and-usage \
  --time-period Start=2025-10-01,End=2025-10-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE

# Activer Cost Explorer dans la console AWS
# https://console.aws.amazon.com/cost-management/
```

### Alertes de coûts recommandées

1. **Budget DEV** : Alerte à 80€/mois
2. **Budget Staging** : Alerte à 350€/mois
3. **Budget Production** : Alerte à 700€/mois

## ✅ Checklist de déploiement

### Avant le déploiement

- [ ] AWS CLI configuré avec les bonnes credentials
- [ ] Terraform installé (>= 1.5.0)
- [ ] Variables d'environnement définies dans `terraform.tfvars`
- [ ] IPs SSH autorisées configurées
- [ ] Plan Terraform généré et examiné
- [ ] Budget AWS défini et alertes configurées

### Après le déploiement

- [ ] Outputs Terraform récupérés
- [ ] Mot de passe DB récupéré depuis Secrets Manager
- [ ] Connectivité à la DB testée
- [ ] Security groups vérifiés
- [ ] Backups configurés et testés
- [ ] Monitoring CloudWatch activé
- [ ] Documentation mise à jour
- [ ] Tags appliqués sur toutes les ressources

## 🔒 Sécurité

### Bonnes pratiques implémentées

- ✅ Mots de passe générés aléatoirement (32 caractères)
- ✅ Stockage sécurisé dans AWS Secrets Manager
- ✅ Base de données isolée dans subnets privés
- ✅ Chiffrement au repos avec KMS
- ✅ TLS activé en staging/production
- ✅ Security Groups avec principe du moindre privilège
- ✅ Logs d'audit activés en production
- ✅ Backups automatiques avec rétention configurable

### Recommandations supplémentaires

- 🔐 Activer MFA sur le compte AWS
- 🔄 Rotation automatique des secrets
- 📝 Logs CloudTrail activés
- 🚨 Alertes SNS pour les événements de sécurité
- 🔍 AWS GuardDuty pour la détection de menaces

## 📞 Support

Pour toute question ou problème :

- 📚 **Documentation Terraform** : https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- 📖 **AWS DocumentDB** : https://docs.aws.amazon.com/documentdb/
- 💬 **Équipe DevOps** : devops@agence-immobiliere.com
- 🐛 **Issues GitHub** : https://github.com/RaedRomdhane/agence-immobiliere-app/issues

---

**Dernière mise à jour** : Octobre 2025  
**Version** : 1.0.0  
**Responsable** : Équipe DevOps
