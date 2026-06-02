output "load_balancer_url" {
  description = "URL principal del Application Load Balancer. Usa esta URL base para acceder a todas tus APIs."
  value       = "http://${aws_lb.main_alb.dns_name}"
}