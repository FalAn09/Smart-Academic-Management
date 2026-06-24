import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager'; // Mantén el import
// Borra la línea de import * as redisStore...
import { SubjectModule } from './subject/subject.module';
import { SubjectEntity } from './subject/entities/subject.entity';
import { ProgramEntity } from './subject/entities/program.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'subject_db',
      entities: [SubjectEntity, ProgramEntity],
      synchronize: true, // Ya está en true, ¡perfecto!
      logging: process.env.NODE_ENV !== 'production',
    }),
    // Configuración limpia sin Redis:
    CacheModule.register({
      ttl: 3600,
      isGlobal: true,
    }),
    SubjectModule,
  ],
})
export class AppModule {}