# Module Network

Ce module Terraform crée l'infrastructure réseau AWS complète pour l'application.

## 📦 Ressources créées

### VPC (Virtual Private Cloud)
- VPC avec DNS support activé
- CIDR configurable (par défaut: 10.0.0.0/16)

### Sous-réseaux
- **Publics** : Pour les ressources accessibles depuis Internet (Load Balancers, NAT Gateway)
- **Privés** : Pour les ressources internes (Base de données, Application servers)
- Multi-AZ support (2 AZ par défaut)

### Routage
- **Internet Gateway** : Pour l'accès Internet depuis les sous-réseaux publics
- **NAT Gateway** : Pour l'accès Internet sortant depuis les sous-réseaux privés (optionnel)
- Tables de routage publiques et privées

### Sécurité
- Isolation réseau entre sous-réseaux publics et privés
- Support multi-AZ pour haute disponibilité

## 📝 Variables

| Variable | Description | Type | Défaut |
|----------|-------------|------|--------|
| `project_name` | Nom du projet | string | - |
| `environment` | Environnement (dev/staging/prod) | string | - |
| `vpc_cidr` | CIDR du VPC | string | - |
| `public_subnet_cidrs` | CIDRs des sous-réseaux publics | list(string) | - |
| `private_subnet_cidrs` | CIDRs des sous-réseaux privés | list(string) | - |
| `availability_zones` | Zones de disponibilité | list(string) | - |
| `enable_nat_gateway` | Activer NAT Gateway | bool | false |
| `tags` | Tags communs | map(string) | {} |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `vpc_id` | ID du VPC |
| `vpc_cidr` | CIDR du VPC |
| `public_subnet_ids` | IDs des sous-réseaux publics |
| `private_subnet_ids` | IDs des sous-réseaux privés |
| `internet_gateway_id` | ID de l'Internet Gateway |
| `nat_gateway_id` | ID du NAT Gateway |
| `public_route_table_id` | ID table de routage publique |
| `private_route_table_id` | ID table de routage privée |
| `availability_zones` | Zones de disponibilité utilisées |

## 🚀 Utilisation

```hcl
module "network" {
  source = "../../modules/network"

  project_name         = "agence-immobiliere"
  environment          = "dev"
  vpc_cidr             = "10.0.0.0/16"
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24"]
  availability_zones   = ["eu-west-3a", "eu-west-3b"]
  enable_nat_gateway   = true

  tags = {
    Project   = "Agence Immobiliere"
    ManagedBy = "Terraform"
  }
}
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                         VPC                              │
│                    10.0.0.0/16                          │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │  Public Subnet   │      │  Public Subnet   │       │
│  │   10.0.1.0/24    │      │   10.0.2.0/24    │       │
│  │    (AZ-A)        │      │    (AZ-B)        │       │
│  │                  │      │                  │       │
│  │  [NAT Gateway]   │      │                  │       │
│  └──────────────────┘      └──────────────────┘       │
│           │                         │                  │
│  ┌────────┴─────────────────────────┴────────┐        │
│  │         Internet Gateway (IGW)             │        │
│  └────────────────────────────────────────────┘        │
│           │                                            │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │ Private Subnet   │      │ Private Subnet   │       │
│  │  10.0.10.0/24    │      │  10.0.20.0/24    │       │
│  │    (AZ-A)        │      │    (AZ-B)        │       │
│  │                  │      │                  │       │
│  │   [Database]     │      │   [Database]     │       │
│  └──────────────────┘      └──────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 💰 Coûts

### NAT Gateway
- **Important** : Le NAT Gateway a un coût fixe (~$0.045/heure = ~$32/mois)
- Pour **dev**, il est recommandé de le désactiver (`enable_nat_gateway = false`)
- Pour **prod**, il est recommandé de l'activer pour la sécurité

### VPC et Subnets
- Gratuits (pas de frais pour VPC et subnets)

### Internet Gateway
- Gratuit (pas de frais fixes, seulement transfert de données)

## 🔒 Sécurité

- Les sous-réseaux privés n'ont **pas d'IP publique**
- Le trafic sortant des sous-réseaux privés passe par le NAT Gateway (si activé)
- Isolation réseau entre sous-réseaux publics et privés
- Support multi-AZ pour résilience

## 📋 Prérequis

- Terraform >= 1.0
- Provider AWS configuré
- Credentials AWS avec permissions appropriées

## ⚠️ Notes

1. Le NAT Gateway est optionnel et coûteux. Ne l'activez que si nécessaire.
2. Pour dev, vous pouvez placer la base de données dans un sous-réseau public (avec security group restrictif) pour économiser.
3. Les CIDR doivent être planifiés pour éviter les conflits entre environnements.
