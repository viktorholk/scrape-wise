export class AppError extends Error {
  public statusCode: number;
  public readonly _isAppError: true;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this._isAppError = true;
    Object.defineProperty(this, '_isAppError', { enumerable: false });

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class Conflict extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409);
  }
}
