import { Module } from '@nestjs/common';
import { appConfig } from './config/app.config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot(appConfig.database.mongodbUri)],
})
export class AppModule {}
