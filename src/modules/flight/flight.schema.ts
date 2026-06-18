import { z } from 'zod';

export const FlightSchema = z.object({
  carrier: z.string(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  departureTime: z.iso.datetime(),
  arrivalTime: z.iso.datetime(),
});

export const FlightSearchQuerySchema = z.object({
  maxDuration: z.coerce.number<string>().positive().optional(),
  minDepartureTime: z.iso.datetime().optional(),
  maxDepartureTime: z.iso.datetime().optional(),
  preferredAirline: z.string().optional(),
});

export type Flight = z.infer<typeof FlightSchema>;
export type FlightSearchQueryRaw = z.input<typeof FlightSearchQuerySchema>;
export type FlightSearchQueryParsed = z.infer<typeof FlightSearchQuerySchema>;
export type FlightSearchFilters = Pick<
  FlightSearchQueryParsed,
  'maxDuration' | 'minDepartureTime' | 'maxDepartureTime'
>;

export interface ScoredFlight extends Flight {
  duration: number;
  distance: number | null;
  score: number;
}

export interface FlightSearchResponse {
  count: number;
  flights: ScoredFlight[];
}
