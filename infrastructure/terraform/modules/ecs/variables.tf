variable "cluster_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "project_name" {
  type = string
}

# Auth Service
variable "auth_service_name" {
  type = string
}

variable "auth_image_uri" {
  type = string
}

variable "auth_container_port" {
  type = number
}

variable "auth_cpu" {
  type = string
}

variable "auth_memory" {
  type = string
}

variable "auth_desired_count" {
  type = number
}

# Enrollment Service
variable "enrollment_service_name" {
  type = string
}

variable "enrollment_image_uri" {
  type = string
}

variable "enrollment_container_port" {
  type = number
}

variable "enrollment_cpu" {
  type = string
}

variable "enrollment_memory" {
  type = string
}

variable "enrollment_desired_count" {
  type = number
}

# Subject Service
variable "subject_service_name" {
  type = string
}

variable "subject_image_uri" {
  type = string
}

variable "subject_container_port" {
  type = number
}

variable "subject_cpu" {
  type = string
}

variable "subject_memory" {
  type = string
}

variable "subject_desired_count" {
  type = number
}

# Network
variable "subnets" {
  type = list(string)
}

variable "security_group_id" {
  type = string
}

variable "alb_target_group_arn" {
  type = string
}

# Database
variable "auth_db_host" {
  type = string
}

variable "auth_db_port" {
  type = number
}

variable "auth_db_name" {
  type = string
}

variable "auth_db_user" {
  type      = string
  sensitive = true
}

variable "auth_db_password" {
  type      = string
  sensitive = true
}

variable "enrollment_db_host" {
  type = string
}

variable "enrollment_db_port" {
  type = number
}

variable "enrollment_db_name" {
  type = string
}

variable "enrollment_db_user" {
  type      = string
  sensitive = true
}

variable "enrollment_db_password" {
  type      = string
  sensitive = true
}

variable "subject_db_host" {
  type = string
}

variable "subject_db_port" {
  type = number
}

variable "subject_db_name" {
  type = string
}

variable "subject_db_user" {
  type      = string
  sensitive = true
}

variable "subject_db_password" {
  type      = string
  sensitive = true
}

# Cache
variable "redis_host" {
  type = string
}

variable "redis_port" {
  type = number
}
