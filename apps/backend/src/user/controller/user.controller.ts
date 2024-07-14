import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserDto } from 'src/dto/userDto';
import {
  UpdateBalanceData,
  validateUpdateBalanceData,
} from 'src/dto/updateBalanceDto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get a user by their ID
   *
   * This function retrieves a user from the database by their ID.
   *
   * @param {number} userId - The ID of the user to get
   * @returns Promise<UserDto> - The user with the given ID or an error if the user could not be found
   */
  @Get()
  async getUser(@Query('id') userId: string): Promise<UserDto> {
    try {
      const user = await this.userService.getUserById(parseInt(userId));
      return user;
    } catch (error) {
      return error;
    }
  }
  /**
   * Create a new user
   *
   * This function creates a new user with a starting balance of 1000
   *
   * @returns Promise<UserDto> - The newly created user or an error if the user could not be created
   */
  @Post()
  async createUser(): Promise<UserDto> {
    try {
      const user = await this.userService.createUser();
      return user;
    } catch (error) {
      return error;
    }
  }

  /**
   * Update a user's balance
   *
   * This function allows you to update a user's balance by a given amount.
   * @param data
   * @returns Promise<UserDto> - The updated user or an error if the user could not be updated
   */
  @Put()
  async updateUserBalance(@Body() data: UpdateBalanceData): Promise<UserDto> {
    try {
      validateUpdateBalanceData(data);
      const user = await this.userService.updateUserBalance(
        data.userId,
        data.amount,
      );
      return user;
    } catch (error) {
      return error;
    }
  }
}
