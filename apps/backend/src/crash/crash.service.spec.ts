import { Test, TestingModule } from '@nestjs/testing';
import { CrashService } from './crash.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CrashService', () => {
  let service: CrashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrashService, PrismaService],
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
});
