import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { responseMessages } from '../common/response-info';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userModel: {
    findOne: jest.Mock;
    create: jest.Mock;
    findById: jest.Mock;
    deleteOne: jest.Mock;
    aggregate: jest.Mock;
    findByIdAndUpdate: jest.Mock;
  };

  beforeEach(async () => {
    userModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      deleteOne: jest.fn(),
      aggregate: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: userModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user and hash the password', async () => {
    const userData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password123',
    };

    userModel.findOne.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    userModel.create.mockResolvedValue({
      _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    });

    const result = await service.createUser(userData);

    expect(bcrypt.hash).toHaveBeenCalledWith(
      userData.password,
      expect.any(Number),
    );
    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Jane',
        email: 'jane@example.com',
        password: 'hashed-password',
      }),
    );
    expect(result).toEqual({
      userId: '507f1f77bcf86cd799439011',
      message: responseMessages.userCreatedSuccessfully,
    });
  });

  it('should throw conflict when email already exists', async () => {
    userModel.findOne.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue({ email: 'jane@example.com' }),
      }),
    });

    await expect(
      service.createUser({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'Password123',
      }),
    ).rejects.toThrow(
      new HttpException(
        responseMessages.emailAlreadyExists,
        HttpStatus.CONFLICT,
      ),
    );
  });

  it('should return a user by id', async () => {
    const user = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      active: true,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    userModel.findById.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(user),
      }),
    });

    await expect(
      service.getUserById('507f1f77bcf86cd799439011'),
    ).resolves.toEqual(user);
    expect(userModel.findById).toHaveBeenCalledWith(
      new Types.ObjectId('507f1f77bcf86cd799439011'),
      expect.objectContaining({
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        active: 1,
        createdAt: 1,
      }),
    );
  });

  it('should throw not found when user does not exist', async () => {
    userModel.findById.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      service.getUserById('507f1f77bcf86cd799439011'),
    ).rejects.toThrow(
      new HttpException(responseMessages.userNotFound, HttpStatus.NOT_FOUND),
    );
  });

  it('should delete user by id', async () => {
    userModel.deleteOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    });

    await expect(
      service.deleteUserById('507f1f77bcf86cd799439011'),
    ).resolves.toEqual({
      count: 1,
      message: responseMessages.userDeletedSuccessfully,
    });
  });

  it('should return paginated users', async () => {
    userModel.aggregate.mockResolvedValue([
      {
        data: [
          {
            _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            active: true,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
          },
        ],
        total: [{ count: 1 }],
      },
    ]);

    await expect(
      service.getUsers({ page: 1, limit: 10 }, '-createdAt'),
    ).resolves.toEqual({
      entities: [
        {
          _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          active: true,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
        },
      ],
      metadata: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it('should update a user and rehash the password when provided', async () => {
    const userId = '507f1f77bcf86cd799439011';

    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    userModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(userId),
      }),
    });

    const result = await service.updateUserDetails(userId, {
      email: 'updated@example.com',
      password: 'NewPassword123',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(
      'NewPassword123',
      expect.any(Number),
    );
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      new Types.ObjectId(userId),
      {
        $set: {
          email: 'updated@example.com',
          password: 'new-hash',
        },
      },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    );
    expect(result).toEqual({
      userId,
      message: responseMessages.userDetailsUpdatedSuccessfully,
    });
  });
});
