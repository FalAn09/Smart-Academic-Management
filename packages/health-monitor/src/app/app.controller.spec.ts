import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  // Creamos un objeto simulado (Mock) del servicio
  const mockAppService = {
    checkAllServices: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debería generar una página HTML válida con la información de los servicios', async () => {
    const mockData = [
      { name: 'API Gateway', status: 'UP', code: 200 },
      { name: 'Auth Service', status: 'DOWN', code: 500 },
    ];
    
    mockAppService.checkAllServices.mockResolvedValue(mockData);

    const htmlResult = await controller.getDashboard();

    // Verificaciones sobre el contenido del HTML generado
    expect(typeof htmlResult).toBe('string');
    expect(htmlResult).toContain('SMART CAMPUS UCE');
    expect(htmlResult).toContain('🟢 UP');
    expect(htmlResult).toContain('🔴 DOWN');
    expect(service.checkAllServices).toHaveBeenCalled();
  });
});