import { IsPositive, IsInt, validateSync } from 'class-validator';
import { InvalidInputError } from '../errors/crashErrors';

class PlaceBetDto {
  @IsPositive()
  @IsInt()
  amount: number;

  @IsPositive()
  @IsInt()
  userId: number;

  @IsPositive()
  @IsInt()
  gameId: number;
}

export function validatePlaceBetInput(input: PlaceBetDto): void {
  const errors = validateSync(input);
  if (errors.length > 0) {
    throw new InvalidInputError('errors: ' + errors.join(', '));
  }
}
