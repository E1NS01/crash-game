import { Module } from '@nestjs/common';
import { CrashGateway } from './crash/crash.gateway';
import { CrashService } from './crash/crash.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CrashGateway, CrashService, PrismaService],
})
export class AppModule {}
