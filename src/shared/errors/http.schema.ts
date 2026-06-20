import { z } from 'zod';

export const ValidationErrorResponseSchema = z
  .object({
    code: z.literal('validation_failed'),
    title: z.literal('Validation Failed'),
    status: z.literal(400),
    detail: z.string(),
    instance: z.string(),
    errors: z.record(z.string(), z.array(z.string()).optional()),
  })
  .meta({ id: 'ValidationErrorResponse' });

export const InternalServerErrorResponseSchema = z
  .object({
    code: z.literal('internal_server_error'),
    title: z.literal('Internal Server Error'),
    status: z.literal(500),
    detail: z.string(),
    instance: z.string(),
  })
  .meta({ id: 'InternalServerErrorResponse' });

export type ValidationErrorResponse = z.infer<
  typeof ValidationErrorResponseSchema
>;
export type InternalServerErrorResponse = z.infer<
  typeof InternalServerErrorResponseSchema
>;
