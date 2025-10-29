# Outputs du module Security

output "app_security_group_id" {
  description = "ID du security group de l'application"
  value       = aws_security_group.app.id
}

output "app_security_group_name" {
  description = "Nom du security group de l'application"
  value       = aws_security_group.app.name
}

output "database_security_group_id" {
  description = "ID du security group de la base de données"
  value       = aws_security_group.database.id
}

output "database_security_group_name" {
  description = "Nom du security group de la base de données"
  value       = aws_security_group.database.name
}

output "alb_security_group_id" {
  description = "ID du security group du load balancer (si activé)"
  value       = var.enable_load_balancer ? aws_security_group.alb[0].id : null
}

output "alb_security_group_name" {
  description = "Nom du security group du load balancer (si activé)"
  value       = var.enable_load_balancer ? aws_security_group.alb[0].name : null
}
