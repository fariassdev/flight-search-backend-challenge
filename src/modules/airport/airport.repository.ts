import type { Airport, AirportsJson } from './airport.model';
import { AirportsJsonSchema } from './airport.schema';
import airportsJson from '../../data/airports.json';

export interface IAirportRepository {
  // Keep it async to make it easier to swap out for a real-word scenario like fetching data from a database, Redis or an external API.
  findByIata(code: string): Promise<Airport | null>;
}

export class JsonAirportRepository implements IAirportRepository {
  private readonly airports: AirportsJson;

  constructor() {
    this.airports = AirportsJsonSchema.parse(airportsJson);
  }

  async findByIata(code: string): Promise<Airport | null> {
    return this.airports[code.toUpperCase()] ?? null;
  }
}
