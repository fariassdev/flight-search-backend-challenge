import { Router, type Response } from 'express';
import { withValidatedQuery } from '../../shared/middleware/queryValidation';
import {
  FlightSearchQuerySchema,
  type FlightSearchResponse,
} from './flight.schema';
import { searchFlights } from './flight.service';

export const flightRoutes = Router();

flightRoutes.get(
  '/search',
  withValidatedQuery(
    FlightSearchQuerySchema,
    async (_req, res: Response<FlightSearchResponse>, query) => {
      const { preferredAirline, ...filters } = query;
      const flights = await searchFlights({ preferredAirline, filters });

      res.json({
        count: flights.length,
        flights,
      });
    },
  ),
);
