import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';
import { SubjectEntity } from './entities/subject.entity';
import { ProgramEntity } from './entities/program.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectEntity, ProgramEntity])],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectModule {}
