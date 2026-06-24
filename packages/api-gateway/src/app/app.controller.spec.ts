import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  // Creamos un mensajero de red falso
  const mockClientProxy = {
    send: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve() }),
    emit: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve() }),
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        // Inyectamos los tokens de tus 4 microservicios
        { provide: 'AUTH_SERVICE', useValue: mockClientProxy },
        { provide: 'PROGRAM_SERVICE', useValue: mockClientProxy },
        { provide: 'ENROLLMENT_SERVICE', useValue: mockClientProxy },
        { provide: 'SUBJECT_SERVICE', useValue: mockClientProxy },
      ],
    }).compile();
  });

  describe('Controlador del API Gateway', () => {
    it('debería compilar y estar definido correctamente', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController).toBeDefined();
    });
  });
});