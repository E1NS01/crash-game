import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser(@Body() userId: number) {
    try {
      const user = await this.userService.getUserById(userId);
      return user;
    } catch (error) {
      return error;
    }
  }

  @Post()
  async createUser() {
    try {
      const user = await this.userService.createUser();
      return user;
    } catch (error) {
      return error;
    }
  }

  @Put()
  async updateUserBalance(@Body() data: { userId: number; amount: number }) {
    try {
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
