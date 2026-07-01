import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 👇 ESTO ES CLAVE: Debe ser idéntico al prefijo de tu Gateway
  app.setGlobalPrefix('api/v1'); 
  
  const port = process.env.PORT || 3010;
  await app.listen(port);
  console.log(`🚀 Health Monitor running on port ${port}`);
}
bootstrap();