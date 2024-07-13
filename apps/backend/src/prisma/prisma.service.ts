import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Initializes the Prisma Client
   * This function initializes the Prisma Client and connects to the database.
   *
   * @returns {Promise<void>}
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Destroys the Prisma Client
   * This function disconnects the Prisma Client from the database.
   *
   * @returns {Promise<void>}
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
