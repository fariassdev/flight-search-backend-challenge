import { envConfig } from '../../config/env';
import { FlightsSchema, type Flight } from './flight.schema';

let cachedFlights: Flight[] | null = null;

export async function fetchFlights(): Promise<Flight[]> {
  if (cachedFlights) return cachedFlights;

  const response = await fetch(envConfig.FLIGHT_DATA_URL);
  if (!response.ok) {
    throw new Error(`Flight data fetch failed: ${response.status}`);
  }

  const flightData = await response.json();
  cachedFlights = FlightsSchema.parse(flightData);
  return cachedFlights;
}
