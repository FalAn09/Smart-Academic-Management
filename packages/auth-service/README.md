# 🔐 Auth Service - SMART CAMPUS UCE

This microservice is the core identity and security component of the SMART CAMPUS UCE platform. It handles user management, credential encryption, authentication, and the issuance of JWT tokens (JSON Web Tokens) to secure the routes of the other microservices.

## 🚀 Main Features

* **User Registration:** Creation of profiles for students, professors, and administrators.

* **JWT Authentication:** Secure login with `accessToken` and `refreshToken` generation.

* **Security:** Password encryption using `bcryptjs`.

* **Intercommunication:** Provides fast-read endpoints for other microservices (such as `enrollment-service`) to validate a user's existence and identity.

## 🛠️ Technologies

* **Framework:** NestJS
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** TypeORM
* **Authentication:** Passport / JWT / bcryptjs

## ⚙️ Configuration and Execution

Because it's part of a managed monorepo with Nx, you can run this service independently during development.

### Local Execution (Development)

1. Ensure you have a running PostgreSQL instance (you can use `docker-compose` in the root directory).

2. Run the service using Nx:
``powershell

npx nx serve auth-service


## Build and Dockerize
To build the production image of this microservice, run the following commands using PowerShell from the monorepo root:

# 1. Build the project

npx nx run @org/auth-service:build

# 2. Build the Docker image

docker build -f packages/auth-service/Dockerfile -t dapaeza/auth-service:latest .

# 3. Start the container

docker compose up -d --force-recreate auth-service

## 📡 Main Endpoints (API v1)
Complete interactive documentation is available on Swagger by accessing http://localhost:3000/api/docs when the service is running.

## Public Authentication

POST /api/v1/auth/register - Registers a new user in the system.

POST /api/v1/auth/login - Validates credentials and returns the JWT tokens.

## Protected Routes (Require Authorization Header: Bearer <token>)

GET /api/v1/auth/profile - Returns the data of the currently authenticated user.

POST /api/v1/auth/logout - Logs the user out.

POST /api/v1/auth/validate-token - Checks if a token is still valid.

POST /api/v1/auth/refresh-token - Refreshes the access token using the refresh token.

## Internal Routes (Communication between Microservices)
GET /api/v1/auth/profile/:id - Searches for and returns the profile of a specific user using their UUID. (Primarily used by the enrollment service to validate identities during registration).

## 🗄️ Database Structure
The service manages the users table with the following key fields:

id (UUID - Primary Key)

username & email (Unique)

password (bcrypt hash)

role (ADMIN, PROFESSOR, STUDENT, DEAN)

status (ACTIVE, INACTIVE, SUSPENDED)

studentId / professorId