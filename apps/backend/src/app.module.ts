import { Module } from '@nestjs/common';
import { CrashGateway } from './crash/crash.gateway';
import { CrashService } from './crash/service/crash.service';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { UserService } from './user/service/user.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CrashEventEmitter } from './crash/crash.eventEmitter';
import { CrashDBService } from './crash/service/crashDB.service';

@Module({
  imports: [
    UserModule,
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  controllers: [],
  providers: [
    CrashGateway,
    CrashService,
    CrashDBService,
    PrismaService,
    UserService,
    CrashEventEmitter,
  ],
})
export class AppModule {}
