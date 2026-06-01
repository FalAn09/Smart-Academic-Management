# Smart Academic Management - README

## 📋 Descripción del Proyecto

Smart Academic Management es el **Módulo Académico (Módulo 1)** de la plataforma integrada **Smart Campus UCE**. Este proyecto implementa una arquitectura de microservicios desacoplados desarrollados en NestJS, empaquetados con Docker y desplegados en AWS mediante Terraform.

## 🏗️ Arquitectura

### Microservicios Core

1. **Auth Service** (Puerto 3000)
   - Gestión de autenticación y autorización
   - JWT basado en tokens
   - Roles: ADMIN, PROFESSOR, STUDENT, DEAN

2. **Enrollment Service** (Puerto 3001)
   - Gestión de matrículas/inscripciones
   - Validación de cupos con ElastiCache (Redis)
   - Operaciones atómicas para evitar condiciones de carrera
   - Base de datos PostgreSQL dedicada

3. **Subject Service** (Puerto 3002)
   - Administración del catálogo de asignaturas
   - Gestión de oferta de materias
   - Relación con programas académicos
   - Base de datos PostgreSQL dedicada

### Componentes de Infraestructura

- **Load Balancer (ALB)**: Distribuye el tráfico entre servicios
- **RDS PostgreSQL**: 3 instancias independientes para cada servicio
- **ElastiCache Redis**: Cache en memoria para validación de cupos
- **ECS Fargate**: Orquestación de contenedores
- **VPC**: Red aislada con subnets públicas y privadas
- **CloudWatch**: Monitoreo y logs

## 📁 Estructura del Proyecto

```
Smart Academic Management/
├── backend/
│   ├── auth-service/          # Microservicio de autenticación
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── entities/
│   │   │   │   ├── dto/
│   │   │   │   ├── strategies/
│   │   │   │   └── guards/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── enrollment-service/    # Microservicio de matrículas
│   │   ├── src/
│   │   │   ├── enrollment/
│   │   │   │   ├── enrollment.controller.ts
│   │   │   │   ├── enrollment.service.ts
│   │   │   │   ├── enrollment.module.ts
│   │   │   │   ├── entities/
│   │   │   │   └── dto/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── subject-service/       # Microservicio de asignaturas
│       ├── src/
│       │   ├── subject/
│       │   │   ├── subject.controller.ts
│       │   │   ├── subject.service.ts
│       │   │   ├── subject.module.ts
│       │   │   ├── entities/
│       │   │   └── dto/
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
├── infrastructure/
│   ├── docker/               # Configuraciones Docker adicionales
│   └── terraform/
│       ├── modules/
│       │   ├── vpc/         # Módulo VPC
│       │   ├── rds/         # Módulo RDS
│       │   ├── elasticache/ # Módulo ElastiCache
│       │   ├── alb/         # Módulo Application Load Balancer
│       │   └── ecs/         # Módulo ECS
│       └── qa/              # Configuración QA
│           ├── main.tf
│           ├── provider.tf
│           ├── variables.tf
│           ├── outputs.tf
│           └── terraform.tfvars
├── docker-compose.yml        # Compose para desarrollo local
└── README.md
```

## 🚀 Inicio Rápido

### Desarrollo Local

#### Requisitos
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (opcional si usas Docker)
- Redis (opcional si usas Docker)

#### Pasos

1. **Clonar el repositorio**
```bash
cd "Smart Academic Management"
```

2. **Instalar dependencias**
```bash
# Auth Service
cd backend/auth-service
npm install
cd ../..

# Enrollment Service
cd backend/enrollment-service
npm install
cd ../..

# Subject Service
cd backend/subject-service
npm install
cd ../..
```

3. **Crear archivos .env**
```bash
cd backend/auth-service
cp .env.example .env

cd ../enrollment-service
cp .env.example .env

cd ../subject-service
cp .env.example .env
cd ../../
```

4. **Ejecutar con Docker Compose**
```bash
docker-compose up -d
```

Esto iniciará:
- 3 instancias PostgreSQL (puertos 5432, 5433, 5434)
- 1 instancia Redis (puerto 6379)
- Auth Service (puerto 3000)
- Enrollment Service (puerto 3001)
- Subject Service (puerto 3002)

5. **Verificar servicios**
```bash
# Health check
curl http://localhost:3000/api/v1/auth/profile
curl http://localhost:3001/api/v1/enrollments
curl http://localhost:3002/api/v1/subjects
```

### Despliegue en AWS (QA)

#### Requisitos
- AWS CLI configurado
- Terraform >= 1.0
- Credenciales de AWS con permisos suficientes
- S3 bucket para Terraform state (crear manualmente)
- DynamoDB table para locks (crear manualmente)

#### Pasos

1. **Crear S3 bucket para estado**
```bash
aws s3api create-bucket \
  --bucket smart-campus-terraform-state \
  --region us-east-1 \
  --profile your-profile
```

2. **Crear DynamoDB table para locks**
```bash
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1 \
  --profile your-profile
```

3. **Construir y enviar imágenes Docker a ECR**
```bash
# Crear repositorios ECR
aws ecr create-repository --repository-name auth-service --region us-east-1
aws ecr create-repository --repository-name enrollment-service --region us-east-1
aws ecr create-repository --repository-name subject-service --region us-east-1

# Login en ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 384078707866.dkr.ecr.us-east-1.amazonaws.com

# Build y push de Auth Service
cd backend/auth-service
docker build -t 384078707866.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest .
docker push 384078707866.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
cd ../..

# Build y push de Enrollment Service
cd backend/enrollment-service
docker build -t 384078707866.dkr.ecr.us-east-1.amazonaws.com/enrollment-service:latest .
docker push 384078707866.dkr.ecr.us-east-1.amazonaws.com/enrollment-service:latest
cd ../..

# Build y push de Subject Service
cd backend/subject-service
docker build -t 384078707866.dkr.ecr.us-east-1.amazonaws.com/subject-service:latest .
docker push 384078707866.dkr.ecr.us-east-1.amazonaws.com/subject-service:latest
cd ../..
```

4. **Inicializar Terraform**
```bash
cd infrastructure/terraform/qa
terraform init
```

5. **Validar configuración**
```bash
terraform validate
terraform plan
```

6. **Aplicar configuración**
```bash
terraform apply

# Se solicitarán confirmaciones. Escribe 'yes' para confirmar
```

7. **Obtener outputs**
```bash
terraform output

# Esto mostrará:
# - ALB DNS name
# - URLs de servicios
# - Endpoints de bases de datos
# - Endpoints de caché
```

## 📊 Endpoints de API

### Auth Service
```
POST   /api/v1/auth/register        # Registrar nuevo usuario
POST   /api/v1/auth/login           # Iniciar sesión
GET    /api/v1/auth/profile         # Obtener perfil (requiere JWT)
POST   /api/v1/auth/logout          # Cerrar sesión
POST   /api/v1/auth/validate-token  # Validar token
POST   /api/v1/auth/refresh-token   # Renovar token
```

### Enrollment Service
```
POST   /api/v1/enrollments                    # Crear matrícula
GET    /api/v1/enrollments                    # Listar matrículas
GET    /api/v1/enrollments/:id                # Obtener matrícula
GET    /api/v1/enrollments/student/:studentId # Matrículas de estudiante
PUT    /api/v1/enrollments/:id                # Actualizar matrícula
DELETE /api/v1/enrollments/:id                # Eliminar matrícula
POST   /api/v1/enrollments/validate-quota     # Validar cupos
```

### Subject Service
```
POST   /api/v1/subjects                       # Crear asignatura
GET    /api/v1/subjects                       # Listar asignaturas
GET    /api/v1/subjects/:id                   # Obtener asignatura
GET    /api/v1/subjects/code/:code            # Obtener por código
GET    /api/v1/subjects/program/:programId    # Asignaturas de programa
PUT    /api/v1/subjects/:id                   # Actualizar asignatura
DELETE /api/v1/subjects/:id                   # Eliminar asignatura
```

## 🔐 Seguridad

### Medidas Implementadas
- ✅ JWT para autenticación sin estado
- ✅ Contraseñas encriptadas con bcryptjs
- ✅ Operaciones atómicas con Redis para prevenir condiciones de carrera
- ✅ Validación de datos con class-validator
- ✅ CORS habilitado (configurable)
- ✅ HTTPS en producción (ALB)
- ✅ Secrets en AWS Secrets Manager
- ✅ Encriptación en reposo (RDS, ElastiCache)
- ✅ Security Groups para aislamiento de red

### Recomendaciones de Producción
- [ ] Cambiar contraseñas por defecto en terraform.tfvars
- [ ] Habilitar HTTPS con AWS Certificate Manager
- [ ] Implementar WAF (Web Application Firewall)
- [ ] Habilitar Multi-AZ para RDS
- [ ] Configurar Auto Scaling en ECS
- [ ] Implementar backup automático diario
- [ ] Habilitar CloudTrail para auditoría
- [ ] Rotar credenciales regularmente

## 📈 Monitoreo y Logs

### CloudWatch
- Logs automáticos de ECS en: `/ecs/smart-academic-management-cluster`
- Logs de ElastiCache: `/aws/elasticache/smart-academic-management-redis`
- Métricas disponibles en AWS Console

### Comandos útiles
```bash
# Ver logs de Auth Service
aws logs tail /ecs/smart-academic-management-cluster --follow --log-stream-names auth-service

# Ver logs de Enrollment Service
aws logs tail /ecs/smart-academic-management-cluster --follow --log-stream-names enrollment-service

# Ver logs de Subject Service
aws logs tail /ecs/smart-academic-management-cluster --follow --log-stream-names subject-service
```

## 🔄 CI/CD (Futuro)

El proyecto está preparado para integración con:
- GitHub Actions
- GitLab CI/CD
- AWS CodePipeline
- AWS CodeBuild
- AWS CodeDeploy

## 📝 Próximos Pasos

- [ ] Implementar gráficos académicos
- [ ] Agregar reportes y analytics
- [ ] Integración con sistemas de pago
- [ ] Implementar notificaciones
- [ ] API Gateway para enrutamiento
- [ ] Service mesh (Istio/Linkerd)
- [ ] Disaster recovery (RTO/RPO)
- [ ] Load testing y optimización

## 🛠️ Troubleshooting

### Problema: "Connection refused" para bases de datos
**Solución**: Verificar que los security groups permiten conexiones:
```bash
aws ec2 describe-security-groups --filters Name=tag:Name,Values=smart-academic-management-db-sg
```

### Problema: Tasks no se inician en ECS
**Solución**: Verificar logs en CloudWatch:
```bash
aws logs describe-log-streams --log-group-name /ecs/smart-academic-management-cluster
```

### Problema: Redis connection timeout
**Solución**: Verificar endpoint de ElastiCache:
```bash
aws elasticache describe-cache-clusters --cache-cluster-id smart-academic-management-redis --show-cache-node-info
```

## 📞 Soporte

Para reportar issues o sugerencias, contactar al equipo de desarrollo de Smart Campus.

## 📄 Licencia

Confidencial - Smart Campus UCE

---

**Versión**: 1.0.0  
**Última actualización**: 2024  
**Estado**: Production Ready
#   S m a r t - A c a d e m i c - M a n a g e m e n t  
 