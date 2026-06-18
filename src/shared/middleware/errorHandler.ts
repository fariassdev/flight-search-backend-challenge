import type { ErrorRequestHandler } from 'express';
import { AppError, InternalServerError } from '../errors/api';

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const error = toError(err);

  if (error instanceof AppError) {
    return res
      .status(error.status)
      .contentType('application/problem+json')
      .json(error.toResponse(req.originalUrl));
  }

  const fallbackError = new InternalServerError();
  return res
    .status(500)
    .contentType('application/problem+json')
    .json(fallbackError.toResponse(req.originalUrl));
};
