import { Module } from '@nestjs/common';
import { CrashGateway } from './crash/crash.gateway';
import { CrashService } from './crash/crash.service';
import { PrismaService } from './prisma/prisma.service';
import { GameDatabaseService } from './database/game-database/game-database.service';
import { UserDatabaseService } from './database/user-database/user-database.service';
import { UserModule } from './user/user.module';

import { UserService } from './user/user.service';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [
    CrashGateway,
    CrashService,
    PrismaService,
    GameDatabaseService,
    UserDatabaseService,
    UserService,
  ],
})
export class AppModule {}
