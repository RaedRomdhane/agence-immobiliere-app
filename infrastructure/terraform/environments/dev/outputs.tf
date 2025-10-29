# Outputs pour l'environnement DEV

# Network Outputs
output "vpc_id" {
  description = "ID du VPC"
  value       = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "IDs des sous-réseaux publics"
  value       = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs des sous-réseaux privés"
  value       = module.network.private_subnet_ids
}

# Security Outputs
output "app_security_group_id" {
  description = "ID du security group de l'application"
  value       = module.security.app_security_group_id
}

output "database_security_group_id" {
  description = "ID du security group de la base de données"
  value       = module.security.database_security_group_id
}

# Database Outputs
output "database_endpoint" {
  description = "Endpoint de connexion à la base de données"
  value       = module.database.cluster_endpoint
}

output "database_reader_endpoint" {
  description = "Endpoint de lecture de la base de données"
  value       = module.database.cluster_reader_endpoint
}

output "database_port" {
  description = "Port de la base de données"
  value       = module.database.cluster_port
}

output "database_secret_name" {
  description = "Nom du secret contenant le mot de passe DB"
  value       = module.database.secret_name
}

output "connection_string" {
  description = "Chaîne de connexion MongoDB (sans mot de passe)"
  value       = module.database.connection_string
  sensitive   = true
}

# Informations générales
output "environment" {
  description = "Nom de l'environnement"
  value       = local.environment
}

output "region" {
  description = "Région AWS utilisée"
  value       = var.region
}
