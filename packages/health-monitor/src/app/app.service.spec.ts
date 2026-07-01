import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
    
    // Nos aseguramos de restaurar cualquier mock del fetch global antes de cada prueba
    jest.restoreAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('checkAllServices', () => {
    it('debería retornar el estado UP si las peticiones HTTP son exitosas', async () => {
      // Simulamos que el fetch global responde siempre de forma correcta
      const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
      } as Response);

      const results = await service.checkAllServices();

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      
      // Verificamos que el primer elemento tenga la estructura e indicador esperados
      expect(results[0]).toEqual({
        name: 'API Gateway',
        status: 'UP',
        code: 200,
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('debería retornar el estado DOWN si una petición HTTP falla o lanza un error', async () => {
      // Simulamos un fallo de red masivo (un timeout o conexión rechazada)
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));

      const results = await service.checkAllServices();

      // Verificamos que el servicio capture el error de forma segura sin romper la app
      expect(results[0]).toEqual({
        name: 'API Gateway',
        status: 'DOWN',
        code: 500,
      });
    });
  });
});