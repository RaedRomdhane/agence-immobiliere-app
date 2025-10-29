# Outputs du module Network

output "vpc_id" {
  description = "ID du VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block du VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "Liste des IDs des sous-réseaux publics"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Liste des IDs des sous-réseaux privés"
  value       = aws_subnet.private[*].id
}

output "internet_gateway_id" {
  description = "ID de l'Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "nat_gateway_id" {
  description = "ID du NAT Gateway (si activé)"
  value       = var.enable_nat_gateway ? aws_nat_gateway.main[0].id : null
}

output "public_route_table_id" {
  description = "ID de la table de routage publique"
  value       = aws_route_table.public.id
}

output "private_route_table_id" {
  description = "ID de la table de routage privée"
  value       = aws_route_table.private.id
}

output "availability_zones" {
  description = "Zones de disponibilité utilisées"
  value       = var.availability_zones
}
