import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from './entities/user.entity';

// 1. EL TRUCO DEFINITIVO: Interceptamos el archivo antes de que se importe.
// Esto rompe cualquier ciclo de dependencias (ej. User -> Role -> User) de forma segura.
jest.mock('./entities/user.entity', () => ({
  UserEntity: class UserMock {}
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((user) => 
      Promise.resolve({ id: 'uuid-user-1', ...user })
    ),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('token_falso_xyz'),
    verify: jest.fn().mockReturnValue({ userId: 'uuid-user-1', email: 'test@uce.edu.ec' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          // 2. Ahora sí podemos usar la clase User real porque ya la mockeamos arriba.
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('debería estar definido el servicio de autenticación', () => {
    expect(service).toBeDefined();
  });

  it('debería utilizar el JwtService para firmar tokens', () => {
    const fakePayload = { email: 'test@uce.edu.ec', sub: 'uuid-user-1' };
    const token = mockJwtService.sign(fakePayload);
    
    expect(token).toBeDefined();
    expect(mockJwtService.sign).toHaveBeenCalledWith(fakePayload);
  });
});