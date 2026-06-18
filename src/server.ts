import express from 'express';
import { getDistanceBetweenAirports } from './modules/airport/airport.service';
import type {
  Flight,
  FlightSearchFilters,
  FlightSearchQueryRaw,
  FlightSearchResponse,
  ScoredFlight,
} from './modules/flight/flight.schema';
import type { ApiError } from './shared/errors/api';

const app = express();

const FLIGHT_DATA_URL =
  'https://gist.githubusercontent.com/bgdavidx/132a9e3b9c70897bc07cfa5ca25747be/raw/8dbbe1db38087fad4a8c8ade48e741d6fad8c872/gistfile1.txt';

let cachedFlights: Flight[] | null = null;

async function fetchFlightData(): Promise<Flight[]> {
  if (cachedFlights) {
    return cachedFlights;
  }

  const response = await fetch(FLIGHT_DATA_URL);
  const flights = (await response.json()) as Flight[];
  cachedFlights = flights;
  return flights;
}

function calculateDuration(departureTime: string, arrivalTime: string): number {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  return (arrival.getTime() - departure.getTime()) / (1000 * 60 * 60);
}

function calculateFlightScore(
  duration: number,
  carrier: string,
  preferredAirline?: string,
): number {
  const isPreferred = preferredAirline && carrier === preferredAirline;
  const multiplier = isPreferred ? 0.9 : 1;
  return duration * multiplier;
}

function scoreFlights(
  flights: Flight[],
  preferredAirline?: string,
): ScoredFlight[] {
  return flights.map((flight) => {
    const duration = calculateDuration(
      flight.departureTime,
      flight.arrivalTime,
    );
    const distance = getDistanceBetweenAirports(
      flight.origin,
      flight.destination,
    );
    const score = calculateFlightScore(
      duration,
      flight.carrier,
      preferredAirline,
    );

    return { ...flight, duration, distance, score };
  });
}

function filterFlights(
  flights: Flight[],
  { maxDuration, minDepartureTime, maxDepartureTime }: FlightSearchFilters,
): Flight[] {
  return flights.filter((flight) => {
    if (maxDuration && maxDuration > 0) {
      const duration = calculateDuration(
        flight.departureTime,
        flight.arrivalTime,
      );
      if (duration > maxDuration) {
        return false;
      }
    }

    if (minDepartureTime) {
      if (new Date(flight.departureTime) < new Date(minDepartureTime)) {
        return false;
      }
    }

    if (maxDepartureTime) {
      if (new Date(flight.departureTime) > new Date(maxDepartureTime)) {
        return false;
      }
    }

    return true;
  });
}

function sortByScore(flights: ScoredFlight[]) {
  return [...flights].sort((a, b) => a.score - b.score);
}

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

    const flights = await fetchFlightData();

    const filtered = filterFlights(flights, filters);
    const scored = scoreFlights(filtered, preferredAirline);
    const sorted = sortByScore(scored);

    res.json({
      count: sorted.length,
      flights: sorted,
    });
  },
);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
