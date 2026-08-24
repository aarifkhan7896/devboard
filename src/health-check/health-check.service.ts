import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthCheckService {
  constructor(
    @InjectConnection()
    private readonly mongoConnection: Connection,
  ) {}

  async checkMongoHealth(): Promise<{ status: string }> {
    const isHealthy = this.mongoConnection.readyState === 1;

    return {
      status: isHealthy ? 'ok' : 'error',
    };
  }
}
