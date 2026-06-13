import { z } from 'zod';
import type { Airport, AirportsJson } from './airport.model';
import { CoordinatesSchema } from '../../shared/coordinates/coordinates.schema';

const IataCodeSchema = z.string().uppercase().length(3, {
  message: 'IATA code must be exactly 3 characters long',
});

export const AirportSchema = z.object({
  iataCode: IataCodeSchema,
  ...CoordinatesSchema.shape,
}) satisfies z.ZodType<Airport>;

export const AirportsJsonSchema = z.record(IataCodeSchema, AirportSchema) satisfies z.ZodType<AirportsJson>;