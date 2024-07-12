import { Injectable, Logger } from '@nestjs/common';
import { Bet, BetParticipant } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Multiplier } from 'src/crash/interfaces/multiplier';
import { GameDto } from './dto/CrashGameDto';
import {
  BetAmountTooHighError,
  BetNotFoundError,
  GameNotActiveError,
  InvalidBetAmountError,
  InvalidMultiplierError,
  MultipleBetsError,
  UserAlreadyProfitedError,
} from './errors/crashErrors';
import { validatePlaceBetInput } from './dto/PlaceBetDto';
import validateTakeProfitInput from './dto/TakeProfitDto';

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
   *
   * Formula explanation:
   * 1. e = 2^52 (a large constant to ensure precision)
   * 2. h = first 13 characters of the hash converted to an integer
   * 3. If h % 33 === 0, return 1.0 as the multiplier (instant crash in 1/33 cases - value can be modified to the desired house edge)
   * 4. Otherwise, calculate: multiplier = (100 * e - h) / (e - h)
   * 5. Return the multiplier rounded to 2 decimal places (for human readability)
   *
   * Key properties:
   * - Multiplier is always between 1.0 and theoreticaly infinity
   * - Lower multipliers are more common, higher multipliers are rarer
   * - The distribution is fair and unpredictable based on the input hash
   *
   */
  getMultiplier(hash: string, retries = 3): Multiplier {
    try {
      const houseEdge = 33;
      const e = Math.pow(2, 52);
      const h = parseInt(hash.slice(0, 13), 16);
      if (h % houseEdge === 0) return { multiplier: 1.0, hash };

      const multiplier = parseFloat(
        ((100 * e - h) / (e - h) / 100.0).toFixed(2),
      );
      if (multiplier < 1.0) {
        throw new InvalidMultiplierError(multiplier);
      }
      return { multiplier, hash };
    } catch (error) {
      if (retries > 0) {
        return this.getMultiplier(hash, retries - 1);
      }
    }
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
  async placeBet(
    amount: number,
    userId: number,
    gameId: number,
  ): Promise<BetParticipant> {
    try {
      validatePlaceBetInput({ amount, userId, gameId });
      const minAmount = 1;
      const maxAmount = 10000;

      if (amount > maxAmount) {
        throw new BetAmountTooHighError(amount, maxAmount);
      }
      if (amount < minAmount) {
        throw new BetAmountTooHighError(amount, minAmount);
      }
      if (Math.floor((amount * 100) / 100) !== amount) {
        throw new InvalidBetAmountError(amount);
      }

      return await this.prisma.$transaction(async (prisma) => {
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
  async takeProfit(betId: number, multiplier: number): Promise<BetParticipant> {
    try {
      validateTakeProfitInput({ betId, multiplier });
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
