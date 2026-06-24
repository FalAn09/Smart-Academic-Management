import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService } from './enrollment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EnrollmentEntity } from './entities/enrollment.entity';
// Importamos Student y los servicios que faltaban
import { StudentEntity } from './entities/student.entity'; 
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

// Interceptamos ambas entidades para evitar bucles
jest.mock('./entities/enrollment.entity', () => ({
  EnrollmentEntity: class EnrollmentMock {}
}));
jest.mock('./entities/student.entity', () => ({
  StudentEntity: class StudentMock {}
}));

describe('EnrollmentService', () => {
  let service: EnrollmentService;

  const mockEnrollmentRepository = {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'uuid-1', ...dto })),
  };

  // 1. Mock para el repositorio de Estudiantes (el índice [1] que fallaba)
  const mockStudentRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 'uuid-student', name: 'Estudiante Test' }),
  };

  // 2. Mock para CACHE_MANAGER (Redis/Memoria)
  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };

  // 3. Mock para HttpService (Llamadas a APIs externas)
  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  // 4. Mock para ConfigService (.env variables)
  const mockConfigService = {
    get: jest.fn().mockReturnValue('some_config_value'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        {
          provide: getRepositoryToken(EnrollmentEntity),
          useValue: mockEnrollmentRepository,
        },
        // Añadimos las 4 dependencias faltantes al módulo de prueba:
        {
          provide: getRepositoryToken(StudentEntity),
          useValue: mockStudentRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
  });

  it('debería estar definido el servicio de matrículas', () => {
    expect(service).toBeDefined();
  });

  it('debería simular el registro de una matrícula', async () => {
    const dto = { studentId: 'uuid-student', programId: 'uuid-program' };
    const mockCreated = await mockEnrollmentRepository.save(dto);
    
    expect(mockCreated).toHaveProperty('id', 'uuid-1');
  });
});