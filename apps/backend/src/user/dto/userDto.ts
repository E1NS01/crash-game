import { Type } from 'class-transformer';
import { IsDate, IsNumber, ValidateNested } from 'class-validator';
import { BetDto } from 'src/crash/dto/BetDto';

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
  @Type(() => BetDto) // Assuming BetParticipantDto is defined elsewhere and has its own validators
  bets?: BetDto[];
}
