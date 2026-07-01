import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 👈 Nuevas importaciones

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // =========================================================
  // CONFIGURACIÓN DE SWAGGER
  // =========================================================
  const config = new DocumentBuilder()
    .setTitle('Classroom Service')
    .setDescription('API for managing physical infrastructure and classrooms on campus')
    .setVersion('1.0')
    .addBearerAuth() // Mantiene el estándar de JWT de tu Auth Service
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  // Montamos Swagger en la ruta específica de este dominio
  SwaggerModule.setup(`${globalPrefix}/classrooms/docs`, app, document);
  // =========================================================

  const port = process.env.PORT || 3004;
  await app.listen(port);
  
  Logger.log(`🚀 Classroom Service is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 Swagger UI available at: http://localhost:${port}/${globalPrefix}/classrooms/docs`);
}

bootstrap();