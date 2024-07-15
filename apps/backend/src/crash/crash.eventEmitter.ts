import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * CrashEventEmitter
 *
 * This service emits events to the EventListener
 *
 * Key responsibilities:
 * - Sending a multiplier event
 * - Sending a crash event
 * - Sending a new game event
 *
 * The service uses the EventEmitter2 to emit events to the EventListener.
 */

@Injectable()
export class CrashEventEmitter {
  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Sends a mulitplier event
   * This function sends a multiplier event to the EventListener
   * @param {number} multiplier - The multiplier of the current game
   */
  sendMultiplierEvent(multiplier: number): void {
    this.eventEmitter.emit('multiplier', multiplier);
  }

  /**
   * Sends a crash event
   * This function sends a crash event to the EventListener
   * @param {number} crashValue - The crash value of the current game
   * @param {string} crashHash  - The crash hash of the current game
   */
  sendCrashEvent(crashValue: number, crashHash: string): void {
    this.eventEmitter.emit('crash', crashValue, crashHash);
  }
  /**
   * Sends a new game event
   * This function sends a new game event to the EventListener
   * @param {number} gameId - The id of the new game
   */
  sendNewGameEvent(gameId: number): void {
    this.eventEmitter.emit('newGame', gameId);
  }
}
