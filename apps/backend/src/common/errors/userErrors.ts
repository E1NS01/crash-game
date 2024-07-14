export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserNotFoundError extends UserError {
  constructor(userId: number) {
    super(`User ${userId} not found`);
  }
}

export class BalanceTooLowError extends UserError {
  constructor(userId: number, required: number, available: number) {
    super(
      `User ${userId} has insufficient balance. Required: ${required}, Available: ${available}`,
    );
  }
}
