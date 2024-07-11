import { Test, TestingModule } from '@nestjs/testing';
import { CrashGateway } from './crash.gateway';
import { CrashService } from './crash.service';
import {
  io as ioc /* , type Socket as ClientSocket */,
} from 'socket.io-client';
import { Server /*,  type Socket as ServerSocket */ } from 'socket.io';
import { createServer } from 'http';
import { AddressInfo } from 'net';

describe('CrashGateway', () => {
  let gateway: CrashGateway;
  let io, /* serverSocket , */ clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = ioc(`http://localhost:${port}`);
      /* io.on('connection', (socket) => {
        serverSocket = socket;
      }); */
      clientSocket.on('connect', done);
    });
  });

  beforeEach(async () => {
    // Mock CrashService
    const mockCrashService = {
      // Mock methods as needed
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrashGateway,
        { provide: CrashService, useValue: mockCrashService },
      ],
    }).compile();

    gateway = module.get<CrashGateway>(CrashGateway);
  });

  afterAll(() => {
    io.close();
    /* clientSocket.disconect() */
  });

  // Test if the gateway is handling new connections
  it('should handle new client connections', () => {
    gateway.handleConnection(clientSocket);
    clientSocket.on('connectedClients', (connectedClients: number) => {
      expect(connectedClients).toBe(1);
    });
  });
});
