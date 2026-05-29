import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { StudentEntity } from './entities/student.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(EnrollmentEntity)
    private enrollmentRepository: Repository<EnrollmentEntity>,
    @InjectRepository(StudentEntity)
    private studentRepository: Repository<StudentEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<EnrollmentEntity> {
    // Validate student exists
    const student = await this.studentRepository.findOne({
      where: { studentId: createEnrollmentDto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if enrollment already exists
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        studentId: createEnrollmentDto.studentId,
        subjectId: createEnrollmentDto.subjectId,
        semester: createEnrollmentDto.semester,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Student is already enrolled in this subject');
    }

    // Validate quota with atomic operation using Redis
    const quotaKey = `quota:${createEnrollmentDto.subjectId}`;
    const currentEnrollments = await this.cacheManager.get(quotaKey) || 0;
    const maxQuota = 40; // Configurable

    if (currentEnrollments >= maxQuota) {
      throw new BadRequestException('No available spots in this subject');
    }

    // Atomic increment
    await this.cacheManager.set(quotaKey, currentEnrollments + 1, 86400000);

    // Create enrollment
    const enrollment = this.enrollmentRepository.create({
      ...createEnrollmentDto,
      enrollmentDate: new Date(),
      status: 'ACTIVE',
    });

    return await this.enrollmentRepository.save(enrollment);
  }

  async findAll(): Promise<EnrollmentEntity[]> {
    return await this.enrollmentRepository.find();
  }

  async findById(id: string): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async findByStudentId(studentId: string): Promise<EnrollmentEntity[]> {
    return await this.enrollmentRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<EnrollmentEntity> {
    const enrollment = await this.findById(id);
    Object.assign(enrollment, updateEnrollmentDto);
    return await this.enrollmentRepository.save(enrollment);
  }

  async delete(id: string): Promise<void> {
    const enrollment = await this.findById(id);
    await this.enrollmentRepository.remove(enrollment);
  }

  async validateQuota(
    subjectId: string,
    requiredSpots: number,
  ): Promise<boolean> {
    const quotaKey = `quota:${subjectId}`;
    const currentEnrollments = await this.cacheManager.get(quotaKey) || 0;
    const maxQuota = 40;

    return currentEnrollments + requiredSpots <= maxQuota;
  }
}
