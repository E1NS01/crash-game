import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CrashGateway } from './crash/crash.gateway';
import { CrashService } from './crash/service/crash.service';
import { CrashDBService } from './crash/service/crashDB.service';
import { PrismaService } from './prisma/prisma.service';
import { UserService } from './user/service/user.service';
import { CrashEventEmitter } from './crash/crash.eventEmitter';

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
