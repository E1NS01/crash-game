import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../controller/user.controller';
import { UserService } from '../service/user.service';
import { UserDto } from 'src/dto/userDto';
import { UpdateBalanceData } from 'src/dto/updateBalanceDto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUserBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return a user', async () => {
      const result: UserDto = {
        id: 1,
        balance: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(userService, 'getUserById').mockResolvedValue(result);

      expect(await controller.getUser('1')).toBe(result);
      expect(userService.getUserById).toHaveBeenCalledWith(1);
    });

    it('should handle errors', async () => {
      const error = new Error('User not found');
      jest.spyOn(userService, 'getUserById').mockRejectedValue(error);

      expect(await controller.getUser('1')).toBe(error);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const result: UserDto = {
        id: 1,
        balance: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(userService, 'createUser').mockResolvedValue(result);

      expect(await controller.createUser()).toBe(result);
      expect(userService.createUser).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Failed to create user');
      jest.spyOn(userService, 'createUser').mockRejectedValue(error);

      expect(await controller.createUser()).toBe(error);
    });
  });

  describe('updateUserBalance', () => {
    it('should update user balance', async () => {
      const updateData: UpdateBalanceData = { userId: 1, amount: 500 };
      const result: UserDto = {
        id: 1,
        balance: 1500,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(userService, 'updateUserBalance').mockResolvedValue(result);

      expect(await controller.updateUserBalance(updateData)).toBe(result);
      expect(userService.updateUserBalance).toHaveBeenCalledWith(1, 500);
    });

    it('should handle errors', async () => {
      const updateData: UpdateBalanceData = { userId: 1, amount: 500 };
      const error = new Error('Failed to update balance');
      jest.spyOn(userService, 'updateUserBalance').mockRejectedValue(error);

      expect(await controller.updateUserBalance(updateData)).toBe(error);
    });
  });
});
