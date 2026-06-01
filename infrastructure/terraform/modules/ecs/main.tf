terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = var.cluster_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = var.cluster_name
  }
}

# ECS Cluster Capacity Providers
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.cluster_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.cluster_name}-logs"
  }
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.cluster_name}-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })

  tags = {
    Name = "${var.cluster_name}-task-execution-role"
  }
}

# Attach ECS Task Execution Role Policy
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role for ECS Task
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.cluster_name}-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })

  tags = {
    Name = "${var.cluster_name}-task-role"
  }
}

# Auth Service Task Definition
resource "aws_ecs_task_definition" "auth" {
  family                   = var.auth_service_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.auth_cpu
  memory                   = var.auth_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = var.auth_service_name
    image     = var.auth_image_uri
    essential = true
    portMappings = [{
      containerPort = var.auth_container_port
      hostPort      = var.auth_container_port
      protocol      = "tcp"
    }]
    
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "PORT", value = tostring(var.auth_container_port) },
      { name = "DB_HOST", value = var.auth_db_host },
      { name = "DB_PORT", value = tostring(var.auth_db_port) },
      { name = "DB_USERNAME", value = var.auth_db_user },
      { name = "DB_DATABASE", value = var.auth_db_name },
      { name = "JWT_SECRET", value = "your_jwt_secret_key_change_in_production" },
      { name = "JWT_EXPIRATION", value = "7d" }
    ]

    secrets = [{
      name      = "DB_PASSWORD"
      valueFrom = aws_secretsmanager_secret.db_auth.arn
    }]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
        "awslogs-region"        = data.aws_caller_identity.current.account_id
        "awslogs-stream-prefix" = "auth-service"
      }
    }
  }])

  tags = {
    Name = var.auth_service_name
  }
}

# Enrollment Service Task Definition
resource "aws_ecs_task_definition" "enrollment" {
  family                   = var.enrollment_service_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.enrollment_cpu
  memory                   = var.enrollment_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = var.enrollment_service_name
    image     = var.enrollment_image_uri
    essential = true
    portMappings = [{
      containerPort = var.enrollment_container_port
      hostPort      = var.enrollment_container_port
      protocol      = "tcp"
    }]
    
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "PORT", value = tostring(var.enrollment_container_port) },
      { name = "DB_HOST", value = var.enrollment_db_host },
      { name = "DB_PORT", value = tostring(var.enrollment_db_port) },
      { name = "DB_USERNAME", value = var.enrollment_db_user },
      { name = "DB_DATABASE", value = var.enrollment_db_name },
      { name = "REDIS_HOST", value = var.redis_host },
      { name = "REDIS_PORT", value = tostring(var.redis_port) },
      { name = "JWT_SECRET", value = "your_jwt_secret_key_change_in_production" }
    ]

    secrets = [{
      name      = "DB_PASSWORD"
      valueFrom = aws_secretsmanager_secret.db_enrollment.arn
    }]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
        "awslogs-region"        = data.aws_caller_identity.current.account_id
        "awslogs-stream-prefix" = "enrollment-service"
      }
    }
  }])

  tags = {
    Name = var.enrollment_service_name
  }
}

# Subject Service Task Definition
resource "aws_ecs_task_definition" "subject" {
  family                   = var.subject_service_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.subject_cpu
  memory                   = var.subject_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = var.subject_service_name
    image     = var.subject_image_uri
    essential = true
    portMappings = [{
      containerPort = var.subject_container_port
      hostPort      = var.subject_container_port
      protocol      = "tcp"
    }]
    
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "PORT", value = tostring(var.subject_container_port) },
      { name = "DB_HOST", value = var.subject_db_host },
      { name = "DB_PORT", value = tostring(var.subject_db_port) },
      { name = "DB_USERNAME", value = var.subject_db_user },
      { name = "DB_DATABASE", value = var.subject_db_name },
      { name = "REDIS_HOST", value = var.redis_host },
      { name = "REDIS_PORT", value = tostring(var.redis_port) },
      { name = "JWT_SECRET", value = "your_jwt_secret_key_change_in_production" }
    ]

    secrets = [{
      name      = "DB_PASSWORD"
      valueFrom = aws_secretsmanager_secret.db_subject.arn
    }]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
        "awslogs-region"        = data.aws_caller_identity.current.account_id
        "awslogs-stream-prefix" = "subject-service"
      }
    }
  }])

  tags = {
    Name = var.subject_service_name
  }
}

# Auth Service
resource "aws_ecs_service" "auth" {
  name            = var.auth_service_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.auth.arn
  desired_count   = var.auth_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnets
    security_groups  = [var.security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.alb_target_group_arn
    container_name   = var.auth_service_name
    container_port   = var.auth_container_port
  }

  depends_on = [aws_ecs_task_definition.auth]

  tags = {
    Name = var.auth_service_name
  }
}

# Enrollment Service
resource "aws_ecs_service" "enrollment" {
  name            = var.enrollment_service_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.enrollment.arn
  desired_count   = var.enrollment_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnets
    security_groups  = [var.security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.alb_target_group_arn
    container_name   = var.enrollment_service_name
    container_port   = var.enrollment_container_port
  }

  depends_on = [aws_ecs_task_definition.enrollment]

  tags = {
    Name = var.enrollment_service_name
  }
}

# Subject Service
resource "aws_ecs_service" "subject" {
  name            = var.subject_service_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.subject.arn
  desired_count   = var.subject_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnets
    security_groups  = [var.security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.alb_target_group_arn
    container_name   = var.subject_service_name
    container_port   = var.subject_container_port
  }

  depends_on = [aws_ecs_task_definition.subject]

  tags = {
    Name = var.subject_service_name
  }
}

# Secrets for database passwords
resource "aws_secretsmanager_secret" "db_auth" {
  name = "${var.cluster_name}/db-auth-password"

  tags = {
    Name = "${var.cluster_name}/db-auth-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_auth" {
  secret_id     = aws_secretsmanager_secret.db_auth.id
  secret_string = var.auth_db_password
}

resource "aws_secretsmanager_secret" "db_enrollment" {
  name = "${var.cluster_name}/db-enrollment-password"

  tags = {
    Name = "${var.cluster_name}/db-enrollment-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_enrollment" {
  secret_id     = aws_secretsmanager_secret.db_enrollment.id
  secret_string = var.enrollment_db_password
}

resource "aws_secretsmanager_secret" "db_subject" {
  name = "${var.cluster_name}/db-subject-password"

  tags = {
    Name = "${var.cluster_name}/db-subject-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_subject" {
  secret_id     = aws_secretsmanager_secret.db_subject.id
  secret_string = var.subject_db_password
}

# Data source to get current AWS account
data "aws_caller_identity" "current" {}
