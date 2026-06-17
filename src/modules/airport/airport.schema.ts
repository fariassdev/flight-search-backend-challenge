import { z } from 'zod';
import { CoordinatesSchema } from '../../shared/coordinates/coordinates.schema';

const IataCodeSchema = z.string().uppercase().length(3, {
  message: 'IATA code must be exactly 3 characters long',
});

export const AirportSchema = z.object({
  iataCode: IataCodeSchema,
  ...CoordinatesSchema.shape,
});

export const AirportsJsonSchema = z.record(IataCodeSchema, AirportSchema);

export type Airport = z.infer<typeof AirportSchema>;
export type AirportsJson = z.infer<typeof AirportsJsonSchema>;
