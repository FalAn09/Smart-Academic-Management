import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { EnrollmentEntity } from './enrollment/entities/enrollment.entity';
import { StudentEntity } from './enrollment/entities/student.entity';

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
      database: process.env.DB_DATABASE || 'enrollment_db',
      entities: [EnrollmentEntity, StudentEntity],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      ttl: parseInt(process.env.CACHE_TTL) || 3600,
      isGlobal: true,
    }),
    EnrollmentModule,
  ],
})
export class AppModule {}
