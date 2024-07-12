import { Module } from '@nestjs/common';
import { CrashGateway } from './crash/crash.gateway';
import { CrashService } from './crash/crash.service';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';

import { UserService } from './user/user.service';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [CrashGateway, CrashService, PrismaService, UserService],
})
export class AppModule {}
