import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'; // <-- Importación agregada
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { StudentEntity } from './entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnrollmentEntity, StudentEntity]),
    HttpModule, // <-- Módulo activado
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}