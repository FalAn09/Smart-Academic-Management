import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';

describe('ClassroomController', () => {
  let controller: ClassroomController;
  let service: ClassroomService;

  // Creamos un Mock del Servicio
  const mockClassroomService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassroomController],
      providers: [
        {
          provide: ClassroomService,
          useValue: mockClassroomService, // Inyectamos el mock del servicio
        },
      ],
    }).compile();

    controller = module.get<ClassroomController>(ClassroomController);
    service = module.get<ClassroomService>(ClassroomService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debería llamar al método create del servicio', async () => {
    const createDto = { code: 'A-200', capacity: 40, type: 'LABORATORIO' as any };
    mockClassroomService.create.mockResolvedValue({ id: '1', ...createDto });

    const result = await controller.create(createDto);

    expect(result).toEqual({ id: '1', ...createDto });
    expect(service.create).toHaveBeenCalledWith(createDto);
  });

  it('debería llamar al método findAll del servicio', async () => {
    const expectedAulas = [{ id: '1', code: 'A-101' }];
    mockClassroomService.findAll.mockResolvedValue(expectedAulas);

    const result = await controller.findAll();

    expect(result).toEqual(expectedAulas);
    expect(service.findAll).toHaveBeenCalled();
  });
});