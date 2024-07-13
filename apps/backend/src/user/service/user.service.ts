import { Injectable } from '@nestjs/common';
import { UserDto } from 'src/dto/userDto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user
   *
   * Creates a new user with a starting balance of 1000
   * @returns Promise<UserDto> - The newly created user
   */
  async createUser(): Promise<UserDto> {
    return await this.prisma.user.create({
      data: {
        balance: 1000,
      },
    });
  }
  /**
   *  Update a user's balance
   *
   * This function updates a users' balance by a given amount (can be negative to subtract from the balance)
   * @param userId the id of the user to update
   * @param amount the amount to update the users' balance by
   * @returns Promise<UserDto> - The updated user
   */
  async updateUserBalance(userId: number, amount: number): Promise<UserDto> {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  /**
   * Gets a user by their ID
   *
   * This function retrieves a user from the database by their ID.
   *
   * @param userId - The ID of the user to get
   * @returns Promise<UserDto> - The user with the given ID
   */
  async getUserById(userId: number): Promise<UserDto> {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  /**
   * Get the balance of a user
   *
   * This function retrieves the balance of a user by their ID and returns it.
   *
   * @param userId - The ID of the user to get the balance of
   * @returns Promise<number> - The balance of the user with the given ID
   */
  async getUserBalance(userId: number): Promise<number> {
    const user = await this.getUserById(userId);
    return user.balance;
  }
}
