import { z } from 'zod';
import type { Airport, AirportsJson } from './airport.model';

const IataCodeSchema = z.string().uppercase().length(3, {
  message: 'IATA code must be exactly 3 characters long',
});

export const AirportSchema: z.ZodType<Airport> = z.object({
  iataCode: IataCodeSchema,
  latitude:  z.number(),
  longitude:  z.number(),
});

export const AirportsJsonSchema: z.ZodType<AirportsJson> = z.record(IataCodeSchema, AirportSchema);