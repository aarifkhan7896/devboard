import { Module } from '@nestjs/common';
import { appConfig } from './config/app.config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthCheckModule } from './health-check/health-check.module';

@Module({
  imports: [MongooseModule.forRoot(appConfig.database.mongodbUri), HealthCheckModule],
})
export class AppModule {}
