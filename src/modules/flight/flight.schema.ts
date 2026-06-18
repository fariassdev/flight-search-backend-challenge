import { z } from 'zod';

const isoDateTimeCoerce = z.iso.datetime().pipe(z.coerce.date());

export const FlightSchema = z.object({
  carrier: z.string(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  departureTime: isoDateTimeCoerce,
  arrivalTime: isoDateTimeCoerce,
});

export const FlightsSchema = z.array(FlightSchema);

export const FlightSearchQuerySchema = z.object({
  maxDuration: z.coerce.number<string>().positive().optional(),
  minDepartureTime: isoDateTimeCoerce.optional(),
  maxDepartureTime: isoDateTimeCoerce.optional(),
  preferredAirline: z.string().optional(),
});

export type Flight = z.infer<typeof FlightSchema>;
export type FlightSearchQueryRaw = z.input<typeof FlightSearchQuerySchema>;
export type FlightSearchQueryParsed = z.output<typeof FlightSearchQuerySchema>;
export type FlightSearchFilters = Omit<
  FlightSearchQueryParsed,
  'preferredAirline'
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
