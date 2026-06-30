import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as process from 'process';

async function bootstrap() {
  // Nota como usamos createMicroservice en lugar de create()
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_BROKER || '127.0.0.1:9092'],
        },
        consumer: {
          groupId: 'notification-consumer-group',
        },
      },
    },
  );

  await app.listen();
  console.log('Notification microservice is listening...');
}
bootstrap();