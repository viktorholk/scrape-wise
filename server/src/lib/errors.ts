export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

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
