terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = var.cluster_id
  engine               = "redis"
  node_type            = var.node_type
  num_cache_nodes      = var.num_cache_nodes
  parameter_group_name = var.parameter_group_name
  engine_version       = var.engine_version
  port                 = 6379
  
  subnet_group_name          = var.subnet_group_name
  security_group_ids         = [var.security_group_id]
  
  automatic_failover_enabled = true
  multi_az_enabled           = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token_enabled         = false # Set to true in production with a strong token
  
  snapshot_retention_limit = 5
  snapshot_window          = "03:00-05:00"
  maintenance_window       = "mon:05:00-mon:07:00"
  
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.main.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    enabled          = true
  }

  tags = {
    Name = var.cluster_id
  }
}

resource "aws_cloudwatch_log_group" "main" {
  name              = "/aws/elasticache/${var.cluster_id}"
  retention_in_days = 7

  tags = {
    Name = "${var.cluster_id}-logs"
  }
}
