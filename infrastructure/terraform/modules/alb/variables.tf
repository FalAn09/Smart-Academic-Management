variable "name" {
  type = string
}

variable "subnets" {
  type = list(string)
}

variable "security_group_id" {
  type = string
}

variable "environment" {
  type = string
}

variable "project_name" {
  type = string
}

variable "enable_http2" {
  type    = bool
  default = true
}

variable "enable_deletion_protection" {
  type    = bool
  default = false
}
