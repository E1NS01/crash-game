import { Test, TestingModule } from '@nestjs/testing';
import { CrashGateway } from './crash.gateway';

describe('CrashGateway', () => {
  let gateway: CrashGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrashGateway],
    }).compile();

    gateway = module.get<CrashGateway>(CrashGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
