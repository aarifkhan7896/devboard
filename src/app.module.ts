import { Module } from '@nestjs/common';
import { appConfig } from './config/app.config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthCheckModule } from './health-check/health-check.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
  imports: [
    MongooseModule.forRoot(appConfig.database.mongodbUri),
    HealthCheckModule,
    UsersModule,
    AuthModule,
    OrganizationsModule,
  ],
})
export class AppModule {}
