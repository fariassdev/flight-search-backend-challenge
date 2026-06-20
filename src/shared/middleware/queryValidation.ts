import type { Request, Response, RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { z } from 'zod';
import { ValidationError } from '../errors/http';

type QueryHandler<T> = (
  req: Request,
  res: Response,
  query: T,
) => void | Promise<void>;

export function withValidatedQuery<T extends ZodType>(
  schema: T,
  handler: QueryHandler<z.infer<T>>,
): RequestHandler {
  return async (req, res) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      throw new ValidationError(z.flattenError(result.error).fieldErrors);
    }

    await handler(req, res, result.data);
  };
}
