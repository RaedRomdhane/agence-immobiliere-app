# Variables globales pour l'infrastructure

variable "project_name" {
  description = "Nom du projet"
  type        = string
  default     = "agence-immobiliere"
}

variable "environment" {
  description = "Environnement de déploiement"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "L'environnement doit être dev, staging ou prod."
  }
}

variable "region" {
  description = "Région AWS pour le déploiement"
  type        = string
  default     = "eu-west-3" # Paris
}

variable "availability_zones" {
  description = "Zones de disponibilité"
  type        = list(string)
  default     = ["eu-west-3a", "eu-west-3b"]
}

variable "tags" {
  description = "Tags communs pour toutes les ressources"
  type        = map(string)
  default = {
    Project   = "Agence Immobiliere"
    ManagedBy = "Terraform"
  }
}

# Variables réseau
variable "vpc_cidr" {
  description = "CIDR block pour le VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks pour les sous-réseaux publics"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks pour les sous-réseaux privés"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

# Variables base de données
variable "db_instance_class" {
  description = "Classe d'instance pour la base de données"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Nom de la base de données"
  type        = string
  default     = "agence_immobiliere"
}

variable "db_username" {
  description = "Nom d'utilisateur de la base de données"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "db_port" {
  description = "Port de la base de données"
  type        = number
  default     = 27017 # MongoDB
}

variable "db_storage_size" {
  description = "Taille du stockage en GB"
  type        = number
  default     = 20
}

variable "db_backup_retention_days" {
  description = "Nombre de jours de rétention des backups"
  type        = number
  default     = 7
}

variable "enable_multi_az" {
  description = "Activer le multi-AZ pour la haute disponibilité"
  type        = bool
  default     = false
}
