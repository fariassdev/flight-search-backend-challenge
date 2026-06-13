import { z } from 'zod';
import type { Airport } from './airport.model';

export const AirportSchema: z.ZodType<Airport> = z.object({
  iataCode: z.string().uppercase().length(3, { message: 'IATA code must be exactly 3 characters long' }),
  latitude:  z.number(),
  longitude:  z.number(),
});