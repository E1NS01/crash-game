import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { CrashService } from './crash.service';
import { Bet } from '@prisma/client';
import { UserService } from 'src/user/user.service';
/**
 * CrashGateway
 *
 * This WebSocket Gateway manages the real-time communication for the Crash game.
 * It handles the connection and disconnection of clients, the broadcasting of game state updates
 * and bet-related events.
 *
 * Key responsibilities:
 * - Managing WebSocket connections and disconnections
 * - Processing player bets and profit-taking actions
 * - Emitting real-time updates to connected clients
 *
 * The gateway uses SOcket.IO for WebSocket communication and interacts with the CrashService to manage
 * gamelogic and database operations.
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Change to frontend domain for production
  },
})
export class CrashGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('CrashGateway');
  private connectedClients: number = 0;

  private multiplier: number = 1;
  private multiplierInterval: NodeJS.Timer | null = null;
  private running: boolean = true;

  private oldCrashValue = 1;
  private crashValue: number;

  private crashHash: string;
  private oldCrashHash: string;

  private game: Bet | null;

  constructor(
    private crashService: CrashService,
    private userService: UserService,
  ) {}

  /**
   * Initializes the WebSocket
   * This initializes the WebSocket and sets the crash value and hash to the last games' values.
   * If there is no last game, it generates a new game with a new hash and multiplier.
   *
   * For testing purposes, it creates a new user if there no user with the id 1.
   *
   * @returns {Promise<void>}
   */
  async afterInit() {
    this.logger.log('WebSocket initialized');
    const user = await this.userService.getUserById(1);
    if (!user) {
      await this.userService.createUser();
    }
    const lastGame = await this.crashService.getLastGame();
    if (!lastGame) {
      const startHash = this.crashService.getHash();
      const startData = this.crashService.getMultiplier(startHash);

      this.crashValue = startData.multiplier;
      this.crashHash = startData.hash;
    } else {
      const startData = this.crashService.getMultiplier(lastGame.hash);
      this.crashValue = startData.multiplier;
      this.crashHash = startData.hash;
    }
    this.delayBetweenGames();
  }

  /**
   * Handles a new connection
   *
   * This function handles a new connection and increments the connected clients count.
   * It then emits 'connectedClients' to the clients with the new count.
   * @returns {void}
   */
  handleConnection() {
    this.connectedClients++;
    this.server.emit('connectedClients', this.connectedClients);
  }
  /**
   * Handles a disconnection event
   *
   * This function handles a disconnection and decrements the connected clients count.
   * It then emits 'connectedClients' to the clients with the new count.
   * @returns {void}
   */
  handleDisconnect() {
    this.connectedClients--;
    this.server.emit('connectedClients', this.connectedClients);
  }

  /**
   * Handles a new connection
   *
   * This function handles a new connection and increments the connected clients count.
   * It then emits 'connectedClients' to the clients with the new count.
   * @returns {void}
   */
  @SubscribeMessage('getConnectedClients')
  handleGetConnectedClients(client: Socket): void {
    client.emit('connectedClients', this.connectedClients);
  }

  @SubscribeMessage('placeBet')
  async handleNewBet(
    client: Socket,
    data: { betAmount: number; gameId: number },
  ): Promise<void> {
    this.logger.log(`New bet: ${data.gameId} - ${data.betAmount}`);
    const bet = await this.crashService.placeBet(
      data.betAmount,
      1,
      data.gameId,
    );
    client.emit('betPlaced', bet);
  }

  @SubscribeMessage('takeProfit')
  async handleTakeProfit(
    client: Socket,
    data: { multiplier: number; betId: number },
  ): Promise<void> {
    this.logger.log(`Taking profit: ${data.betId} - ${data.multiplier}`);
    const bet = await this.crashService.takeProfit(data.betId, data.multiplier);
    client.emit('profitTaken', bet);
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
      if (!this.running) return;
      this.multiplier *= 1.003;
      if (this.multiplier >= this.crashValue) {
        this.stopIncreasingMultiplier();
        await this.crashService.deactivateGame(this.game.id);
        this.server.emit('crash', this.oldCrashValue, this.oldCrashHash);
        return;
      }
      this.server.emit('multiUpdate', this.multiplier);
    }, 1000 / 60);
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
    clearInterval(this.multiplierInterval as unknown as number);
    this.logger.log('Game Ended!');
    this.running = false;
    this.multiplier = 1.0;
    this.oldCrashValue = this.crashValue;
    this.oldCrashHash = this.crashHash;
    this.crashHash = this.crashService.getHash(this.oldCrashHash);
    this.crashValue = this.crashService.getMultiplier(
      this.crashHash,
    ).multiplier;
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
    this.game = await this.crashService.newGame(
      this.crashHash,
      this.crashValue,
    );
    this.logger.log(this.game.id);
    this.server.emit('newGame', this.game.id);
    setTimeout(async () => {
      this.startIncreasingMultiplier();
    }, 5000);
  }
}
