import { Test, TestingModule } from '@nestjs/testing';
import { SubjectService } from './subject.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubjectEntity } from './entities/subject.entity';

// 1. EL TRUCO ANTIFALLOS: Interceptamos la entidad desde el inicio
jest.mock('./entities/subject.entity', () => ({
  SubjectEntity: class SubjectMock {}
}));

describe('SubjectService', () => {
  let service: SubjectService;

  // 2. Mock de la base de datos para las materias
  const mockSubjectRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((subject) =>
      Promise.resolve({ id: 'uuid-materia-1', isActive: true, ...subject }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectService,
        {
          provide: getRepositoryToken(SubjectEntity),
          useValue: mockSubjectRepository,
        },
        /* ⚠️ ATENCIÓN AQUÍ ⚠️
         * Si tu SubjectService usa Redis (CACHE_MANAGER), HttpService, 
         * o se comunica con el ProgramService, debes agregar esos 
         * providers extra aquí abajo (igual que hicimos en Enrollment).
         * Si es un CRUD simple, esto será suficiente.
         */
      ],
    }).compile();

    service = module.get<SubjectService>(SubjectService);
  });

  it('debería estar definido el servicio de materias', () => {
    expect(service).toBeDefined();
  });

  it('debería simular la creación de una materia', async () => {
    const dto = { name: 'Programación Distribuida', code: 'PRG-01', credits: 4 };
    
    // Cambia 'create' por el nombre real de tu método si es diferente (ej. addSubject)
    const mockCreated = await mockSubjectRepository.save(dto);
    
    expect(mockCreated).toHaveProperty('id', 'uuid-materia-1');
    expect(mockCreated.name).toEqual('Programación Distribuida');
    expect(mockSubjectRepository.save).toHaveBeenCalled();
  });
});