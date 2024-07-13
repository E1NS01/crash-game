import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  ValidateNested,
  IsString,
  IsNumber,
} from 'class-validator';
import { BetDto } from './BetDto';

export class GameDto {
  @IsInt()
  id: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  hash: string;

  @IsString()
  game: string;

  @IsBoolean()
  active: boolean;

  @IsNumber()
  multiplier: number;

  @ValidateNested({ each: true })
  @Type(() => BetDto)
  participants?: BetDto[];
}
