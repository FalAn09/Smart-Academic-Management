output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "auth_db_endpoint" {
  description = "Auth database endpoint"
  value       = module.rds_auth.db_endpoint
  sensitive   = true
}

output "enrollment_db_endpoint" {
  description = "Enrollment database endpoint"
  value       = module.rds_enrollment.db_endpoint
  sensitive   = true
}

output "subject_db_endpoint" {
  description = "Subject database endpoint"
  value       = module.rds_subject.db_endpoint
  sensitive   = true
}

output "elasticache_endpoint" {
  description = "ElastiCache endpoint"
  value       = module.elasticache.endpoint
  sensitive   = true
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.alb.dns_name
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "auth_service_url" {
  description = "Auth service URL"
  value       = "http://${module.alb.dns_name}/auth"
}

output "enrollment_service_url" {
  description = "Enrollment service URL"
  value       = "http://${module.alb.dns_name}/enrollment"
}

output "subject_service_url" {
  description = "Subject service URL"
  value       = "http://${module.alb.dns_name}/subject"
}
