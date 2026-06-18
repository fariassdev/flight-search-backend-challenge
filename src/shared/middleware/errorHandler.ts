import type { NextFunction, Request, Response } from 'express';
import { AppError, InternalServerError } from '../errors/api';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res
      .status(err.status)
      .contentType('application/problem+json')
      .json(err.toResponse(req.originalUrl));
    return;
  }

  const fallbackError = new InternalServerError();
  res
    .status(500)
    .contentType('application/problem+json')
    .json(fallbackError.toResponse(req.originalUrl));
}
