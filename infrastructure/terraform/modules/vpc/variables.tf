variable "vpc_cidr" {
  type = string
}

variable "private_subnet_cidrs" {
  type = list(string)
}

variable "public_subnet_cidrs" {
  type = list(string)
}

variable "environment" {
  type = string
}

variable "project_name" {
  type = string
}
