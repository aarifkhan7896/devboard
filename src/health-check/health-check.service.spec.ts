import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { HealthCheckService } from './health-check.service';

describe('HealthCheckService', () => {
  let service: HealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckService,
        {
          provide: getConnectionToken(),
          useValue: { readyState: 1 },
        },
      ],
    }).compile();

    service = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
