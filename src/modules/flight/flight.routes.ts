import { Router } from 'express';
import type { ApiError } from '../../shared/errors/api';
import type {
  FlightSearchFilters,
  FlightSearchQueryParsed,
  FlightSearchResponse,
} from './flight.schema';
import { searchFlights } from './flight.service';

export const flightRoutes = Router();

flightRoutes.get<
  never,
  FlightSearchResponse | ApiError,
  never,
  FlightSearchQueryParsed
>('/search', async (req, res) => {
  const { minDepartureTime, maxDepartureTime, maxDuration, preferredAirline } =
    req.query;

  const parsedMaxDuration = Number(maxDuration);
  if (!Number.isFinite(parsedMaxDuration) || parsedMaxDuration < 0) {
    return res
      .status(400)
      .json({ error: 'maxDuration must be a positive number' });
  }
  const filters: FlightSearchFilters = {
    maxDuration: parsedMaxDuration,
    minDepartureTime: minDepartureTime,
    maxDepartureTime: maxDepartureTime,
  };

  const flights = await searchFlights({ filters, preferredAirline });

  res.json({
    count: flights.length,
    flights,
  });
});
