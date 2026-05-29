module "vpc" {
  source = "../modules/vpc"

  vpc_cidr              = var.vpc_cidr
  private_subnet_cidrs  = var.private_subnet_cidrs
  public_subnet_cidrs   = var.public_subnet_cidrs
  environment           = var.environment
  project_name          = var.project_name
}

module "rds_auth" {
  source = "../modules/rds"

  identifier           = "${var.project_name}-auth-db"
  database_name        = "auth_db"
  master_username      = var.db_username
  master_password      = var.db_password
  allocated_storage    = var.db_allocated_storage
  instance_class       = var.db_instance_class
  db_subnet_group_name = module.vpc.db_subnet_group_name
  security_group_id    = module.vpc.db_security_group_id
  environment          = var.environment
  project_name         = var.project_name

  depends_on = [module.vpc]
}

module "rds_enrollment" {
  source = "../modules/rds"

  identifier           = "${var.project_name}-enrollment-db"
  database_name        = "enrollment_db"
  master_username      = var.db_username
  master_password      = var.db_password
  allocated_storage    = var.db_allocated_storage
  instance_class       = var.db_instance_class
  db_subnet_group_name = module.vpc.db_subnet_group_name
  security_group_id    = module.vpc.db_security_group_id
  environment          = var.environment
  project_name         = var.project_name

  depends_on = [module.vpc]
}

module "rds_subject" {
  source = "../modules/rds"

  identifier           = "${var.project_name}-subject-db"
  database_name        = "subject_db"
  master_username      = var.db_username
  master_password      = var.db_password
  allocated_storage    = var.db_allocated_storage
  instance_class       = var.db_instance_class
  db_subnet_group_name = module.vpc.db_subnet_group_name
  security_group_id    = module.vpc.db_security_group_id
  environment          = var.environment
  project_name         = var.project_name

  depends_on = [module.vpc]
}

module "elasticache" {
  source = "../modules/elasticache"

  cluster_id           = "${var.project_name}-redis"
  node_type            = var.elasticache_node_type
  num_cache_nodes      = 1
  engine_version       = "7.0"
  parameter_group_name = "default.redis7"
  security_group_id    = module.vpc.cache_security_group_id
  subnet_group_name    = module.vpc.elasticache_subnet_group_name
  environment          = var.environment
  project_name         = var.project_name

  depends_on = [module.vpc]
}

module "alb" {
  source = "../modules/alb"

  name               = "${var.project_name}-alb"
  subnets            = module.vpc.public_subnets
  security_group_id  = module.vpc.alb_security_group_id
  environment        = var.environment
  project_name       = var.project_name
  enable_http2       = true
  enable_deletion_protection = false
}

module "ecs" {
  source = "../modules/ecs"

  cluster_name        = "${var.project_name}-cluster"
  environment         = var.environment
  project_name        = var.project_name
  
  # Auth Service
  auth_service_name   = "auth-service"
  auth_image_uri      = "384078707866.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest"
  auth_container_port = var.container_port_auth
  auth_cpu            = var.ecs_task_cpu
  auth_memory         = var.ecs_task_memory
  auth_desired_count  = var.ecs_desired_count

  # Enrollment Service
  enrollment_service_name   = "enrollment-service"
  enrollment_image_uri      = "384078707866.dkr.ecr.us-east-1.amazonaws.com/enrollment-service:latest"
  enrollment_container_port = var.container_port_enrollment
  enrollment_cpu            = var.ecs_task_cpu
  enrollment_memory         = var.ecs_task_memory
  enrollment_desired_count  = var.ecs_desired_count

  # Subject Service
  subject_service_name   = "subject-service"
  subject_image_uri      = "384078707866.dkr.ecr.us-east-1.amazonaws.com/subject-service:latest"
  subject_container_port = var.container_port_subject
  subject_cpu            = var.ecs_task_cpu
  subject_memory         = var.ecs_task_memory
  subject_desired_count  = var.ecs_desired_count

  # Network
  subnets             = module.vpc.private_subnets
  security_group_id   = module.vpc.ecs_security_group_id
  alb_target_group_arn = module.alb.target_group_arn

  # Database and Cache
  auth_db_host        = module.rds_auth.db_host
  auth_db_port        = module.rds_auth.db_port
  auth_db_name        = "auth_db"
  auth_db_user        = var.db_username
  auth_db_password    = var.db_password

  enrollment_db_host  = module.rds_enrollment.db_host
  enrollment_db_port  = module.rds_enrollment.db_port
  enrollment_db_name  = "enrollment_db"
  enrollment_db_user  = var.db_username
  enrollment_db_password = var.db_password

  subject_db_host     = module.rds_subject.db_host
  subject_db_port     = module.rds_subject.db_port
  subject_db_name     = "subject_db"
  subject_db_user     = var.db_username
  subject_db_password = var.db_password

  redis_host          = module.elasticache.endpoint
  redis_port          = 6379

  depends_on = [module.alb, module.rds_auth, module.rds_enrollment, module.rds_subject, module.elasticache]
}
