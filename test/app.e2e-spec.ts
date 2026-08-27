import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// Supertest exports a CommonJS callable, so use its TypeScript-compatible import form.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import request = require('supertest');
import { App } from 'supertest/types';
import { HealthCheckController } from './../src/health-check/health-check.controller';
import { HealthCheckService } from './../src/health-check/health-check.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { checkMongoHealth: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health-check (GET)', () => {
    return request(app.getHttpServer())
      .get('/health-check')
      .expect(200)
      .expect({ status: 'ok' });
  });

  afterEach(async () => {
    await app.close();
  });
});
