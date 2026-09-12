import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class MockAuthGuard {},
}));

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {
    sign = jest.fn();
  },
}));

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'validateUser' | 'login'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should validate credentials and return a token on login', async () => {
    const user = { _id: '123', email: 'test@example.com' };
    authService.validateUser.mockResolvedValue(user as any);
    authService.login.mockReturnValue({ access_token: 'jwt-token' } as any);

    const result = await controller.loginUser({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(authService.validateUser).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
    );
    expect(authService.login).toHaveBeenCalledWith(user);
    expect(result).toEqual({ access_token: 'jwt-token' });
  });

  it('should throw UnauthorizedException when no user is returned', async () => {
    authService.validateUser.mockResolvedValue(null as any);

    await expect(
      controller.loginUser({
        email: 'test@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return the authenticated user from request', () => {
    const user = { _id: '123', email: 'test@example.com' };
    const request = { user } as any;

    expect(controller.getMe(request)).toEqual(user);
  });
});
