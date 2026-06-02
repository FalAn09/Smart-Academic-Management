# --- LAUNCH TEMPLATES ---
resource "aws_launch_template" "auth_lt" {
  name_prefix            = "auth-lt-"
  image_id               = data.aws_ami.amazon_linux.id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.instances_sg.id]

  user_data = base64encode(<<-EOF
#!/bin/bash

dnf update -y
dnf install -y docker git

systemctl enable docker
systemctl start docker

# Permitir a ec2-user usar Docker sin sudo
usermod -aG docker ec2-user

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
-o /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose

# Clonar repositorio
git clone -b main https://github.com/FalAn09/Smart-Academic-Management.git /home/ec2-user/app

# Dar permisos al usuario
chown -R ec2-user:ec2-user /home/ec2-user/app

cd /home/ec2-user/app

cat > .env << EOL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
JWT_SECRET=secret
REFRESH_TOKEN_SECRET=secret
uP3rS3cr3tK3y=secret
uP3rR3fr3shS3cr3t=secret
EOL

docker-compose up -d auth-service postgres-auth
EOF
  )
}

resource "aws_launch_template" "enrollment_lt" {
  name_prefix            = "enrollment-lt-"
  image_id               = data.aws_ami.amazon_linux.id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.instances_sg.id]

  user_data = base64encode(<<-EOF
#!/bin/bash

dnf update -y
dnf install -y docker git

systemctl enable docker
systemctl start docker

usermod -aG docker ec2-user

curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
-o /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose

git clone -b main https://github.com/FalAn09/Smart-Academic-Management.git /home/ec2-user/app

chown -R ec2-user:ec2-user /home/ec2-user/app

cd /home/ec2-user/app

cat > .env << EOL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
JWT_SECRET=secret
uP3rS3cr3tK3y=secret
uP3rR3fr3shS3cr3t=secret
EOL

docker-compose up -d enrollment-service postgres-enrollment redis
EOF
  )
}

resource "aws_launch_template" "subject_lt" {
  name_prefix            = "subject-lt-"
  image_id               = data.aws_ami.amazon_linux.id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.instances_sg.id]

  user_data = base64encode(<<-EOF
#!/bin/bash

dnf update -y
dnf install -y docker git

systemctl enable docker
systemctl start docker

usermod -aG docker ec2-user

curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
-o /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose

git clone -b main https://github.com/FalAn09/Smart-Academic-Management.git /home/ec2-user/app

chown -R ec2-user:ec2-user /home/ec2-user/app

cd /home/ec2-user/app

cat > .env << EOL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
JWT_SECRET=secret
uP3rS3cr3tK3y=secret
uP3rR3fr3shS3cr3t=secret
EOL

docker-compose up -d subject-service postgres-subject redis
EOF
  )
}

# --- AUTO SCALING GROUPS ---
resource "aws_autoscaling_group" "auth_asg" {
  name                = "auth-asg"
  desired_capacity    = 1
  max_size            = 2
  min_size            = 1
  vpc_zone_identifier = data.aws_subnets.default.ids
  target_group_arns   = [aws_lb_target_group.auth_tg.arn]

  launch_template {
    id      = aws_launch_template.auth_lt.id
    version = "$Latest"
  }
}

resource "aws_autoscaling_group" "enrollment_asg" {
  name                = "enrollment-asg"
  desired_capacity    = 1
  max_size            = 2
  min_size            = 1
  vpc_zone_identifier = data.aws_subnets.default.ids
  target_group_arns   = [aws_lb_target_group.enrollment_tg.arn]

  launch_template {
    id      = aws_launch_template.enrollment_lt.id
    version = "$Latest"
  }
}

resource "aws_autoscaling_group" "subject_asg" {
  name                = "subject-asg"
  desired_capacity    = 1
  max_size            = 2
  min_size            = 1
  vpc_zone_identifier = data.aws_subnets.default.ids
  target_group_arns   = [aws_lb_target_group.subject_tg.arn]

  launch_template {
    id      = aws_launch_template.subject_lt.id
    version = "$Latest"
  }
}
