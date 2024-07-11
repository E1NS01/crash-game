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

@WebSocketGateway({
  cors: {
    origin: '*', // Change to frontend domain for production
  },
})
export class CrashGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');
  private connectedClients: number = 0;

  private multiplier: number = 1;
  private multiplierInterval: NodeJS.Timer | null = null;
  private running: boolean = true;

  private oldCrashValue = 1;
  private crashValue: number;

  private crashHash: string;
  private oldCrashHash: string;

  private game: Bet | null;

  constructor(private crashService: CrashService) {}

  async afterInit() {
    this.logger.log('WebSocket initialized');
    const lastGame = await this.crashService.getLastGame();
    if (!lastGame) {
      const startHash = this.crashService.getHash();
      const startData = this.crashService.getMultiplier(startHash);

      this.crashValue = startData.multiplier;
      this.crashHash = startData.hash;

      console.log(this.crashHash, this.crashValue);
    } else {
      const startData = this.crashService.getMultiplier(lastGame.hash);
      this.crashValue = startData.multiplier;
      this.crashHash = startData.hash;
    }
    this.delayBetweenGames();
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients++;
    this.server.emit('connectedClients', this.connectedClients);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients--;
    this.server.emit('connectedClients', this.connectedClients);
  }

  @SubscribeMessage('getConnectedClients')
  handleGetConnectedClients(client: Socket): void {
    this.logger.log('Getting connected clients');
    client.emit('connectedClients', this.connectedClients);
  }

  @SubscribeMessage('newBet')
  handleNewBet(client: Socket, payload: number): void {
    this.logger.log(`New bet: ${payload}`);
    this.server.emit('betPlaced', payload);
  }

  @SubscribeMessage('placeBet')
  handlePlaceBet() {}

  @SubscribeMessage('takeProfit')
  handleTakeProfit() {}

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

  delayBetweenGames(): void {
    setTimeout(async () => {
      this.game = await this.crashService.newGame(
        this.crashHash,
        this.crashValue,
      );
      this.server.emit('newGame', this.game.id);
      this.startIncreasingMultiplier();
    }, 5000);
  }
}
