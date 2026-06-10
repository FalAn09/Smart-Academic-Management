terraform {
  backend "s3" {
    bucket         = "smart-campus-uce-tfstate-dapaeza"  # El nombre del bucket que creaste en el Paso 1
    key            = "qa/terraform.tfstate"         # La ruta dentro del bucket donde se guardará el archivo
    region         = "us-east-1"                      # La región de tu Learner Lab
    encrypt        = true                             # Encriptar el estado en reposo
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_security_group" "alb_sg" {
  name        = "smart_campus_alb_sg"
  description = "Permitir trafico HTTP al ALB"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "instances_sg" {
  name        = "smart_campus_instances_sg"
  description = "Permitir trafico interno desde el ALB y entre instancias"
  vpc_id      = data.aws_vpc.default.id

  # Permitir trafico desde el ALB
  ingress {
    from_port       = 3000
    to_port         = 3002
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  # NUEVO: Permitir que las instancias EC2 hablen entre ellas (Vital para Enrollment -> Auth/Subject)
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true 
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}