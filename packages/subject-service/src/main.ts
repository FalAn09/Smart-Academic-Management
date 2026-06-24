import { NestFactory } from '@nestjs/core';
import { ValidationPipe, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
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
    .setTitle('SMART CAMPUS UCE - Subject Service')
    .setDescription('API para la gestión de asignaturas y materias.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // CONFIGURACIÓN LIMPIA EN PLURAL
  SwaggerModule.setup('api/v1/subjects/docs', app, document, {
    useGlobalPrefix: false,
  });
  // --------------------------------

  const port = configService.get<number>('PORT') || 3002;
  const logLevel = configService.get<LogLevel>('LOG_LEVEL') || 'log';

  await app.listen(port);
  console.log(
    `[${new Date().toISOString()}] Subject Service running on port ${port}`,
  );
  console.log(
    `📄 Swagger Docs en: http://localhost:${port}/api/v1/subjects/docs`,
  );
}

// Filtro global para ver errores reales en la consola
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('--- ERROR DETECTADO ---', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response
      .status(500)
      .json({ message: 'Internal Server Error', error: exception });
  }
}

bootstrap();
