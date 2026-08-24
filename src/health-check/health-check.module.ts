import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';
import { HealthCheckService } from './health-check.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule],
  controllers: [HealthCheckController],
  providers: [HealthCheckService],
})
export class HealthCheckModule {}
