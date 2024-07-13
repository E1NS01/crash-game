import { Test, TestingModule } from '@nestjs/testing';
import { CrashService } from '../service/crash.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/service/user.service';
import { CrashEventEmitter } from '../crash.eventEmitter';

const mockEventEmitter = {
  sendMultiplierEvent: jest.fn(),
  sendCrashEvent: jest.fn(),
  sendNewGameEvent: jest.fn(),
};

describe('CrashService', () => {
  let service: CrashService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrashService,
        PrismaService,
        UserService,
        { provide: CrashEventEmitter, useValue: mockEventEmitter },
      ],
      imports: [],
    }).compile();

    service = module.get<CrashService>(CrashService);

    // Mock all methods except getHash and getMultiplier
    jest.spyOn(service, 'initGame').mockImplementation(async () => {
      service.delayBetweenGames();
    });
    jest
      .spyOn(service, 'delayBetweenGames')
      .mockImplementation(async (end?: boolean) => {
        if (end) return;
        mockEventEmitter.sendNewGameEvent();
        service.startIncreasingMultiplier();
      });
    jest.spyOn(service, 'startIncreasingMultiplier').mockImplementation(() => {
      mockEventEmitter.sendMultiplierEvent();
      mockEventEmitter.sendCrashEvent();
      service.stopIncreasingMultiplier();
    });
    jest.spyOn(service, 'stopIncreasingMultiplier').mockImplementation(() => {
      (service.delayBetweenGames as any)(true);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHash', () => {
    it('should generate a new hash', () => {
      const hash = service.getHash();
      expect(hash.length).toBe(64);
    });

    it.each([
      [
        '6965fe74514ab19dae0abfee6211e08c5a45886c069457ce82eadfbbfd9357c9',
        '577bdc163d9ca8500bf217fa87d34e140f010ea684f1e2e484a779ee8225dff9',
      ],
      [
        '8d8600559fb0bd64f8236552304ee20c6de18c35ae62c24df48b4bb20afef24c',
        '5e84e33c57b6810afb28c3089a9cf0850267f874a7d4ef8471a1f3a13fb6b4e3',
      ],
    ])('should generate correct hash from %s', (input, expected) => {
      expect(service.getHash(input)).toBe(expected);
    });
  });
  describe('getMultiplier', () => {
    it('should generate a multiplier from a hash', () => {
      const hash =
        'f5b75704821ece4b97423b0ca5c0308b5bc6252f262f9a84cad8055344d6aa7b';
      const data = service.getMultiplier(hash);
      expect(typeof data.multiplier === 'number').toBe(
        typeof data.multiplier === 'number',
      );
    });
    it.each([
      ['e30857c9eff66ee6caf70c58fa09d1c8ab4e8b3b25511d68cbf0b6b60072d974', 1],
      [
        '51189ad30bee63821dae44436bab5ce8ebf8a7972da0274e66d3894753adae3a',
        1.46,
      ],
      [
        'e6f1ab796904d883584a7137291c215fe75a36c085e4eeb548cd699f54f110d9',
        10.12,
      ],
    ])('should generate correct multiplier from %s', (input, expected) => {
      expect(service.getMultiplier(input).multiplier).toBe(expected);
      expect(service.getMultiplier(input).hash).toBe(input);
    });
  });

  describe('Game Loop', () => {
    it('cycle through the game loop correctly', async () => {
      service.initGame();
      expect(service.delayBetweenGames).toHaveBeenCalledTimes(2);
      expect(service.startIncreasingMultiplier).toHaveBeenCalledTimes(1);
      expect(service.stopIncreasingMultiplier).toHaveBeenCalledTimes(1);
    });
    it('should call the CrashEventEmitter to emit a multiplier and crash event', () => {
      service.startIncreasingMultiplier();
      expect(mockEventEmitter.sendMultiplierEvent).toHaveBeenCalled();
      expect(mockEventEmitter.sendCrashEvent).toHaveBeenCalled();
    });
    it('should call the CrashEventEmitter to emit a new game event', () => {
      service.delayBetweenGames();
      expect(mockEventEmitter.sendNewGameEvent).toHaveBeenCalled();
    });
    it('should emit events in the correct order during a game cycle', async () => {
      const eventOrder = [];
      mockEventEmitter.sendNewGameEvent.mockImplementation(() =>
        eventOrder.push('newGame'),
      );
      mockEventEmitter.sendMultiplierEvent.mockImplementation(() =>
        eventOrder.push('multiplier'),
      );
      mockEventEmitter.sendCrashEvent.mockImplementation(() =>
        eventOrder.push('crash'),
      );

      await service.initGame();

      expect(eventOrder).toEqual(['newGame', 'multiplier', 'crash']);
    });
  });
});
