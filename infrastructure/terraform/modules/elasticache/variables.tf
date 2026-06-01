variable "cluster_id" {
  type = string
}

variable "node_type" {
  type = string
}

variable "num_cache_nodes" {
  type    = number
  default = 1
}

variable "engine_version" {
  type = string
}

variable "parameter_group_name" {
  type = string
}

variable "security_group_id" {
  type = string
}

variable "subnet_group_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "project_name" {
  type = string
}
