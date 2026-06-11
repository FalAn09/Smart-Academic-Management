import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
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
    private readonly httpService: HttpService, // <-- Cliente HTTP inyectado
    private readonly configService: ConfigService, // <-- Lector de variables de entorno
  ) {}

  async create(
    createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<EnrollmentEntity> {
    // 1. Buscar al estudiante localmente
    let student = await this.studentRepository.findOne({
      where: { studentId: createEnrollmentDto.studentId },
    });

    // Si no existe, lo vamos a buscar al Auth Service (Lazy Load)
    if (!student) {
      try {
        const authUrl =
          this.configService.get<string>('AUTH_SERVICE_URL') ||
          'http://auth-service:3000';
        const { data: axiosResponse } = await lastValueFrom(
          this.httpService.get(
            `${authUrl}/api/v1/auth/profile/${createEnrollmentDto.studentId}`,
          ),
        );

        // EXTRAEMOS AL USUARIO DEL OBJETO "data" DE LA RESPUESTA DE NESTJS
        const userPayload = axiosResponse.data
          ? axiosResponse.data
          : axiosResponse;

        // Lo creamos en nuestra base de datos local como "espejo"
        student = this.studentRepository.create({
          studentId: userPayload.id,
          firstName: userPayload.firstName,
          lastName: userPayload.lastName,
          email: userPayload.email,
          programId: userPayload.programId || 'PENDING',
          status: 'ACTIVE',
        });
        await this.studentRepository.save(student);
      } catch (error) {
        // Imprime el error real que devuelve el otro microservicio
        console.error(
          '[DEBUG AXIOS ERROR]:',
          error.response?.data || error.message,
        );
        throw new NotFoundException('The student does not exist.');
      }
    }

    // 2. Comprobar si ya está matriculado en esta materia
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        studentId: createEnrollmentDto.studentId,
        subjectId: createEnrollmentDto.subjectId,
        semester: createEnrollmentDto.semester,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException(
        'The student is already enrolled in this subject for this semester.',
      );
    }

    // 3. Validar existencia y cupos reales con el Subject Service
    let maxQuota = 40; // Fallback por seguridad
    try {
      const subjectBaseUrl =
        this.configService.get<string>('SUBJECT_SERVICE_URL') ||
        'http://subject-service:3002';
      const subjectUrl = `${subjectBaseUrl}/api/v1/subjects/data/detail/${createEnrollmentDto.subjectId}`;
      const { data: subjectData } = await lastValueFrom(
        this.httpService.get(subjectUrl),
      );

      maxQuota = subjectData.maxCapacity; // Usamos la capacidad real de la base de datos de asignaturas
    } catch (error) {
      throw new BadRequestException(
        'Error validating the subject. Please verify that the ID is correct and the Subjects service is online.',
      );
    }

    // 4. Lógica Atómica de Cupos (Redis)
    const quotaKey = `quota:${createEnrollmentDto.subjectId}`;
    const currentEnrollments = (await this.cacheManager.get(quotaKey)) || 0;

    if (currentEnrollments >= maxQuota) {
      throw new BadRequestException(
        `The subject has reached its maximum capacity of ${maxQuota} students.`,
      );
    }

    // Incrementar cupo
    await this.cacheManager.set(quotaKey, currentEnrollments + 1, 86400000);

    // 5. Crear la matrícula
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
      throw new NotFoundException('Enrollment not found.');
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
    let maxQuota = 40;
    try {
      const subjectBaseUrl =
        this.configService.get<string>('SUBJECT_SERVICE_URL') ||
        'http://subject-service:3002';
      const subjectUrl = `${subjectBaseUrl}/api/v1/subjects/${subjectId}`;
      const { data: subjectData } = await lastValueFrom(
        this.httpService.get(subjectUrl),
      );
      maxQuota = subjectData.maxCapacity;
    } catch (error) {
      // Si el servicio de asignaturas falla, fallamos la validación
      return false;
    }

    const quotaKey = `quota:${subjectId}`;
    const currentEnrollments = (await this.cacheManager.get(quotaKey)) || 0;

    return currentEnrollments + requiredSpots <= maxQuota;
  }
}
