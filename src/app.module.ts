import { Module } from '@nestjs/common';
import { appConfig } from './config/app.config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthCheckModule } from './health-check/health-check.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot(appConfig.database.mongodbUri),
    HealthCheckModule,
    UsersModule,
  ],
})
export class AppModule {}
