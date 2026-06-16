import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';
import { Program } from './entities/program.entity';

@Module({
  imports: [
    // 1. Configuración de Redis para el caché
    CacheModule.register({
      isGlobal: true,
      host: process.env.REDIS_HOST || 'localhost',
      port: 6379,
    }),
    
    // 2. Configuración de la base de datos Postgres
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      // Usamos el puerto 5435 que definiste en tu docker-compose local
      port: parseInt(process.env.DB_PORT, 10) || 5435, 
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'program_db',
      entities: [Program],
      synchronize: true, // En desarrollo, NestJS creará la tabla 'program' por ti
    }),

    // 3. Registramos la entidad para que el ProgramService pueda inyectarla
    TypeOrmModule.forFeature([Program]),
  ],
  controllers: [ProgramController],
  providers: [ProgramService],
})
export class AppModule {}