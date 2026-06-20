import type { NextFunction, Request, Response } from 'express';

jest.mock('@scalar/express-api-reference', () => ({
  apiReference: jest.fn(
    () => (_req: Request, _res: Response, next: NextFunction) => {
      next();
    },
  ),
}));
