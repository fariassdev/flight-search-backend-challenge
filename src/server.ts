import express, { Request, Response } from 'express';

const app = express();

const FLIGHT_DATA_URL = 'https://gist.githubusercontent.com/bgdavidx/132a9e3b9c70897bc07cfa5ca25747be/raw/8dbbe1db38087fad4a8c8ade48e741d6fad8c872/gistfile1.txt';

interface Flight {
  carrier: string;
  origin?: string;
  destination?: string;
  departureTime: string;
  arrivalTime: string;
}

interface ScoredFlight extends Flight {
  duration: number;
  distance: number;
  score: number;
}

// Distance calculation between airports
// TODO: Implement using OpenFlights airport data
function getDistanceBetweenAirports(code1?: string, code2?: string): number {
  return 1000;  // Placeholder
}

let cachedFlights: Flight[] | null = null;

async function fetchFlightData(): Promise<Flight[]> {
  if (cachedFlights) {
    return cachedFlights;
  }

  const response = await fetch(FLIGHT_DATA_URL);
  const flights = await response.json() as Flight[];
  cachedFlights = flights;
  return flights;
}

function calculateDuration(departureTime: string, arrivalTime: string): number {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  return (arrival.getTime() - departure.getTime()) / (1000 * 60 * 60);
}

function calculateFlightScore(duration: number, carrier: string, preferredAirline?: string): number {
  const isPreferred = preferredAirline && carrier === preferredAirline;
  const multiplier = isPreferred ? 0.9 : 1;
  return duration * multiplier;
}

function scoreFlights(flights: Flight[], preferredAirline?: string): ScoredFlight[] {
  return flights.map(flight => {
    const duration = calculateDuration(flight.departureTime, flight.arrivalTime);
    const distance = getDistanceBetweenAirports(flight.origin, flight.destination);
    const score = calculateFlightScore(duration, flight.carrier, preferredAirline);

    return { ...flight, duration, distance, score };
  });
}

function sortByScore(flights: ScoredFlight[]) {
  return [...flights].sort((a, b) => a.score - b.score);
}

app.get('/api/flights/search', async (req: Request, res: Response) => {
  const { minDepartureTime, maxDepartureTime, maxDuration, preferredAirline } = req.query;

  const flights = await fetchFlightData();

  const scored = scoreFlights(flights, preferredAirline as string);
  const sorted = sortByScore(scored);

  res.json({
    count: sorted.length,
    flights: sorted
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
