import { getDistanceBetweenAirports } from '../airport/airport.service';
import { fetchFlights } from './flight.repository';
import type {
  Flight,
  FlightSearchFilters,
  ScoredFlight,
} from './flight.schema';

function calculateDuration(departureTime: string, arrivalTime: string): number {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  return (arrival.getTime() - departure.getTime()) / (1000 * 60 * 60);
}

function filterFlights(
  flights: Flight[],
  filters: FlightSearchFilters,
): Flight[] {
  return flights.filter((flight) => {
    if (filters.maxDuration !== undefined) {
      const duration = calculateDuration(
        flight.departureTime,
        flight.arrivalTime,
      );
      if (duration > filters.maxDuration) return false;
    }
    if (
      filters.minDepartureTime !== undefined &&
      flight.departureTime < filters.minDepartureTime
    ) {
      return false;
    }
    if (
      filters.maxDepartureTime !== undefined &&
      flight.departureTime > filters.maxDepartureTime
    ) {
      return false;
    }
    return true;
  });
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

function sortByScore(flights: ScoredFlight[]) {
  return [...flights].sort((a, b) => a.score - b.score);
}

export async function searchFlights(options: {
  filters: FlightSearchFilters;
  preferredAirline?: string;
}): Promise<ScoredFlight[]> {
  const flights = await fetchFlights();
  const filtered = filterFlights(flights, options.filters);
  const scored = scoreFlights(filtered, options.preferredAirline);
  return sortByScore(scored);
}
