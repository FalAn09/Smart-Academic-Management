import { Test, TestingModule } from '@nestjs/testing';
import { ProgramService } from './program.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';

describe('ProgramService', () => {
  let service: ProgramService;

  // 1. MOCK DE LA BASE DE DATOS (TypeORM)
  const mockProgramRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((program) =>
      Promise.resolve({ id: 'uuid-123', createdAt: new Date(), updatedAt: new Date(), ...program }),
    ),
    find: jest.fn().mockResolvedValue([
      { id: 'uuid-1', name: 'Software', code: 'SW-01', totalSemesters: 10, isActive: true },
    ]),
    findOne: jest.fn().mockResolvedValue(null),
  };

  // 2. MOCK DE REDIS (Caché)
  // Si en tu program.module.ts usaste un nombre distinto para inyectar Redis, 
  // cambia 'REDIS_CLIENT' por el nombre exacto que usaste.
  const mockRedisClient = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue('OK'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramService,
        {
          provide: getRepositoryToken(Program),
          useValue: mockProgramRepository,
        },
        {
          provide: 'REDIS_CLIENT', 
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<ProgramService>(ProgramService);
  });

  it('debería estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  it('debería crear un programa correctamente', async () => {
    const createDto = { 
      code: 'ING-01', 
      name: 'Ingeniería en Sistemas', 
      description: 'Carrera principal', 
      totalSemesters: 10, 
      degreeTitle: 'Ingeniero', 
      isActive: true 
    };

    const result = await service.create(createDto);

    // Verificamos que el repositorio simulado haya sido llamado y devuelva el ID falso
    expect(mockProgramRepository.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id', 'uuid-123');
    expect(result.code).toEqual('ING-01');
  });
});