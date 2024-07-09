import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrashGateway } from './crash/crash.gateway';
import { CrashService } from './crash/crash.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CrashGateway, CrashService],
})
export class AppModule {}
