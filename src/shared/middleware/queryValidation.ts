import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { z } from 'zod';
import type { ValidationError } from '../errors/api';

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
  return (req, res: Response<ValidationError>, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_QUERY',
        message: 'Invalid query parameters',
        errors: z.flattenError(result.error).fieldErrors,
      });
    }

    return handler(req, res, next, result.data);
  };
}
