import { NestFactory } from '@nestjs/core';
import { ValidationPipe, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // --- CONFIGURACIÓN DE SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('SMART CAMPUS UCE - Enrollment Service')
    .setDescription('API para el registro y gestión de matrículas de estudiantes.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  // --------------------------------

  const port = configService.get<number>('PORT') || 3001;
  const logLevel = configService.get<LogLevel>('LOG_LEVEL') || 'log';

  await app.listen(port);
  console.log(`[${new Date().toISOString()}] Enrollment Service running on port ${port}`);
  console.log(`📄 Swagger Docs en: http://localhost:${port}/api/docs`);
}

bootstrap();