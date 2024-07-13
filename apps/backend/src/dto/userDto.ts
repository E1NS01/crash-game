import { Type } from 'class-transformer';
import { IsDate, IsNumber, ValidateNested } from 'class-validator';
import { BetDto } from './BetDto';

export class UserDto {
  @IsNumber()
  id: number;

  @IsNumber()
  balance: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @ValidateNested({ each: true })
  @Type(() => BetDto)
  bets?: BetDto[];
}
