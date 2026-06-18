import { Router } from 'express';
import { z } from 'zod';
import type { ApiError } from '../../shared/errors/api';
import {
  FlightSearchQuerySchema,
  type FlightSearchQueryRaw,
  type FlightSearchResponse,
} from './flight.schema';
import { searchFlights } from './flight.service';

export const flightRoutes = Router();

flightRoutes.get<
  never,
  FlightSearchResponse | ApiError,
  never,
  FlightSearchQueryRaw
>('/search', async (req, res) => {
  const parsed = FlightSearchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: z.flattenError(parsed.error).fieldErrors });
  }

  const { preferredAirline, ...filters } = parsed.data;
  const flights = await searchFlights({ preferredAirline, filters });

  res.json({
    count: flights.length,
    flights,
  });
});
