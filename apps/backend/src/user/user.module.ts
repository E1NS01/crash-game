import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './service/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
  imports: [],
})
export class UserModule {}
