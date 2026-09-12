import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {
    sign = jest.fn();
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: {
    findOne: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    userModel = {
      findOne: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: userModel },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate a user and strip the password before returning it', async () => {
    const user = {
      _id: '123',
      email: 'test@example.com',
      password: 'hashed-password',
    };

    userModel.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser(
      'test@example.com',
      'password123',
    );

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
    expect(result).toEqual({
      _id: '123',
      email: 'test@example.com',
      password: undefined,
    });
  });

  it('should throw an error when the user does not exist', async () => {
    userModel.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.validateUser('missing@example.com', 'password123'),
    ).rejects.toThrow(
      new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST),
    );
  });

  it('should generate a JWT access token for a valid user', async () => {
    jwtService.sign.mockReturnValue('jwt-token');

    const result = await service.login({
      _id: '123',
      email: 'test@example.com',
    });

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: '123',
      email: 'test@example.com',
    });
    expect(result).toEqual({ access_token: 'jwt-token' });
  });
});
