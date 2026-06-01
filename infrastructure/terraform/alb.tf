# Application Load Balancer
resource "aws_lb" "main_alb" {
  name               = "smart-campus-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids
}

# Listener principal en el puerto 80
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Servicio no encontrado"
      status_code  = "404"
    }
  }
}

# --- TARGET GROUPS ---
resource "aws_lb_target_group" "auth_tg" {
  name     = "auth-target-group"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path                = "/api/v1/auth/profile"
    matcher             = "200-499" # Acepta 401/403 como saludables (app encendida)
  }
}

resource "aws_lb_target_group" "enrollment_tg" {
  name     = "enrollment-target-group"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path                = "/api/v1/enrollments"
    matcher             = "200-499"
  }
}

resource "aws_lb_target_group" "subject_tg" {
  name     = "subject-target-group"
  port     = 3002
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path                = "/api/v1/subjects"
    matcher             = "200-499"
  }
}

# --- REGLAS DEL LISTENER (Enrutamiento) ---
resource "aws_lb_listener_rule" "auth_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.auth_tg.arn
  }
  condition {
    path_pattern {
      values = ["/api/v1/auth/*"]
    }
  }
}

resource "aws_lb_listener_rule" "enrollment_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.enrollment_tg.arn
  }
  condition {
    path_pattern {
      values = ["/api/v1/enrollments*"]
    }
  }
}

resource "aws_lb_listener_rule" "subject_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 30
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.subject_tg.arn
  }
  condition {
    path_pattern {
      values = ["/api/v1/subjects*"]
    }
  }
}