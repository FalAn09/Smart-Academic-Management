# 📝 Enrollment Service - SMART CAMPUS UCE

The **Enrollment Service** is the orchestration engine of the SMART CAMPUS UCE platform. This microservice acts as the central coordinator during the student enrollment process, ensuring data integrity by interacting in a distributed manner with other system entities before confirming a transaction.

## 🚀 Main Features

* **Microservice Orchestration:** It communicates via HTTP with the `auth-service` to validate the student's existence and identity, and with the `subject-service` to verify course availability.

* **Concurrency Control:** It uses Redis to manage the verification and deduction of course slots (`maxCapacity`) in real time, preventing course overbooking.

* **Enrollment Management:** It records and maintains the academic history of transactions (semester, credits, enrollment status).

* * **Security:** Routes are protected using JWT token validation injected from the Gateway or the client.

## 🛠️ Technologies

* **Framework:** NestJS
* **Language:** TypeScript
* **Primary Database:** PostgreSQL
* **Cache/Transactions:** Redis
* **ORM:** TypeORM
* **Communication:** Axios / NestJS HttpModule

## ⚙️ Configuration and Execution

By working within the Nx Workspace environment, you can run and test this service in isolation.

### Local Execution (Development)

1. Ensure you have running PostgreSQL and Redis instances.

2. Run the service in your terminal using pnpm and Nx:
``powershell

npx nx serve enrollment-service

## Building and Dockerizing
To generate production code and integrate it into the distributed container network, run these commands from the monorepo root:

1. Build the project (raising dependencies to the root)
`npx nx run @org/enrollment-service:build`

2. Build the Docker image
`docker build -f packages/enrollment-service/Dockerfile -t dapaeza/enrollment-service:latest`

3. Start/Update the container
`docker compose up -d --force-recreate enrollment-service`

## 📡 Main Endpoints (API v1)
Interactive documentation and data schemas are available on Swagger at http://localhost:3001/api/docs.

(Note: All create/modify paths require the header `Authorization: Bearer <JWT>`)

POST /api/v1/enrollments - Creates a new enrollment. Requires studentId, subjectId, semester, and credits. Triggers chain validation with Auth and Subject.

GET /api/v1/enrollments/:id - Returns the details of a specific enrollment.

GET /api/v1/enrollments/student/:studentId - Returns the history of a student's enrolled courses.

PATCH /api/v1/enrollments/:id/status - Updates the enrollment status (e.g., course withdrawal).

## 🗄️ Database Structure
The service manages the enrollments table with the following transactional fields:

id (UUID - Primary Key)

studentId (Auth Service reference UUID)

subjectId (Subject Service reference UUID)

semester (e.g., "2026-1")

credits (Integer)

status (ACTIVE, DROPPED, COMPLETED, FAILED, PENDING)

enrollmentDate (Timestamp)

Indexes optimized for fast searches by studentId + subjectId.