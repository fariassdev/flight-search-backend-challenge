import type { ErrorRequestHandler } from 'express';
import { AppError, InternalServerError } from '../errors/api';

function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  const err = new Error(String(value));
  err.cause = value;
  return err;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const error = toError(err);

  if (error instanceof AppError) {
    const payload = { err: error, code: error.code, status: error.status };
    if (error.status >= 500) {
      req.log.error(payload, error.detail ?? error.message);
    } else {
      req.log.warn(payload, error.detail ?? error.message);
    }

    return res
      .status(error.status)
      .contentType('application/problem+json')
      .json(error.toResponse(req.originalUrl));
  }

  req.log.error({ err: error }, 'Unhandled error');

  const fallbackError = new InternalServerError();
  return res
    .status(500)
    .contentType('application/problem+json')
    .json(fallbackError.toResponse(req.originalUrl));
};
