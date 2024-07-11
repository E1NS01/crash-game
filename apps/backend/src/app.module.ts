import { Module } from '@nestjs/common';
import { CrashGateway } from './crash/crash.gateway';
import { CrashService } from './crash/crash.service';
import { PrismaService } from './prisma/prisma.service';

import { GameDatabaseService } from './database/game-database/game-database.service';
import { UserDatabaseService } from './database/user-database/user-database.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    CrashGateway,
    CrashService,
    PrismaService,
    GameDatabaseService,
    UserDatabaseService,
  ],
})
export class AppModule {}
