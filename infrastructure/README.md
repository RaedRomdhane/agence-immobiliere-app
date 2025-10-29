# Infrastructure as Code - Agence Immobilière

Ce répertoire contient toute l'infrastructure as code pour l'application Agence Immobilière.

## 📁 Structure

```
infrastructure/
├── terraform/              # Configuration Terraform
│   ├── modules/           # Modules réutilisables
│   │   ├── database/     # Module base de données (MongoDB/PostgreSQL)
│   │   ├── network/      # Module réseau (VPC, subnets, etc.)
│   │   └── security/     # Module sécurité (groupes, IAM, etc.)
│   ├── environments/      # Configurations par environnement
│   │   ├── dev/          # Environnement de développement
│   │   ├── staging/      # Environnement de pré-production
│   │   └── prod/         # Environnement de production
│   └── .gitignore        # Fichiers Terraform à ignorer
├── scripts/               # Scripts d'automatisation
└── docs/                  # Documentation infrastructure
```

## 🚀 Quick Start

### Prérequis

- [Terraform](https://www.terraform.io/downloads) >= 1.0
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) (si déploiement sur Azure)
- [AWS CLI](https://aws.amazon.com/cli/) (si déploiement sur AWS)

### Installation

1. Se connecter au cloud provider :
```bash
# Azure
az login

# AWS
aws configure
```

2. Initialiser Terraform :
```bash
cd infrastructure/terraform/environments/dev
terraform init
```

3. Planifier le déploiement :
```bash
terraform plan
```

4. Appliquer les changements :
```bash
terraform apply
```

## 📋 Modules disponibles

### Database Module
Configuration de la base de données (MongoDB/PostgreSQL) avec :
- Instances haute disponibilité
- Backup automatique
- Monitoring

### Network Module
Configuration réseau avec :
- VPC/Virtual Network
- Subnets publics et privés
- NAT Gateway
- Security Groups

### Security Module
Configuration sécurité avec :
- IAM roles et policies
- Secrets management
- Encryption at rest

## 🌍 Environnements

### Development (dev)
- Ressources minimales
- Coûts optimisés
- Idéal pour les tests

### Staging
- Configuration similaire à la production
- Pour tests d'intégration et validation
- Données de test

### Production (prod)
- Haute disponibilité
- Monitoring avancé
- Backup réguliers
- Performance optimisée

## 📝 Conventions

- Tous les fichiers Terraform utilisent l'extension `.tf`
- Les variables sont définies dans `variables.tf`
- Les outputs dans `outputs.tf`
- Configuration backend dans `backend.tf`
- Providers dans `providers.tf`

## 🔐 Sécurité

- ⚠️ Ne jamais commiter de secrets ou credentials
- Utiliser des variables d'environnement ou secret managers
- Les fichiers `.tfvars` sont dans `.gitignore`
- Activer le chiffrement pour tous les services

## 🛠️ Commandes utiles

```bash
# Initialiser Terraform
terraform init

# Valider la syntaxe
terraform validate

# Formater le code
terraform fmt -recursive

# Planifier les changements
terraform plan

# Appliquer les changements
terraform apply

# Détruire l'infrastructure
terraform destroy

# Lister les ressources
terraform state list

# Afficher une ressource
terraform state show <resource>
```

## 📚 Documentation

Pour plus de détails, consultez :
- [Terraform Documentation](https://www.terraform.io/docs)
- Documentation spécifique dans `docs/`

## 🤝 Contribution

1. Créer une branche feature
2. Faire vos modifications
3. Tester avec `terraform plan`
4. Créer une PR
5. Attendre validation avant merge

## 📊 État de l'infrastructure

| Environnement | État | Dernière mise à jour |
|---------------|------|---------------------|
| Dev           | 🟡 En cours | - |
| Staging       | ⚪ Pas configuré | - |
| Production    | ⚪ Pas configuré | - |

---

**Ticket** : AW-10 - Infrastructure as Code  
**Date** : Octobre 2025  
**Équipe** : DevOps
