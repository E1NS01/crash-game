import { Injectable, Logger } from '@nestjs/common';
import { Bet, BetParticipant } from '@prisma/client';
import * as crypto from 'crypto';
import { Multiplier } from 'src/interfaces/multiplier';
import {
  BetAmountTooHighError,
  BetAmountTooLowError,
  InvalidBetAmountError,
  InvalidClientMultiplierError,
  InvalidMultiplierError,
} from '../../common/errors/crashErrors';
import { CrashEventEmitter } from '../crash.eventEmitter';
import { CrashDBService } from '../service/crashDB.service';
import validatePlaceBetInput from '../../dto/PlaceBetDto';
import validateTakeProfitInput from '../../dto/TakeProfitDto';

/**
 * CrashService
 *
 * This service manages the core functionality of the Crash game. A game of Crash is a simple game where a multiplier increases over time.
 *
 * Key responsibilities:
 * - Initializing a new game loop
 * - Starting and stopping the multiplier increase
 * - Delaying the next game
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
  private multiplier: number = 1.0;
  private updateFrequency: number = 60;
  private multiplierIncrease: number = Math.pow(
    parseFloat(process.env.INCREASE_PER_SECOND),
    1 / this.updateFrequency,
  );
  private running: boolean = false;
  private crashValue: number;
  private crashHash: string;
  private oldCrashValue: number;
  private oldCrashHash: string;
  private multiplierInterval: NodeJS.Timeout | null = null;
  private game: Bet | null;

  constructor(
    private crashEventEmitter: CrashEventEmitter,
    private crashDBService: CrashDBService,
  ) {}
  private logger: Logger = new Logger('CrashService');

  /**
   * Initializes a new Crash game
   * It initializes a new Crash game by generating a new hash and multiplier,
   * or by using the last game's hash.
   * Then it starts the game loop by calling the delayBetweenGames function.
   */
  async initGame(): Promise<void> {
    const lastGame = await this.crashDBService.getLastGame();
    if (!lastGame) {
      const startHash = this.getHash();
      const startData = this.getMultiplier(startHash);
      this.crashValue = startData.multiplier;
      this.crashHash = startData.hash;
    } else {
      const startData = this.getMultiplier(lastGame.hash);
      this.crashValue = startData.multiplier;
      this.crashHash = startData.hash;
    }
    this.delayBetweenGames();
  }
  /**
   * Starts increasing the multiplier
   *
   * While the game is running this triggers the multiplier to increase by 0.3% every frame (60fps) and emits the new multiplier to the clients.
   * Once it reaches the crash value it stops the multiplier from increasing and deactivates the game.
   * It will then proceed to emit the crash event to the clients.
   *
   * @returns {void}
   */
  startIncreasingMultiplier(): void {
    this.running = true;
    this.multiplierInterval = setInterval(async () => {
      if (!this.running) {
        return;
      }
      this.multiplier *= this.multiplierIncrease;
      if (this.multiplier >= this.crashValue) {
        this.stopIncreasingMultiplier();
        await this.crashDBService.deactivateGame(this.game.id);
        this.crashEventEmitter.sendCrashEvent(
          this.oldCrashValue,
          this.oldCrashHash,
        );
        return;
      }
      this.crashEventEmitter.sendMultiplierEvent(this.multiplier);
    }, 1000 / this.updateFrequency);
  }

  /**
   * Stops the multiplier from increasing
   *
   * This function stops the multiplier from increasing and sets the gamestate to not running.
   * Then it resets the multiplier to 1.0 and sets the old crash value and hash to the current values.
   * Finally, it generates a new crash value and hash and delays the next game.
   *
   * @returns {void}
   */
  stopIncreasingMultiplier(): void {
    if (this.multiplierInterval) {
      clearInterval(this.multiplierInterval);
    }
    this.running = false;
    this.multiplier = 1.0;
    this.oldCrashValue = this.crashValue;
    this.oldCrashHash = this.crashHash;
    this.crashHash = this.getHash(this.oldCrashHash);
    this.crashValue = this.getMultiplier(this.crashHash).multiplier;
    this.delayBetweenGames();
  }

  /**
   * Delays the next game
   *
   * This function delays the next game by 5 seconds and then generates a new game.
   *
   * @returns {void}
   */
  async delayBetweenGames(): Promise<void> {
    this.game = await this.crashDBService.newGame(
      this.crashHash,
      this.crashValue,
    );
    this.crashEventEmitter.sendNewGameEvent(this.game.id);
    setTimeout(() => {
      this.startIncreasingMultiplier();
    }, 5000);
  }
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
   * Places a bet on a Crash game
   * Validates the input and places calls the placeBetTransaction function to place the bet.
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
        throw new BetAmountTooLowError(amount, minAmount);
      }
      if (Math.floor((amount * 100) / 100) !== amount) {
        throw new InvalidBetAmountError(amount);
      }

      return await this.crashDBService.placeBetTransaction(
        amount,
        userId,
        gameId,
      );
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  /**
   * Takes profit from a Crash game
   *
   * Validates the input and calls the takeProfitTransaction function to update the BetParticipant and User balance.
   * If the multiplier is higher than the current game multiplier, it throws an error.
   *
   * @param {number} betId The ID of the BetParticipant entry.
   * @param {number} multiplier The current multiplier for the game.
   * @returns {Promise<BetParticipant>} The updated BetParticipant object.
   */
  async takeProfit(betId: number, multiplier: number): Promise<BetParticipant> {
    try {
      validateTakeProfitInput({ betId, multiplier });

      if (multiplier > this.multiplier) {
        throw new InvalidClientMultiplierError(multiplier);
      }

      return await this.crashDBService.takeProfitTransaction(betId, multiplier);
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }
}
