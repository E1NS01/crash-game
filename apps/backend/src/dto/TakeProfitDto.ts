import { IsInt, IsNumber, IsPositive, validateSync } from 'class-validator';
import { InvalidInputError } from '../common/errors/crashErrors';

class TakeProfitDto {
  @IsPositive()
  @IsInt()
  betId: number;

  @IsPositive()
  @IsNumber()
  multiplier: number;
}

export default function validateTakeProfitInput(input: TakeProfitDto): void {
  const errors = validateSync(input);
  if (errors.length > 0) {
    throw new InvalidInputError('errors: ' + errors.join(', '));
  }
}
