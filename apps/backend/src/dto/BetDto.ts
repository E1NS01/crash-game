import { IsNumber, IsBoolean } from 'class-validator';

export class BetDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  tookProfit: boolean;

  @IsNumber()
  amount: number;

  @IsNumber()
  userId: number;

  @IsNumber()
  betId: number;
}
