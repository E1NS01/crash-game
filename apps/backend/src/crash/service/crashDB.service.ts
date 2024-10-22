import { Injectable, Logger } from '@nestjs/common';
import { Bet, BetParticipant } from '@prisma/client';
import { GameDto } from 'src/dto/CrashGameDto';
import {
  BalanceTooLowError,
  UserNotFoundError,
} from 'src/common/errors/userErrors';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/service/user.service';
import {
  BetNotFoundError,
  GameNotActiveError,
  MultipleBetsError,
  UserAlreadyProfitedError,
} from 'src/common/errors/crashErrors';

/**
 * CrashDBService
 * This service manages the interaction with the Database for the Crash game.
 *
 * Key resposibilities:
 * - Creating a new Crash game entry
 * - Deactivating a Crash game
 * - Getting the last Crash game
 * - Placing a bet on a Crash game
 * - Taking profit from a Crash game
 *
 * The service uses the PrismaService to interact with the Database.
 */
@Injectable()
export class CrashDBService {
  private logger = new Logger('CrashDBService');
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  /**
   * Creates a new Crash game entry in the Database
   *
   * This function creates a new Crash game entry in the Database with the provided hash and multiplier.
   *
   * @param {string} hash A SHA256 hash as a hexadecimal string.
   * @param {number} multiplier The multiplier for the game.
   * @returns {Promise<GameDto>} The created Bet object.
   */
  async newGame(hash: string, multiplier: number): Promise<GameDto> {
    try {
      const newGame = await this.prisma.bet.create({
        data: {
          hash,
          multiplier,
          game: 'crash',
        },
      });
      return newGame;
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  /**
   * Deactivates a Crash game
   *
   * This function deactivates a crash game by setting the 'active' field to false.
   *
   * @param gameId The ID of the game to deactivate.
   * @returns {Promise<Bet>} The updated Bet object.
   */
  async deactivateGame(gameId: number): Promise<Bet> {
    try {
      const updatedGame = await this.prisma.bet.update({
        where: {
          id: gameId,
        },
        data: {
          active: false,
        },
      });
      return updatedGame;
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  /**
   * Gets the last Crash game
   *
   * This function retrieves the last Crash game from the Database.
   *
   * @returns {Promise<Bet | null>} The last Bet object or null if no game is found.
   */
  async getLastGame(): Promise<Bet | null> {
    try {
      const lastGame = await this.prisma.bet.findFirst({
        where: {
          game: 'crash',
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      if (!lastGame) return null;
      return lastGame;
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  /**
   * Places a bet on a Crash game
   *
   * This function places a bet on a Crash game by updating the user's balance and creating a new BetParticipant entry in the Database.
   * It also checks if the game is active before placing the bet and throws an error if the game is not active.
   *
   *
   * @param {number} amount The amount to bet.
   * @param {number} userId The ID of the user placing the bet.
   * @param {number} gameId The ID of the game to bet on.
   * @returns {Promise<BetParticipant>} The created BetParticipant object.
   */
  async placeBetTransaction(
    amount: number,
    userId: number,
    gameId: number,
  ): Promise<BetParticipant> {
    try {
      return this.prisma.$transaction(async (prisma) => {
        const existingBet = await prisma.betParticipant.findFirst({
          where: {
            userId,
            betId: gameId,
          },
        });
        if (existingBet) {
          throw new MultipleBetsError(userId, gameId);
        }
        const bet = await prisma.bet.findUnique({
          where: {
            id: gameId,
          },
        });
        if (!bet) {
          throw new BetNotFoundError(gameId);
        }
        if (!bet.active) {
          throw new GameNotActiveError(gameId);
        }

        const user = await this.userService.getUserById(userId);
        if (!user) {
          throw new UserNotFoundError(userId);
        }
        if (user.balance < amount) {
          throw new BalanceTooLowError(userId, amount, user.balance);
        }

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            balance: { decrement: amount },
          },
        });

        return await prisma.betParticipant.create({
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
      });
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  /**
   * Takes profit from a Crash game
   *
   * This function calculates the final profit for a user and updates the user's balance.
   * It also updates the 'tookProfit' field in the BetParticipant entry.
   * It checks if the game is active before taking profit and throws an error if the game is not active and if the user has already taken profit.
   * The function throws an error if the bet is not active or the user already profited.
   * It returns the updated BetParticipant object.
   *
   * @param {number} betId The ID of the BetParticipant entry.
   * @param {number} multiplier The current multiplier for the game.
   * @returns {Promise<BetParticipant>} The updated BetParticipant object.
   */
  async takeProfitTransaction(
    betId: number,
    multiplier: number,
  ): Promise<BetParticipant> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const bet = await prisma.betParticipant.findUnique({
          where: {
            id: betId,
          },
          include: {
            user: true,
            bet: true,
          },
        });

        if (!bet) {
          throw new BetNotFoundError(betId);
        }
        if (bet.tookProfit) {
          throw new UserAlreadyProfitedError(bet.user.id, bet.id);
        }
        if (!bet.bet.active) {
          throw new GameNotActiveError(bet.bet.id);
        }

        const profit = parseFloat((bet.amount * multiplier).toFixed(2));

        await prisma.user.update({
          where: {
            id: bet.user.id,
          },
          data: {
            balance: {
              increment: profit,
            },
          },
        });

        return await prisma.betParticipant.update({
          where: {
            id: betId,
          },
          data: {
            tookProfit: true,
          },
        });
      });
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }
}
