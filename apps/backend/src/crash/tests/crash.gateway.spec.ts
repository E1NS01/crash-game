import { Test, TestingModule } from '@nestjs/testing';
import { Socket, Server } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CrashGateway } from '../crash.gateway';
import { CrashService } from '../service/crash.service';
import { UserService } from '../../user/service/user.service';

describe('CrashGateway', () => {
  let gateway: CrashGateway;

  const mockCrashService = {
    initGame: jest.fn(),
    placeBet: jest.fn(),
    takeProfit: jest.fn(),
  };

  const mockUserService = {
    getUserById: jest.fn(),
    createUser: jest.fn(),
  };

  const mockServer = {
    emit: jest.fn(),
  };

  const mockClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrashGateway,
        { provide: CrashService, useValue: mockCrashService },
        { provide: UserService, useValue: mockUserService },
        EventEmitter2,
      ],
    }).compile();

    gateway = module.get<CrashGateway>(CrashGateway);
    gateway.server = mockServer as unknown as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should initialize the game and create a user if none exists', async () => {
      mockUserService.getUserById.mockResolvedValue(null);
      await gateway.afterInit();
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockUserService.createUser).toHaveBeenCalled();
      expect(mockCrashService.initGame).toHaveBeenCalled();
    });

    it('should not create a user if one already exists', async () => {
      mockUserService.getUserById.mockResolvedValue({ id: 1 });
      await gateway.afterInit();
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockUserService.createUser).toHaveBeenCalledTimes(1);
      expect(mockCrashService.initGame).toHaveBeenCalled();
    });
  });

  describe('handleConnection', () => {
    it('should increment connected clients and emit count', () => {
      gateway.handleConnection();
      expect(mockServer.emit).toHaveBeenCalledWith('connectedClients', 1);
    });
  });

  describe('handleDisconnect', () => {
    it('should decrement connected clients and emit count', () => {
      gateway.handleConnection();
      gateway.handleDisconnect();
      expect(mockServer.emit).toHaveBeenCalledWith('connectedClients', 0);
    });
  });

  describe('handleGetConnectedClients', () => {
    it('should emit connected clients count to the client', () => {
      gateway.handleConnection();
      gateway.handleGetConnectedClients(mockClient as unknown as Socket);
      expect(mockClient.emit).toHaveBeenCalledWith('connectedClients', 1);
    });
  });

  describe('handleNewBet', () => {
    it('should place a bet and emit bet placed event', async () => {
      const betData = { gameId: 1, betAmount: 100 };
      const placedBet = { id: 1, amount: 100 };
      mockCrashService.placeBet.mockResolvedValue(placedBet);

      await gateway.handleNewBet(mockClient as unknown as Socket, betData);

      expect(mockCrashService.placeBet).toHaveBeenCalledWith(100, 1, 1);
      expect(mockClient.emit).toHaveBeenCalledWith('betPlaced', placedBet);
    });
  });

  describe('handleTakeProfit', () => {
    it('should take profit and emit profit taken event', async () => {
      const profitData = { betId: 1, multiplier: 2 };
      const updatedBet = { id: 1, amount: 200 };
      mockCrashService.takeProfit.mockResolvedValue(updatedBet);

      await gateway.handleTakeProfit(
        mockClient as unknown as Socket,
        profitData,
      );

      expect(mockCrashService.takeProfit).toHaveBeenCalledWith(1, 2);
      expect(mockClient.emit).toHaveBeenCalledWith(
        'profitTaken',
        updatedBet,
        2,
      );
    });
  });

  describe('handleMultiplierEvent', () => {
    it('should emit multiplier update to all clients', () => {
      gateway.handleMultiplierEvent(1.5);
      expect(mockServer.emit).toHaveBeenCalledWith('multiUpdate', 1.5);
    });
  });

  describe('handleCrashEvent', () => {
    it('should emit crash event to all clients', () => {
      gateway.handleCrashEvent(2, 'hash123');
      expect(mockServer.emit).toHaveBeenCalledWith('crash', 2, 'hash123');
    });
  });

  describe('handleNewGameEvent', () => {
    it('should emit new game event to all clients', () => {
      gateway.handleNewGameEvent(2);
      expect(mockServer.emit).toHaveBeenCalledWith('newGame', 2);
    });
  });
});
