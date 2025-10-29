# Variables pour le module Network

variable "project_name" {
  description = "Nom du projet"
  type        = string
}

variable "environment" {
  description = "Environnement de déploiement"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block pour le VPC"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "Liste des CIDR blocks pour les sous-réseaux publics"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "Liste des CIDR blocks pour les sous-réseaux privés"
  type        = list(string)
}

variable "availability_zones" {
  description = "Liste des zones de disponibilité"
  type        = list(string)
}

variable "enable_nat_gateway" {
  description = "Activer le NAT Gateway pour les sous-réseaux privés"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags communs pour toutes les ressources"
  type        = map(string)
  default     = {}
}
