# Outputs du module Database

output "cluster_id" {
  description = "ID du cluster DocumentDB"
  value       = aws_docdb_cluster.main.id
}

output "cluster_arn" {
  description = "ARN du cluster DocumentDB"
  value       = aws_docdb_cluster.main.arn
}

output "cluster_endpoint" {
  description = "Endpoint de connexion du cluster (écriture)"
  value       = aws_docdb_cluster.main.endpoint
}

output "cluster_reader_endpoint" {
  description = "Endpoint de lecture du cluster"
  value       = aws_docdb_cluster.main.reader_endpoint
}

output "cluster_port" {
  description = "Port du cluster"
  value       = aws_docdb_cluster.main.port
}

output "cluster_resource_id" {
  description = "Resource ID du cluster"
  value       = aws_docdb_cluster.main.cluster_resource_id
}

output "instance_endpoints" {
  description = "Endpoints des instances individuelles"
  value       = aws_docdb_cluster_instance.main[*].endpoint
}

output "instance_ids" {
  description = "IDs des instances DocumentDB"
  value       = aws_docdb_cluster_instance.main[*].id
}

output "secret_arn" {
  description = "ARN du secret contenant le mot de passe"
  value       = aws_secretsmanager_secret.db_password.arn
  sensitive   = true
}

output "secret_name" {
  description = "Nom du secret contenant le mot de passe"
  value       = aws_secretsmanager_secret.db_password.name
}

output "db_username" {
  description = "Nom d'utilisateur de la base de données"
  value       = var.db_username
  sensitive   = true
}

output "connection_string" {
  description = "Chaîne de connexion MongoDB (sans mot de passe)"
  value       = "mongodb://${var.db_username}@${aws_docdb_cluster.main.endpoint}:${aws_docdb_cluster.main.port}/?tls=${var.enable_tls}&tlsAllowInvalidCertificates=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
  sensitive   = true
}
