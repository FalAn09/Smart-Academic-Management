resource "aws_launch_template" "smart_campus_lt" {
  name_prefix            = "smart-campus-node-lt-"
  image_id               = data.aws_ami.amazon_linux.id
  instance_type          = "t2.micro"
  key_name               = "vockey"
  vpc_security_group_ids = [aws_security_group.instances_sg.id]

  user_data = base64encode(<<-EOF
#!/bin/bash
# 1. CREAR MEMORIA SWAP (VITAL PARA T2.MICRO CON MULTIPLES MICROSERVICIOS)
dd if=/dev/zero of=/swapfile bs=128M count=16
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo "/swapfile swap swap defaults 0 0" >> /etc/fstab

# 2. ACTUALIZAR E INSTALAR DOCKER
dnf update -y
dnf install -y docker git
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 3. CONFIGURAR APLICACIÓN
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

curl -O https://raw.githubusercontent.com/FalAn09/Smart-Academic-Management/qa/docker-compose.yml

cat > .env << EOL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
JWT_SECRET=secret
REFRESH_TOKEN_SECRET=secret
EOL

chown -R ec2-user:ec2-user /home/ec2-user/app

# 4. DESCARGAR Y LEVANTAR TODA LA ARQUITECTURA
# Al no especificar servicios al final, docker-compose levanta todo el archivo
docker-compose pull
docker-compose up -d
EOF
  )
}

# --- AUTO SCALING GROUP ÚNICO ---
resource "aws_autoscaling_group" "smart_campus_asg" {
  name                = "smart-campus-asg"
  desired_capacity    = 1
  max_size            = 1  # Limitado a 1 para mantener todo en el mismo nodo
  min_size            = 1
  vpc_zone_identifier = data.aws_subnets.default.ids
  target_group_arns   = [aws_lb_target_group.gateway_tg.arn]

  launch_template {
    id      = aws_launch_template.smart_campus_lt.id
    version = "$Latest"
  }
}