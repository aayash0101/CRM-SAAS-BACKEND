import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '@config/app.config';
import { sendError } from '@common/utils/apiResponse.utils';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Zod validation errors — bad request shape
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.issues.forEach((issue) => {
      const field = issue.path.join('.') || 'general';
      errors[field] = errors[field]
        ? [...errors[field], issue.message]
        : [issue.message];
    });
    sendError(res, 'Validation failed', 422, errors);
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    sendError(res, 'Database operation failed', 400);
    return;
  }

  console.error('Unhandled error:', err);
  sendError(
    res,
    config.isDevelopment ? err.message : 'Internal server error',
    500
  );
};