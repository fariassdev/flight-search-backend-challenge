import { haversineDistanceMiles } from '../../shared/lib/haversine';
import { findByIata } from './airport.repository';

export function getDistanceBetweenAirports(originCode?: string, destinationCode?: string): number | null {
  if (!originCode || !destinationCode) return null;

  const origin = findByIata(originCode);
  const destination = findByIata(destinationCode);
  if (!origin || !destination) return null;

  return haversineDistanceMiles(origin, destination);
}
