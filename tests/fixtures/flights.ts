import type { Flight } from '../../src/modules/flight/flight.schema';

export function buildFlight(
  carrier: string,
  departureIso: string,
  durationHours: number,
  origin = 'JFK',
  destination = 'LAX',
): Flight {
  const departureTime = new Date(departureIso);
  const arrivalTime = new Date(
    departureTime.getTime() + durationHours * 60 * 60 * 1000,
  );

  return { carrier, origin, destination, departureTime, arrivalTime };
}
