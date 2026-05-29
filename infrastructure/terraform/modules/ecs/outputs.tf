output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "cluster_arn" {
  value = aws_ecs_cluster.main.arn
}

output "auth_service_name" {
  value = aws_ecs_service.auth.name
}

output "enrollment_service_name" {
  value = aws_ecs_service.enrollment.name
}

output "subject_service_name" {
  value = aws_ecs_service.subject.name
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.ecs.name
}
