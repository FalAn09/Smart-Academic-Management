# ======================
# NETWORKING & SECURITY
# ======================
output "vpc_id" {
  description = "ID de la VPC utilizada"
  value       = data.aws_vpc.default.id
}

output "subnet_ids" {
  description = "Subredes utilizadas por la infraestructura"
  value       = data.aws_subnets.default.ids
}

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

output "gateway_target_group_arn" {
  description = "ARN del Target Group Unificado (Gateway)"
  value       = aws_lb_target_group.gateway_tg.arn
}

# ======================
# INSTANCE COMPUTE
# ======================
output "smart_campus_launch_template_id" {
  description = "Launch Template Principal"
  value       = aws_launch_template.smart_campus_lt.id
}

output "smart_campus_asg_name" {
  description = "Auto Scaling Group Principal"
  value       = aws_autoscaling_group.smart_campus_asg.name
}