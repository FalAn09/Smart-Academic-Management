import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  const mockClientProxy = {
    send: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve() }),
    emit: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve() }),
  };

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        // Repetimos la inyección por si el servicio hace las llamadas
        { provide: 'AUTH_SERVICE', useValue: mockClientProxy },
        { provide: 'PROGRAM_SERVICE', useValue: mockClientProxy },
        { provide: 'ENROLLMENT_SERVICE', useValue: mockClientProxy },
        { provide: 'SUBJECT_SERVICE', useValue: mockClientProxy },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  it('debería estar definido el servicio del Gateway', () => {
    expect(service).toBeDefined();
  });
});