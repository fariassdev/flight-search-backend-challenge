import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { z } from 'zod';
import { ValidationError } from '../errors/api';

type QueryHandler<T> = (
  req: Request,
  res: Response,
  next: NextFunction,
  query: T,
) => void | Promise<void>;

export function withValidatedQuery<T extends ZodType>(
  schema: T,
  handler: QueryHandler<z.infer<T>>,
): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return next(
        new ValidationError(z.flattenError(result.error).fieldErrors),
      );
    }

    return handler(req, res, next, result.data);
  };
}
