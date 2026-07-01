import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Usamos los nombres internos de la red de Docker Compose
  private readonly microservices = [
    { name: 'API Gateway', url: 'http://api-gateway:8080/health' },
    { name: 'Auth Service', url: 'http://auth-service:3000/api/v1/auth/health' },
    { name: 'Enrollment Service', url: 'http://enrollment-service:3001/api/v1/enrollments/data/health' },
    { name: 'Subject Service', url: 'http://subject-service:3002/api/v1/subjects/data/health' },
    { name: 'Program Service', url: 'http://program-service:3003/api/v1/programs/data/health' },
    { name: 'Classroom Service', url: 'http://classroom-service:3004/api/v1/classrooms/data/health' },
  ];

  async checkAllServices() {
    const results = await Promise.all(
      this.microservices.map(async (service) => {
        try {
          // Usamos un timeout de 3 segundos para no quedarnos colgados si un servicio murió
          const response = await fetch(service.url, { signal: AbortSignal.timeout(3000) });
          return {
            name: service.name,
            status: response.ok ? 'UP' : 'DOWN',
            code: response.status,
          };
        } catch (error) {
          return {
            name: service.name,
            status: 'DOWN',
            code: 500,
          };
        }
      }),
    );
    return results;
  }
}