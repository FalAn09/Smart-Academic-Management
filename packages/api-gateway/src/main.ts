import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as process from 'process';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // 1. Variables de Entorno (URLs de los microservicios)
  const authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
  const enrollmentUrl =
    process.env.ENROLLMENT_SERVICE_URL || 'http://enrollment-service:3001';
  const subjectUrl =
    process.env.SUBJECT_SERVICE_URL || 'http://subject-service:3002';
  const programUrl =
    process.env.PROGRAM_SERVICE_URL || 'http://program-service:3003';
  const classroomUrl = // 👈 NUEVA VARIABLE
    process.env.CLASSROOM_SERVICE_URL || 'http://classroom-service:3004';

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

  app.use(
    '/api/v1/programs',
    createProxyMiddleware({
      target: programUrl,
      changeOrigin: true,
    }),
  );

  // 👇 NUEVO: Proxy para el enrutamiento de Aulas
  app.use(
    '/api/v1/classrooms',
    createProxyMiddleware({
      target: classroomUrl,
      changeOrigin: true,
    }),
  );

  // 3. Swagger Centralizado
  const config = new DocumentBuilder()
    .setTitle('SMART CAMPUS UCE - API Gateway')
    .setDescription('Documentación unificada de los microservicios académicos')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    swaggerOptions: {
      urls: [
        { url: '/api/v1/auth/docs-json', name: '🔐 Auth Service' },
        { url: '/api/v1/enrollments/docs-json', name: '📝 Enrollment Service' },
        { url: '/api/v1/subjects/docs-json', name: '📚 Subject Service' },
        { url: '/api/v1/programs/docs-json', name: '🎓 Program Service' },
        { url: '/api/v1/classrooms/docs-json', name: '🏢 Classroom Service' }, // 👈 NUEVO: Agregado al menú
      ],
    },
  });

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(
    `🚀 API Gateway corriendo y enrutando tráfico en el puerto ${port}`,
  );
  console.log(
    `📚 Documentación centralizada en: http://localhost:${port}/api/docs`,
  );
}
bootstrap();