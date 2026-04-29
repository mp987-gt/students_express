class AppError extends Error {
  constructor(message, statusCode, field) {
    super(message);
    this.statusCode = statusCode;
    this.field = field; 
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, field) {
    super(message, 400, field);
  }
}

export class AuthError extends AppError {
  constructor(message = 'Invalid password', field = 'password') {
    super(message, 401, field);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'This slonik doesn not exists', field = 'username') {
    super(message, 404, field);
  }
}