import airportsJson from '../../data/airports.json';
import { AirportsJsonSchema, type Airport } from './airport.schema';

const airports = AirportsJsonSchema.parse(airportsJson);

export function findByIata(code: string): Airport | null {
  return airports[code.toUpperCase()] ?? null;
}