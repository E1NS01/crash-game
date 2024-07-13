import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../service/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from '../../dto/userDto';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user with 1000 balance', async () => {
      const expectedUser: UserDto = {
        id: 1,
        balance: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.createUser();

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { balance: 1000 },
      });
    });
  });

  describe('updateUserBalance', () => {
    it('should update user balance', async () => {
      const userId = 1;
      const amount = 500;
      const expectedUser: UserDto = {
        id: 1,
        balance: 1500,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.update.mockResolvedValue(expectedUser);

      const result = await service.updateUserBalance(userId, amount);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { balance: { increment: amount } },
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = 1;
      const expectedUser: UserDto = {
        id: 1,
        balance: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.getUserById(userId);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('getUserBalance', () => {
    it('should return the balance of a user', async () => {
      const userId = 1;
      const expectedUser: UserDto = {
        id: 1,
        balance: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'getUserById').mockResolvedValue(expectedUser);

      const result = await service.getUserBalance(userId);

      expect(result).toEqual(expectedUser.balance);
      expect(service.getUserById).toHaveBeenCalledWith(userId);
    });
  });
});
