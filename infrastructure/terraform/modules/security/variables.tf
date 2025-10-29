# Variables pour le module Security

variable "project_name" {
  description = "Nom du projet"
  type        = string
}

variable "environment" {
  description = "Environnement de déploiement"
  type        = string
}

variable "vpc_id" {
  description = "ID du VPC"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block du VPC"
  type        = string
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks autorisés à accéder à l'application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "db_port" {
  description = "Port de la base de données"
  type        = number
  default     = 27017
}

variable "enable_ssh" {
  description = "Activer l'accès SSH"
  type        = bool
  default     = false
}

variable "ssh_allowed_ips" {
  description = "IPs autorisées pour SSH"
  type        = list(string)
  default     = []
}

variable "enable_load_balancer" {
  description = "Créer un security group pour le load balancer"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags communs pour toutes les ressources"
  type        = map(string)
  default     = {}
}
