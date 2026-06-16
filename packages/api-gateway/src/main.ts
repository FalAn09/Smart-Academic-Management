import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as process from 'process';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // 1. Variables de Entorno (URLs de los microservicios)
  const authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
  const enrollmentUrl =
    process.env.ENROLLMENT_SERVICE_URL || 'http://enrollment-service:3001';
  const subjectUrl =
    process.env.SUBJECT_SERVICE_URL || 'http://subject-service:3002';
  // LÍNEA CORREGIDA:
  const programUrl =
    process.env.PROGRAM_SERVICE_URL || 'http://program-service:3003';

  // 2. Middlewares de Proxy
  app.use(
    '/api/v1/auth',
    createProxyMiddleware({
      target: authUrl,
      changeOrigin: true,
    }),
  );

  app.use(
    '/api/v1/enrollments',
    createProxyMiddleware({
      target: enrollmentUrl,
      changeOrigin: true,
    }),
  );

  app.use(
    '/api/v1/subjects',
    createProxyMiddleware({
      target: subjectUrl,
      changeOrigin: true,
    }),
  );

  // BLOQUE NUEVO: Enrutamiento para el Program Service
  app.use(
    '/api/v1/programs',
    createProxyMiddleware({
      target: programUrl,
      changeOrigin: true,
    }),
  );

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(
    `🚀 API Gateway corriendo y enrutando tráfico en el puerto ${port}`,
  );
}
bootstrap();
