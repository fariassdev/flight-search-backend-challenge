import express from 'express';
import type {
  FlightSearchFilters,
  FlightSearchQueryRaw,
  FlightSearchResponse,
} from './modules/flight/flight.schema';
import { searchFlights } from './modules/flight/flight.service';
import type { ApiError } from './shared/errors/api';

const app = express();

app.get<never, FlightSearchResponse | ApiError, never, FlightSearchQueryRaw>(
  '/api/flights/search',
  async (req, res) => {
    const {
      minDepartureTime,
      maxDepartureTime,
      maxDuration,
      preferredAirline,
    } = req.query;

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
  },
);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
