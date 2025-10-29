# Variables pour le module Database

variable "project_name" {
  description = "Nom du projet"
  type        = string
}

variable "environment" {
  description = "Environnement"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs des sous-réseaux privés"
  type        = list(string)
}

variable "security_group_id" {
  description = "ID du security group de la base de données"
  type        = string
}

variable "availability_zones" {
  description = "Zones de disponibilité"
  type        = list(string)
}

variable "db_username" {
  description = "Nom d'utilisateur master"
  type        = string
  sensitive   = true
}

variable "db_port" {
  description = "Port de la base de données"
  type        = number
  default     = 27017
}

variable "instance_class" {
  description = "Classe d'instance DocumentDB"
  type        = string
  default     = "db.t3.medium"
}

variable "instance_count" {
  description = "Nombre d'instances dans le cluster"
  type        = number
  default     = 1
  validation {
    condition     = var.instance_count >= 1 && var.instance_count <= 16
    error_message = "Le nombre d'instances doit être entre 1 et 16."
  }
}

variable "backup_retention_days" {
  description = "Nombre de jours de rétention des backups"
  type        = number
  default     = 7
}

variable "enable_tls" {
  description = "Activer TLS pour les connexions"
  type        = bool
  default     = true
}

variable "enable_audit_logs" {
  description = "Activer les logs d'audit"
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "ID de la clé KMS pour le chiffrement"
  type        = string
  default     = null
}

variable "alarm_actions" {
  description = "ARNs SNS pour les alarmes"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags communs"
  type        = map(string)
  default     = {}
}
