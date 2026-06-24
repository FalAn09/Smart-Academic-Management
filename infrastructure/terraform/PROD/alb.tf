# Application Load Balancer
resource "aws_lb" "main_alb" {
  name               = "smart-campus-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids
}

# Target Group Unificado (Apunta al API Gateway)
resource "aws_lb_target_group" "gateway_tg" {
  name     = "gateway-target-group"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  
  health_check {
    path                = "/api/v1/health" # O cualquier ruta válida en tu Gateway
    matcher             = "200-499"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# Listener principal en el puerto 80
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main_alb.arn
  port              = "80"
  protocol          = "HTTP"

  # Enviar TODO el tráfico directamente al Gateway
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gateway_tg.arn
  }
}