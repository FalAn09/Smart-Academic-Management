# Smart Academic Management - README

## 📋 Project Description

Smart Academic Management is the **Academic Module (Module 1)** of the integrated **Smart Campus UCE** platform. This project implements a decoupled microservices architecture developed in NestJS, packaged with Docker, and deployed on AWS using Terraform.


## 🏗️ Architecture

### Core Microservices

1. **Auth Service** (Port 3000)

- Authentication and authorization management

- Token-based JWT

- Roles: ADMIN, PROFESSOR, STUDENT, DEAN

2. **Enrollment Service** (Port 3001)

- Enrollment/registration management

- Capacity validation with ElastiCache (Redis)

- Atomic operations to prevent race conditions

- Dedicated PostgreSQL database

3. **Subject Service** (Port 3002)

- Course catalog management

- Course offering management

- Relationship with academic programs

- Dedicated PostgreSQL database

### Infrastructure Components

- **Load Balancer (ALB)**: Distributes traffic among services
- **PostgreSQL RDS**: 3 independent instances for each service
- **ElastiCache Redis**: In-memory cache for course validation
- **ECS Fargate**: Container orchestration
- **VPC**: Isolated network with public and private subnets
- **CloudWatch**: Monitoring and logging

## 📁 Project Structure

```
Smart Academic Management/
├── backend/
│ ├── auth-service/ # Authentication microservice
│ │ ├── src/
│ │ │ ├── auth/
│ │ │ │ ├── auth.controller.ts
│ │ │ │ ├── auth.service.ts
│ │ │ │ ├── auth.module.ts
│ │ │ │ ├── entities/
│ │ │ │ ├── discount/
│ │ │ │ ├── strategies/
│ │ │ │ └── guards/
│ │ │ ├── app.module.ts
│ │ │ └── main.ts
│ │ ├── Dockerfile
│ │ ├── package.json
│ │ └── tsconfig.json
│ ├── enrollment-service/ # Enrollment microservice
│ │ ├── src/
│ │ │ ├── enrollment/
│ │ │ │ ├── enrollment.controller.ts
│ │ │ │ ├── enrollment.service.ts
│ │ │ │ ├── enrollment.module.ts
│ │ │ │ ├── entities/
│ │ │ │ └── discount/
│ │ │ ├── app.module.ts
│ │ │ └── main.ts
│ │ ├── Dockerfile
│ │ ├── package.json
│ │ └── tsconfig.json
│ └── subject-service/ # Subject microservice
│ ├── src/
│ │ ├── subject/
│ │ │ ├── subject.controller.ts
│ │ │ ├── subject.service.ts
│ │ │ ├── subject.module.ts
│ │ │ ├── entities/
│ │ │ └── discount/
│ │ ├── app.module.ts
│ │ └── main.ts
│ ├── Dockerfile
│ ├── package.json
│ └── tsconfig.json
├── infrastructure/
│ ├── docker/ # Additional Docker configurations
│ └── terraform/
│ ├── modules/
│ │ ├── vpc/ # VPC Module
│ │ ├── rds/ # RDS Module
│ │ ├── elasticache/ # ElastiCache Module
│ │ ├── alb/ # Application Load Balancer Module
│ │ └── ecs/ # ECS Module
│ └── qa/ # QA Configuration
│ ├── main.tf
│ ├── provider.tf
│ ├── variables.tf
│ ├── outputs.tf
│ └── terraform.tfvars
├── docker-compose.yml # Compose for local development
└── README.md
```

## 🚀 Quick Start

### Local Development

#### Requirements
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (optional if using Docker)
- Redis (optional if using Docker)

#### Steps

1. **Clone the repository**
```bash
cd "Smart Academic Management"
```

2. **Install dependencies**
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

3. **Create .env files**
```bash
cd backend/auth-service
cp .env.example .env

cd ../enrollment-service
cp .env.example .env

cd ../subject-service
cp .env.example .env
cd ../../
```

4. **Run with Docker Compose**
```bash
docker-compose up -d
```

This will start:
- 3 PostgreSQL instances (ports 5432, 5433, 5434)
- 1 Redis instance (port 6379)
- Auth Service (port 3000)
- Enrollment Service (port 3001)
- Subject Service (port 3002)

5. **Verify Services**
```bash
# Health check
curl http://localhost:3000/api/v1/auth/profile
curl http://localhost:3001/api/v1/enrollments
curl http://localhost:3002/api/v1/subjects
```

### Deployment on AWS (QA)

#### Requirements
- AWS CLI configured
- Terraform >= 1.0
- AWS credentials with sufficient permissions
- S3 bucket for Terraform state (create manually)
- DynamoDB table for locks (create manually)

#### Steps

1. **Create S3 bucket for state**
```bash
aws s3api create-bucket \
--bucket smart-campus-terraform-state \
--region us-east-1 \
--profile your-profile
```

2. **Create DynamoDB table for locks**
```bash
aws dynamodb create-table \ 
--table-name terraform-locks
\ 
--attribute-definitions AttributeName=LockID,AttributeType=S \ 
--key-schema AttributeName=LockID,KeyType=HASH \ 
--provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \ 
--region us-east-1 \ 
--profile your-profile
```

3. **Build and push Docker images to ECR**
```bash
# Create ECR repositories
aws ecr create-repository --repository-name auth-service --region us-east-1
aws ecr create-repository --repository-name enrollment-service --region us-east-1
aws ecr create-repository --repository-name subject-service --region us-east-1

# Login in ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 384078707866.dkr.ecr.us-east-1.amazonaws.com

# Build and push Auth Service
cd backend/auth-service
docker build -t 384078707866.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest .
docker push 384078707866.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
cd ../..

# Build and push Enrollment Service
cd backend/enrollment-service
docker build -t 384078707866.dkr.ecr.us-east-1.amazonaws.com/enrollment-service:latest .
docker push 384078707866.dkr.ecr.us-east-1.amazonaws.com/enrollment-service:latest
cd ../..

# Build and push Subject Service
cd backend/subject-service
docker build -t 384078707866.dkr.ecr.us-east-1.amazonaws.com/subject-service:latest .
docker push 384078707866.dkr.ecr.us-east-1.amazonaws.com/subject-service:latest
cd ../..
```

4. **Initialize Terraform**
```bash
cd infrastructure/terraform/qa
terraform init
```

5. **Validate configuration**
```bash
terraform validate
terraform plan
```

6. **Apply configuration**
```bash
terraform apply

# Confirmations will be requested. Type 'yes' to confirm
```

7. **Get Outputs**
```bash
terraform output

# This will show:
# - ALB DNS name
# - Service URLs
# - Database endpoints
# - Cache endpoints
```

## 📊 API Endpoints

### Auth Service
```
POST /api/v1/auth/register # Register new user
POST /api/v1/auth/login # Log in
GET /api/v1/auth/profile # Get profile (requires JWT)
POST /api/v1/auth/logout # Log out
POST /api/v1/auth/validate-token # Validate token
POST /api/v1/auth/refresh-token # Refresh token
```

### Enrollment Service
```
POST /api/v1/enrollments # Create enrollment
GET /api/v1/enrollments # List enrollments
GET /api/v1/enrollments/:id # Get enrollment
GET /api/v1/enrollments/student/:studentId # Student enrollments
PUT /api/v1/enrollments/:id # Update enrollment
DELETE /api/v1/enrollments/:id # Delete enrollment
POST /api/v1/enrollments/validate-quota # Validate quotas
```

### Subject Service
```
POST /api/v1/subjects # Create subject
GET /api/v1/subjects # List subjects
GET /api/v1/subjects/:id # Get subject
GET /api/v1/subjects/code/:code # Get by code
GET /api/v1/subjects/program/:programId # Program subjects
PUT /api/v1/subjects/:id # Update subject
DELETE /api/v1/subjects/:id # Delete subject
```

## 🔐 Security

### Implemented Measures
- ✅ JWT for stateless authentication
- ✅ Passwords encrypted with bcryptjs
- ✅ Atomic operations with Redis to prevent race conditions
- ✅ Data validation with class-validator
- ✅ CORS enabled (configurable)
- ✅ HTTPS in production (ALB)
- ✅ Secrets in AWS Secrets Manager
- ✅ Encryption at rest (RDS, ElastiCache)
- ✅ Security Groups for network isolation

### Production Recommendations
- [ ] Change passwords Default settings in terraform.tfvars
- [ ] Enable HTTPS with AWS Certificate Manager
- [ ] Implement a WAF (Web Application Firewall)
- [ ] Enable Multi-AZ for RDS
- [ ] Configure Auto Scaling in ECS
- [ ] Implement daily automatic backups
- [ ] Enable CloudTrail for auditing
- [ ] Rotate credentials regularly

## 📈 Monitoring and Logs

### CloudWatch
- Automatic ECS logs in: `/ecs/smart-academic-management-cluster`
- ElastiCache logs: `/aws/elasticache/smart-academic-management-redis`
- Metrics available in the AWS Console

### Useful Commands
```bash
# View Auth Service logs
`aws logs tail /ecs/smart-academic-management-cluster --follow` --log-stream-names auth-service

# View Enrollment Service logs
aws logs tail /ecs/smart-academic-management-cluster --follow --log-stream-names enrollment-service

# View Subject Service logs
aws logs tail /ecs/smart-academic-management-cluster --follow --log-stream-names subject-service
```