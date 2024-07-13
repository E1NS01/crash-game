import { IsNotEmpty, IsNumber, validateSync } from 'class-validator';
import { InvalidInputError } from 'src/common/errors/crashErrors';

export class UpdateBalanceData {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}

export function validateUpdateBalanceData(input: UpdateBalanceData): void {
  const errors = validateSync(input);
  if (errors.length > 0) {
    throw new InvalidInputError('errors: ' + errors.join(', '));
  }
}
