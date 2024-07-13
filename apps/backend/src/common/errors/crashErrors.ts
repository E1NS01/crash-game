// Base custom error class
export class CrashGameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific error classes
export class GameNotActiveError extends CrashGameError {
  constructor(gameId: number) {
    super(`Game ${gameId} is not active`);
  }
}

export class BetNotFoundError extends CrashGameError {
  constructor(betId: number) {
    super(`Bet ${betId} not found`);
  }
}

export class UserAlreadyProfitedError extends CrashGameError {
  constructor(userId: number, betId: number) {
    super(`User ${userId} has already taken profit on bet ${betId}`);
  }
}

export class InsufficientBalanceError extends CrashGameError {
  constructor(userId: number, required: number, available: number) {
    super(
      `User ${userId} has insufficient balance. Required: ${required}, Available: ${available}`,
    );
  }
}

export class InvalidMultiplierError extends CrashGameError {
  constructor(multiplier: number) {
    super(`Invalid multiplier: ${multiplier}. Multiplier must be >= 1`);
  }
}

export class InvalidClientMultiplierError extends CrashGameError {
  constructor(multiplier: number) {
    super('Invalid client multiplier: ' + multiplier);
  }
}

export class InvalidInputError extends CrashGameError {
  constructor(message: string) {
    super(message);
  }
}

export class BetAmountTooHighError extends CrashGameError {
  constructor(amount: number, maxAmount) {
    super(
      'Bet amount too high. Maximun is ' +
        maxAmount +
        ' : Your bet is' +
        amount,
    );
  }
}

export class BetAmountTooLowError extends CrashGameError {
  constructor(amount: number, minAmount) {
    super(
      'Bet amount too low. Minimum is ' + minAmount + ' : Your bet is' + amount,
    );
  }
}

export class InvalidBetAmountError extends CrashGameError {
  constructor(amount: number) {
    super('Invalid bet amount: ' + amount);
  }
}

export class MultipleBetsError extends CrashGameError {
  constructor(userId: number, gameId: number) {
    super(`User ${userId} already has an active bet on game ${gameId}`);
  }
}
