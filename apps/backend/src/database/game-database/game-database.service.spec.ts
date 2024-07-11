import { Test, TestingModule } from '@nestjs/testing';
import { GameDatabaseService } from './game-database.service';

describe('GameDatabaseService', () => {
  let service: GameDatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameDatabaseService],
    }).compile();

    service = module.get<GameDatabaseService>(GameDatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
