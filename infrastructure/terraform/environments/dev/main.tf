# Configuration Terraform pour l'environnement DEV

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Backend S3 pour stocker le state (à décommenter après création du bucket)
  # backend "s3" {
  #   bucket         = "agence-immobiliere-terraform-state"
  #   key            = "dev/terraform.tfstate"
  #   region         = "eu-west-3"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

# Provider AWS
provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Environment = "dev"
      Project     = "Agence Immobiliere"
      ManagedBy   = "Terraform"
      CreatedBy   = "DevOps Team"
    }
  }
}

# Variables locales
locals {
  project_name = "agence-immobiliere"
  environment  = "dev"

  common_tags = {
    Environment = local.environment
    Project     = local.project_name
    ManagedBy   = "Terraform"
  }
}

# Module Network
module "network" {
  source = "../../modules/network"

  project_name         = local.project_name
  environment          = local.environment
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  enable_nat_gateway   = false # Désactivé en dev pour économiser

  tags = local.common_tags
}

# Module Security
module "security" {
  source = "../../modules/security"

  project_name          = local.project_name
  environment           = local.environment
  vpc_id                = module.network.vpc_id
  vpc_cidr              = module.network.vpc_cidr
  db_port               = var.db_port
  allowed_cidr_blocks   = ["0.0.0.0/0"] # En dev, on permet tout
  enable_ssh            = true          # SSH activé en dev
  ssh_allowed_ips       = var.ssh_allowed_ips
  enable_load_balancer  = false

  tags = local.common_tags
}

# Module Database
module "database" {
  source = "../../modules/database"

  project_name          = local.project_name
  environment           = local.environment
  private_subnet_ids    = module.network.private_subnet_ids
  security_group_id     = module.security.database_security_group_id
  availability_zones    = var.availability_zones
  db_username           = var.db_username
  db_port               = var.db_port
  instance_class        = "db.t3.medium"
  instance_count        = 1 # Une seule instance en dev
  backup_retention_days = 1 # Rétention minimale en dev
  enable_tls            = false # Désactivé en dev pour simplifier
  enable_audit_logs     = false

  tags = local.common_tags
}
