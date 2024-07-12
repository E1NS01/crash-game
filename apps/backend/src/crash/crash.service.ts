import { Injectable, Logger } from '@nestjs/common';
import { Bet, BetParticipant } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { Multiplier } from 'src/crash/interfaces/multiplier';
import { GameDto } from './dto/CrashGameDto';

/**
 * CrashService
 *
 * This service manages the core functionality of the Crash game. A game of Crash is a simple game where a multiplier increases over time.
 *
 * Key responsibilities:
 * - Generating game hashes and multipliers
 * - Creating and managing game instance in the Database
 * - Handling player bets and profit-taking
 * - Managing game state (active/inactive)
 *
 * The service uses cryptographic functions to generate provably fair hashes and unpredictable game outcomes,
 * and it interacts with the database through Prisma to persist game data and player actions.
 *
 * Usage:
 * This service should be injected into the CrashGateway or other services that need to interact with the Crash game machanics.
 * It provides methods for all core game operations, from initiating new games to processing player actions.
 */
@Injectable()
export class CrashService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}
  private logger: Logger = new Logger('CrashService');

  /**
   * Generates a  SHA256 hash
   *
   * This function generates a new SHA256 hash. If an 'oldHash' is provided, it generates a new hash based on the 'oldHash'.
   * Otherwise, it generates a new hash using a random byte string.
   *
   * @param {string} oldHash - An optional string representing the old hash from which a new hash will be generated.
   *                           If no old hash is provided, a new hash will be generated from a random byte string.
   *
   * @returns {string}  The generated SHA256 hash as a hexademical string
   */
  getHash(oldHash?: string): string {
    if (!oldHash) {
      const hash = crypto.createHash('sha256');
      const bytes = crypto.randomBytes(Math.ceil(50 / 2)).toString('hex');
      hash.update(bytes);
      return hash.digest('hex');
    }
    const hash = crypto.createHash('sha256').update(oldHash).digest('hex');
    return hash;
  }

  /**
   * Generates a multiplier from a SHA256 hash
   *
   * This function generates a multiplier from a SHA256 hash. The multiplier is calculated by taking the first 13 characters of the hash.
   *
   * @param {string} hash - A SHA256 hash as a hexadecimal string
   *
   * @returns {Multiplier}  The generated multiplier and the hash used to generate it.
   */
  getMultiplier(hash: string): Multiplier {
    const e = Math.pow(2, 52);
    const h = parseInt(hash.slice(0, 13), 16);
    if (h % 33 === 0) return { multiplier: 1.0, hash };

    const multiplier = parseFloat(((100 * e - h) / (e - h) / 100.0).toFixed(2));
    return { multiplier, hash };
  }

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
    const newGame = await this.prisma.bet.create({
      data: {
        hash,
        multiplier,
        game: 'crash',
      },
    });
    return newGame;
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
    const updatedGame = await this.prisma.bet.update({
      where: {
        id: gameId,
      },
      data: {
        active: false,
      },
    });
    return updatedGame;
  }

  /**
   * Gets the last Crash game
   *
   * This function retrieves the last Crash game from the Database.
   *
   * @returns {Promise<Bet | null>} The last Bet object or null if no game is found.
   */
  async getLastGame(): Promise<Bet | null> {
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
  async placeBet(
    amount: number,
    userId: number,
    gameId: number,
  ): Promise<BetParticipant> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        this.logger.log(
          `Placing bet of ${amount} for user ${userId} on game ${gameId}`,
        );
        const bet = await prisma.bet.findUniqueOrThrow({
          where: {
            id: gameId,
          },
        });
        this.logger.log(`Bet found: ${bet}`);
        if (!bet.active) {
          throw new Error('Game is not active');
        }

        await this.userService.updateUserBalance(userId, -amount);

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
  async takeProfit(betId: number, multiplier: number): Promise<BetParticipant> {
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
          throw new Error('Bet not found');
        }
        if (bet.tookProfit) {
          throw new Error('User already took profit');
        }
        if (!bet.bet.active) {
          throw new Error('Game is not active');
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
    }
  }
}
