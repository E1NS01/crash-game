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
import { UserService } from '../user/user.service';
import { TakeProfitData } from './interfaces/takeProfitData';
import { PlaceBetData } from './interfaces/placeBetData';
import { OnEvent } from '@nestjs/event-emitter';
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
 * The gateway uses Socket.IO for WebSocket communication and interacts with the CrashService to manage
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

  constructor(
    private crashService: CrashService,
    private userService: UserService,
  ) {}

  /**
   * Initializes the WebSocket
   * This initializes the WebSocket and starts the first game.
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
    this.crashService.initGame();
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
   * Sends the connected clients count to the client
   *
   * This function sends the connected clients count to the client that requested it.
   * @param {Socket} client - The client that requested the connected clients count
   * @returns {void}
   */
  @SubscribeMessage('getConnectedClients')
  handleGetConnectedClients(client: Socket): void {
    client.emit('connectedClients', this.connectedClients);
  }

  /**
   * Handles the 'placeBet' event
   *
   * This function handles the 'placeBet' event and places a bet for the client.
   * It then emits 'betPlaced' to the client with the bet data.
   * @param {Socket} client - The client that placed the bet
   * @param {PlaceBetData} data - The data of the bet
   * @returns {void}
   */
  @SubscribeMessage('placeBet')
  async handleNewBet(client: Socket, data: PlaceBetData): Promise<void> {
    this.logger.log(`New bet: ${data.gameId} - ${data.betAmount}`);
    const bet = await this.crashService.placeBet(
      data.betAmount,
      1,
      data.gameId,
    );
    client.emit('betPlaced', bet);
  }

  /**
   * Handles the 'takeProfit' event
   *
   * This function handles the 'takeProfit' event and takes profit for the client.
   * It then emits 'profitTaken' to the client with the updated bet data.
   * @param {Socket} client
   * @param {TakeProfitData} data
   */
  @SubscribeMessage('takeProfit')
  async handleTakeProfit(client: Socket, data: TakeProfitData): Promise<void> {
    this.logger.log(`Taking profit: ${data.betId} - ${data.multiplier}`);
    const bet = await this.crashService.takeProfit(data.betId, data.multiplier);
    client.emit('profitTaken', bet, data.multiplier);
  }
  /**
   * Handles the 'multiplier' event
   *
   * This function handles the 'multiplier' event and emits the new multiplier to all connected clients.
   * @param {number} multiplier
   */
  @OnEvent('multiplier')
  handleMultiplierEvent(multiplier: number): void {
    this.server.emit('multiUpdate', multiplier);
  }

  /**
   * Handles the 'crash' event
   *
   * This function handles the 'crash' event and emits the crash value and hash to all connected clients.
   * @param {number} crashValue - The crash value
   * @param {string} crashHash - The crash hash
   */
  @OnEvent('crash')
  handleCrashEvent(crashValue: number, crashHash: string): void {
    this.server.emit('crash', crashValue, crashHash);
  }

  /**
   * Handles the 'newGame' event
   *
   * This function handles the 'newGame' event and emits the new game id to all connected clients.
   * @param {number} gameId - The id of the new game
   */
  @OnEvent('newGame')
  handleNewGameEvent(gameId: number): void {
    this.server.emit('newGame', gameId);
  }
}
