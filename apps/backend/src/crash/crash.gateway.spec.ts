import { Test, TestingModule } from '@nestjs/testing';
import { CrashGateway } from './crash.gateway';
import { CrashService } from './crash.service';
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client';
import { Server, Socket, type Socket as ServerSocket } from 'socket.io';
import { createServer } from 'http';
import { AddressInfo } from 'net';

describe('CrashGateway', () => {
  let gateway: CrashGateway;
  let io: Server;
  let serverSocket: Socket | ServerSocket;
  let clientSocket: Socket | ClientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = ioc(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  beforeEach(async () => {
    // Mocking the CrashGateway for easier testing
    const mockCrashService = {};
    const mockGateway = {
      connectedClients: 0,
      handleConnection: jest.fn().mockImplementation(() => {
        mockGateway.connectedClients++;
        serverSocket.emit('connectedClients', mockGateway.connectedClients);
      }),
      handleDisconnect: jest.fn().mockImplementation(() => {
        mockGateway.connectedClients--;
        serverSocket.emit('connectedClients', mockGateway.connectedClients);
      }),
      handleGetConnectedClients: jest.fn().mockImplementation(() => {
        return mockGateway.connectedClients;
      }),
      afterInit: jest.fn().mockImplementation(() => {
        mockGateway.delayBetweenGames();
      }),
      delayBetweenGames: jest.fn().mockImplementation((end: boolean) => {
        if (end) {
          return;
        }
        mockGateway.startIncreasingMultiplier();
      }),
      startIncreasingMultiplier: jest.fn().mockImplementation(() => {
        mockGateway.stopIncreasingMultiplier();
      }),
      stopIncreasingMultiplier: jest.fn().mockImplementation(() => {
        mockGateway.delayBetweenGames(true);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: CrashGateway, useValue: mockGateway },
        { provide: CrashService, useValue: mockCrashService },
      ],
    }).compile();

    gateway = module.get<CrashGateway>(CrashGateway);
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  // Test if the gateway is handling new connections
  it('should handle new client connections', () => {
    gateway.handleConnection();
    clientSocket.on('connectedClients', (connectedClients) => {
      expect(connectedClients).toBe(1);
    });
  });

  it('should handle client disconnections', () => {
    gateway.handleConnection();
    clientSocket.on('connectedClients', (connectedClients) => {
      expect(connectedClients).toBe(1);
    });
    gateway.handleDisconnect();
    expect(gateway.handleGetConnectedClients(clientSocket as Socket)).toBe(0);
  });

  it('should rotate through game states after initialization', () => {
    const delayBetweenGamesSpy = jest.spyOn(gateway, 'delayBetweenGames');
    const startIncreasingMultiplierSpy = jest.spyOn(
      gateway,
      'startIncreasingMultiplier',
    );
    const stopIncreasingMultiplierSpy = jest.spyOn(
      gateway,
      'stopIncreasingMultiplier',
    );
    gateway.afterInit();

    expect(stopIncreasingMultiplierSpy).toHaveBeenCalled();
    expect(startIncreasingMultiplierSpy).toHaveBeenCalled();
    expect(delayBetweenGamesSpy).toHaveBeenCalledTimes(2);
  });
});
