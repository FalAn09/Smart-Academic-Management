import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seguridad y Validaciones globales
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('SMART CAMPUS UCE - Program Service')
    .setDescription(
      'API for managing academic programs and careers at the university.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/programs/docs', app, document);

  // Levantamos el servicio en el puerto 3003
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`🎓 Program Service running on port ${port}`);
}
bootstrap();
