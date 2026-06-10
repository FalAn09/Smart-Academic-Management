# 📚 Subject Service - SMART CAMPUS UCE

The **Subject Service** is the microservice responsible for managing the academic catalog and curriculum of the SMART CAMPUS UCE platform. It acts as the source of truth for all subjects, controlling the academic offerings, prerequisites, and available spaces in real time.

## 🚀 Main Features

* **Academic Catalog:** Complete management (CRUD) of subjects, including details such as credits, hours, and semesters.

* **Capacity Control:** Defines and manages the student limit per subject (`maxCapacity`), a critical piece of data constantly consulted by the `enrollment-service`.

* **Prerequisite Management:** Maintains the curriculum logic to determine which subjects block or enable others.

* **High Availability:** Designed to respond quickly to validation queries from the enrollment service during peak load times.

## 🛠️ Technologies

* **Framework:** NestJS
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** TypeORM
* **Documentation:** Swagger (OpenAPI)

## ⚙️ Configuration and Execution

This service is part of the monorepo managed with Nx. Follow these steps to work with it:

### Local Execution (Development)

1. Ensure that the PostgreSQL database assigned to this service is active.

2. Run the development environment with a hot reload:

``powershell

npx nx serve subject-service

## Build and Dockerize
To generate the production version and deploy it in the container architecture, run these commands in PowerShell from the project root:

# 1. Build the service

npx nx run @org/subject-service:build

# 2. Build the Docker image using the root package.json file

docker build -f packages/subject-service/Dockerfile -t dapaeza/subject-service:latest .

# 3. Start/Update the specific container

docker compose up -d --force-recreate subject-service

## 📡 Main Endpoints (API v1)
Explore and interact with the full API using the Swagger interface at http://localhost:3002/api/docs.

## Subject Management
POST /api/v1/subjects - Creates a new subject (Requires strict DTO validation).

GET /api/v1/subjects - Lists all active subjects in the catalog.

GET /api/v1/subjects/:id - Returns details of a specific subject using its UUID.

PATCH /api/v1/subjects/:id - Updates subject information (e.g., changes instructor or adjusts maximum capacity).

DELETE /api/v1/subjects/:id - Deactivates or removes a subject from the system.

## 🗄️ Database Structure
The service manages the subjects table, ensuring the integrity of academic data:

id (UUID - Primary Key)

code (String, Unique - e.g., "DIST-001")

name (String - e.g., "Distributed Programming")

credits & hours (Integer)

semester (String)

programId (String referencing the program)

maxCapacity (Integer - Enrollment limit)

status (ACTIVE, INACTIVE, DISCONTINUED)

prerequisites (Optional JSON array)