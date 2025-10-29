# Module Database - Amazon DocumentDB (MongoDB compatible)

# Subnet group pour la base de données
resource "aws_docdb_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-docdb-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-docdb-subnet-group"
    }
  )
}

# Cluster parameter group
resource "aws_docdb_cluster_parameter_group" "main" {
  family      = "docdb5.0"
  name        = "${var.project_name}-${var.environment}-docdb-params"
  description = "DocumentDB cluster parameter group"

  parameter {
    name  = "tls"
    value = var.enable_tls ? "enabled" : "disabled"
  }

  parameter {
    name  = "audit_logs"
    value = var.enable_audit_logs ? "enabled" : "disabled"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-docdb-params"
    }
  )
}

# Générer un mot de passe aléatoire sécurisé
resource "random_password" "db_password" {
  length  = 32
  special = true
  # Exclure les caractères qui peuvent causer des problèmes
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Stocker le mot de passe dans AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.project_name}-${var.environment}-db-password"
  description             = "Mot de passe de la base de données DocumentDB"
  recovery_window_in_days = var.environment == "prod" ? 30 : 0

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-db-password"
    }
  )
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db_password.result
}

# DocumentDB Cluster
resource "aws_docdb_cluster" "main" {
  cluster_identifier              = "${var.project_name}-${var.environment}-docdb"
  engine                          = "docdb"
  engine_version                  = "5.0.0"
  master_username                 = var.db_username
  master_password                 = random_password.db_password.result
  port                            = var.db_port
  db_subnet_group_name            = aws_docdb_subnet_group.main.name
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.main.name
  vpc_security_group_ids          = [var.security_group_id]

  # Backups
  backup_retention_period = var.backup_retention_days
  preferred_backup_window = "03:00-04:00" # 3h-4h du matin (UTC)

  # Maintenance
  preferred_maintenance_window = "sun:04:00-sun:05:00"

  # Haute disponibilité
  availability_zones = var.availability_zones

  # Snapshots
  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${var.project_name}-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  # Encryption
  storage_encrypted = true
  kms_key_id        = var.kms_key_id

  # Logs CloudWatch
  enabled_cloudwatch_logs_exports = var.enable_audit_logs ? ["audit", "profiler"] : []

  # Protection
  deletion_protection = var.environment == "prod"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-docdb-cluster"
    }
  )
}

# DocumentDB Instances
resource "aws_docdb_cluster_instance" "main" {
  count              = var.instance_count
  identifier         = "${var.project_name}-${var.environment}-docdb-instance-${count.index + 1}"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = var.instance_class

  # Performance Insights (non disponible pour tous les types d'instances)
  # performance_insights_enabled = var.enable_performance_insights

  # Monitoring
  auto_minor_version_upgrade = true
  preferred_maintenance_window = "sun:04:00-sun:05:00"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-docdb-instance-${count.index + 1}"
    }
  )
}

# CloudWatch Alarms pour monitoring
resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  alarm_name          = "${var.project_name}-${var.environment}-docdb-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/DocDB"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Cette alarme se déclenche si le CPU dépasse 80%"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBClusterIdentifier = aws_docdb_cluster.main.id
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "database_connections" {
  alarm_name          = "${var.project_name}-${var.environment}-docdb-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/DocDB"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Cette alarme se déclenche si les connexions dépassent 80"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBClusterIdentifier = aws_docdb_cluster.main.id
  }

  tags = var.tags
}
