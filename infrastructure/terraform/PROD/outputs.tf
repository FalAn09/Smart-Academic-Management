# ======================
# NETWORKING
# ======================

output "vpc_id" {
  description = "ID de la VPC utilizada"
  value       = data.aws_vpc.default.id
}

output "subnet_ids" {
  description = "Subredes utilizadas por la infraestructura"
  value       = data.aws_subnets.default.ids
}

# ======================
# SECURITY GROUPS
# ======================

output "alb_security_group_id" {
  description = "Security Group del ALB"
  value       = aws_security_group.alb_sg.id
}

output "instances_security_group_id" {
  description = "Security Group de las instancias"
  value       = aws_security_group.instances_sg.id
}

# ======================
# LOAD BALANCER
# ======================

output "load_balancer_url" {
  description = "URL principal del ALB"
  value       = "http://${aws_lb.main_alb.dns_name}"
}

output "load_balancer_dns" {
  description = "DNS del ALB"
  value       = aws_lb.main_alb.dns_name
}

output "load_balancer_arn" {
  description = "ARN del ALB"
  value       = aws_lb.main_alb.arn
}

# ======================
# TARGET GROUPS
# ======================

output "auth_target_group_arn" {
  description = "ARN del Target Group de Auth"
  value       = aws_lb_target_group.auth_tg.arn
}

output "enrollment_target_group_arn" {
  description = "ARN del Target Group de Enrollment"
  value       = aws_lb_target_group.enrollment_tg.arn
}

output "subject_target_group_arn" {
  description = "ARN del Target Group de Subject"
  value       = aws_lb_target_group.subject_tg.arn
}

# ======================
# LAUNCH TEMPLATES
# ======================

output "auth_launch_template_id" {
  description = "Launch Template Auth"
  value       = aws_launch_template.auth_lt.id
}

output "enrollment_launch_template_id" {
  description = "Launch Template Enrollment"
  value       = aws_launch_template.enrollment_lt.id
}

output "subject_launch_template_id" {
  description = "Launch Template Subject"
  value       = aws_launch_template.subject_lt.id
}

# ======================
# AUTO SCALING GROUPS
# ======================

output "auth_asg_name" {
  description = "Auto Scaling Group Auth"
  value       = aws_autoscaling_group.auth_asg.name
}

output "enrollment_asg_name" {
  description = "Auto Scaling Group Enrollment"
  value       = aws_autoscaling_group.enrollment_asg.name
}

output "subject_asg_name" {
  description = "Auto Scaling Group Subject"
  value       = aws_autoscaling_group.subject_asg.name
}