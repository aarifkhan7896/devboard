import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { responseMessages } from '../common/response-info';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let organizationModel: {
    create: jest.Mock;
    findById: jest.Mock;
  };
  let membershipModel: {
    create: jest.Mock;
    aggregate: jest.Mock;
  };

  beforeEach(async () => {
    organizationModel = {
      create: jest.fn(),
      findById: jest.fn(),
    };

    membershipModel = {
      create: jest.fn(),
      aggregate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getModelToken('Organization'),
          useValue: organizationModel,
        },
        {
          provide: getModelToken('Membership'),
          useValue: membershipModel,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an organization and membership for the user', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const createdOrganization = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'DevBoard',
      slug: 'devboard',
      description: 'Engineering workspace',
    };

    organizationModel.create.mockResolvedValue(createdOrganization);
    membershipModel.create.mockResolvedValue({
      userId: new Types.ObjectId(userId),
      organizationId: createdOrganization._id,
      role: 'admin',
    });

    const result = await service.createOrganization(
      {
        name: 'DevBoard',
        slug: 'devboard',
        description: 'Engineering workspace',
      },
      userId,
    );

    expect(organizationModel.create).toHaveBeenCalledWith({
      name: 'DevBoard',
      slug: 'devboard',
      description: 'Engineering workspace',
    });
    expect(membershipModel.create).toHaveBeenCalledWith({
      userId: new Types.ObjectId(userId),
      organizationId: createdOrganization._id,
      role: 'admin',
    });
    expect(result).toEqual(createdOrganization);
  });

  it('should find an organization by id', async () => {
    const org = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'DevBoard',
      slug: 'devboard',
      description: 'Engineering workspace',
    };

    organizationModel.findById.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(org),
      }),
    });

    await expect(
      service.findOrganizationById('507f1f77bcf86cd799439012'),
    ).resolves.toEqual(org);
  });

  it('should throw not found when organization is missing', async () => {
    organizationModel.findById.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      service.findOrganizationById('507f1f77bcf86cd799439012'),
    ).rejects.toThrow(
      new HttpException(responseMessages.noRecordFound, HttpStatus.NOT_FOUND),
    );
  });

  it('should return a paginated list of user organizations', async () => {
    const orgId = new Types.ObjectId('507f1f77bcf86cd799439012');

    membershipModel.aggregate.mockResolvedValue([
      {
        data: [
          {
            _id: orgId,
            name: 'DevBoard',
            slug: 'devboard',
            description: 'Engineering workspace',
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-02T00:00:00.000Z'),
          },
        ],
        total: [{ count: 1 }],
      },
    ]);

    await expect(
      service.findUserOrganizations(
        { page: 1, limit: 10 },
        '507f1f77bcf86cd799439011',
      ),
    ).resolves.toEqual({
      entities: [
        {
          _id: orgId,
          name: 'DevBoard',
          slug: 'devboard',
          description: 'Engineering workspace',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
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

  it('should throw not found when aggregation returns no membership data', async () => {
    membershipModel.aggregate.mockResolvedValue([null]);

    await expect(
      service.findUserOrganizations(
        { page: 1, limit: 10 },
        '507f1f77bcf86cd799439011',
      ),
    ).rejects.toThrow(
      new HttpException(responseMessages.noRecordFound, HttpStatus.NOT_FOUND),
    );
  });
});
