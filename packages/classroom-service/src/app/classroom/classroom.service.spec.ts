import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClassroomService } from './classroom.service';
import { ClassroomEntity } from './entities/classroom.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ClassroomService', () => {
  let service: ClassroomService;

  // 1. Creamos un "Doble" (Mock) de la base de datos
  const mockClassroomRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassroomService,
        {
          provide: getRepositoryToken(ClassroomEntity),
          useValue: mockClassroomRepository, // Inyectamos el mock en lugar de la BD real
        },
      ],
    }).compile();

    service = module.get<ClassroomService>(ClassroomService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un aula exitosamente', async () => {
      const createDto = { code: 'A-101', capacity: 30, type: 'TEORICA' as any };
      
      // Simulamos que la BD no encuentra ningún aula con ese código
      mockClassroomRepository.findOne.mockResolvedValue(null);
      mockClassroomRepository.create.mockReturnValue(createDto);
      mockClassroomRepository.save.mockResolvedValue({ id: '123', ...createDto });

      const result = await service.create(createDto);

      expect(result).toEqual({ id: '123', ...createDto });
      expect(mockClassroomRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar error si el código de aula ya existe', async () => {
      const createDto = { code: 'A-101', capacity: 30, type: 'TEORICA' as any };
      
      // Simulamos que la BD SÍ encuentra un aula con ese código
      mockClassroomRepository.findOne.mockResolvedValue({ id: '123', code: 'A-101' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('debería devolver un aula si existe', async () => {
      const classroom = { id: '123', code: 'A-101' };
      mockClassroomRepository.findOne.mockResolvedValue(classroom);

      const result = await service.findOne('123');
      expect(result).toEqual(classroom);
    });

    it('debería lanzar NotFoundException si el aula no existe', async () => {
      mockClassroomRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});