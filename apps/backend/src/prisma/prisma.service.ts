import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { BetParticipant, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger = new Logger('PrismaService');
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

  async createUser() {}
  async createBet() {}

  /**
   * Creates a new BetParticipant entry in the Database
   *
   * This function creates a new BetParticipant entry in the Database with the provided amount, gameId, and userId.
   *
   * @param amount - the amount the user wants to bet
   * @param gameId - the id of the game the user wants to bet on
   * @param userId - the id of the user placing the bet
   * @returns {Promise<BetParticipant>} - the created BetParticipant object
   */
  async createBetParticipant(
    amount: number,
    gameId: number,
    userId: number,
  ): Promise<BetParticipant> {
    try {
      return await this.betParticipant.create({
        data: {
          amount,
          user: {
            connect: {
              id: userId,
            },
          },
          bet: {
            connect: {
              id: gameId,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
