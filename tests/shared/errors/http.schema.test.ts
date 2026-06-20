import {
  InternalServerError,
  ValidationError,
} from '../../../src/shared/errors/http';
import {
  InternalServerErrorResponseSchema,
  ValidationErrorResponseSchema,
} from '../../../src/shared/errors/http.schema';

describe('error response schemas', () => {
  it('should match ValidationErrorResponseSchema when a new ValidationError is parsed', () => {
    const response = new ValidationError({
      maxDuration: ['Invalid input: must be a positive number.'],
    }).toResponse('/api/flights/search?maxDuration=-1');

    expect(ValidationErrorResponseSchema.safeParse(response).success).toBe(
      true,
    );
  });

  it('should match InternalServerErrorResponseSchema when a new InternalServerError is parsed', () => {
    const response = new InternalServerError().toResponse(
      '/api/flights/search',
    );

    expect(InternalServerErrorResponseSchema.safeParse(response).success).toBe(
      true,
    );
  });
});
