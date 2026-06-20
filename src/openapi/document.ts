import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { envConfig } from '../config/env';
import {
  FlightSearchQuerySchema,
  FlightSearchResponseSchema,
} from '../modules/flight/flight.schema';
import {
  InternalServerErrorResponseSchema,
  ValidationErrorResponseSchema,
} from '../shared/errors/http.schema';

export const registry = new OpenAPIRegistry();

registry.registerPath({
  method: 'get',
  path: '/api/flights/search',
  summary: 'Search flights',
  description:
    'Returns flights filtered by optional query parameters, scored and sorted by duration (preferred airline gets a 0.9 multiplier).',
  request: {
    query: FlightSearchQuerySchema,
  },
  responses: {
    200: {
      description: 'Matching flights',
      content: {
        'application/json': {
          schema: FlightSearchResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid query parameters',
      content: {
        'application/problem+json': {
          schema: ValidationErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Unexpected server error',
      content: {
        'application/problem+json': {
          schema: InternalServerErrorResponseSchema,
        },
      },
    },
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Flight Search API',
      version: '1.0.0',
      description: 'Corporate travel flight search API',
    },
    servers: [{ url: envConfig.API_BASE_URL }],
  });
}
