import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectEntity } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(SubjectEntity)
    private subjectRepository: Repository<SubjectEntity>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<SubjectEntity> {
    const subject = this.subjectRepository.create({
      ...createSubjectDto,
      status: 'ACTIVE',
    });
    return await this.subjectRepository.save(subject);
  }

  async findAll(): Promise<SubjectEntity[]> {
    return await this.subjectRepository.find();
  }

  async findById(id: string): Promise<SubjectEntity> {
    const subject = await this.subjectRepository.findOne({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async findByCode(code: string): Promise<SubjectEntity> {
    const subject = await this.subjectRepository.findOne({
      where: { code },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async findByProgram(programId: string): Promise<SubjectEntity[]> {
    return await this.subjectRepository.find({
      where: { programId, status: 'ACTIVE' },
      order: { semester: 'ASC' },
    });
  }

  async update(
    id: string,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<SubjectEntity> {
    const subject = await this.findById(id);
    Object.assign(subject, updateSubjectDto);
    return await this.subjectRepository.save(subject);
  }

  async delete(id: string): Promise<void> {
    const subject = await this.findById(id);
    await this.subjectRepository.remove(subject);
  }
}
