import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function formatError(err: unknown): { error: string; details?: any; statusCode: number } {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return {
      error: 'Validation Error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
      statusCode: 400,
    };
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return {
      error: err.message,
      statusCode: err.statusCode,
    };
  }

  // Handle database errors
  if (err instanceof Error && err.message.includes('duplicate key')) {
    return {
      error: 'Duplicate Entry',
      details: 'A record with this identifier already exists',
      statusCode: 409,
    };
  }

  // Default to 500 server error
  if (err instanceof Error) {
    return {
      error: process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message,
      statusCode: 500,
    };
  }

  return {
    error: 'An unexpected error occurred',
    statusCode: 500,
  };
}
