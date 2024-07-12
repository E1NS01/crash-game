import { Test, TestingModule } from '@nestjs/testing';
import { CrashService } from '../crash.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';

describe('CrashService', () => {
  let service: CrashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrashService, PrismaService, UserService],
    }).compile();

    service = module.get<CrashService>(CrashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a new hash', () => {
    const hash = service.getHash();
    expect(hash.length).toBe(64);
  });

  it('should generate a new hash from an old hash', () => {
    const oldHash =
      '09883bb0f96d691b809740ab500453a121e48223c6939d69d20977f864168309';
    const newHash = service.getHash(oldHash);
    expect(newHash).toBe(
      '94802e116ecc1b34376e016b288b799c8d9ac33d362470c4e58a5e83c7d2eabf',
    );
  });

  it('should generate a multiplier from a hash', () => {
    const hash =
      'f5b75704821ece4b97423b0ca5c0308b5bc6252f262f9a84cad8055344d6aa7b';
    const data = service.getMultiplier(hash);
    expect(data.multiplier).toBe(24.65);
    expect(data.hash).toBe(hash);
  });
});
