import type { Flight } from './flight.schema';

const FLIGHT_DATA_URL =
  'https://gist.githubusercontent.com/bgdavidx/132a9e3b9c70897bc07cfa5ca25747be/raw/8dbbe1db38087fad4a8c8ade48e741d6fad8c872/gistfile1.txt';

let cachedFlights: Flight[] | null = null;

export async function fetchFlights(): Promise<Flight[]> {
  if (cachedFlights) return cachedFlights;

  const response = await fetch(FLIGHT_DATA_URL);
  if (!response.ok) {
    throw new Error(`Flight data fetch failed: ${response.status}`);
  }

  cachedFlights = (await response.json()) as Flight[];
  return cachedFlights;
}
