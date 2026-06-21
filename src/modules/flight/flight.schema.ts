import { z } from 'zod';

const isoDateTimeCoerce = z.iso
  .datetime({
    error:
      "Invalid date format: must be a valid ISO 8601 date. Example: '2026-01-01T00:00:00Z'.",
  })
  .pipe(z.coerce.date())
  .meta({
    example: '2026-01-01T00:00:00Z',
  });

export const FlightSchema = z.object({
  carrier: z.string().meta({
    description: 'the airline carrier code for the flight',
  }),
  origin: z
    .string()
    .meta({
      description: 'the origin airport code for the flight',
    })
    .optional(),
  destination: z
    .string()
    .meta({
      description: 'the destination airport code for the flight',
    })
    .optional(),
  departureTime: isoDateTimeCoerce.meta({
    description: 'the departure time of the flight in ISO 8601 format',
  }),
  arrivalTime: isoDateTimeCoerce.meta({
    description: 'the arrival time of the flight in ISO 8601 format',
  }),
});

export const FlightsSchema = z.array(FlightSchema);

export const ScoredFlightSchema = FlightSchema.extend({
  duration: z.number().positive().meta({
    description: 'the duration of the flight in hours',
  }),
  distance: z
    .number()
    .positive()
    .meta({
      description: 'the distance of the flight in miles',
    })
    .nullable(),
  score: z.number().positive().meta({
    description:
      'the score of the flight based on duration and preferred airline, lower is better',
  }),
});

export const FlightSearchQuerySchema = z.object({
  maxDuration: z.coerce
    .number<string>({
      error: 'Invalid input: must be a valid number.',
    })
    .positive({
      error: 'Invalid input: must be a positive number.',
    })
    .meta({
      description: 'filter out flights longer than X hours',
    })
    .optional(),
  minDepartureTime: isoDateTimeCoerce
    .meta({
      description: 'filter out flights before this time, in ISO 8601 format',
    })
    .optional(),
  maxDepartureTime: isoDateTimeCoerce
    .meta({
      description: 'filter out flights after this time, in ISO 8601 format',
    })
    .optional(),
  preferredAirline: z
    .string()
    .meta({ description: 'the preferred airline for the flight' })
    .optional(),
});

export const FlightSearchResponseSchema = z.object({
  count: z.number().positive(),
  flights: z.array(ScoredFlightSchema),
});

export type Flight = z.infer<typeof FlightSchema>;
export type ScoredFlight = z.infer<typeof ScoredFlightSchema>;
export type FlightSearchQueryRaw = z.input<typeof FlightSearchQuerySchema>;
export type FlightSearchQueryParsed = z.output<typeof FlightSearchQuerySchema>;
export type FlightSearchFilters = Omit<
  FlightSearchQueryParsed,
  'preferredAirline'
>;
export type FlightSearchResponse = z.infer<typeof FlightSearchResponseSchema>;
