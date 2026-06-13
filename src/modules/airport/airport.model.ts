import type { Coordinates } from "../shared/coordinates/coordinates.model";

export interface Airport extends Coordinates {
  readonly iataCode: string;
}

export type AirportsJson = Record<Airport['iataCode'], Airport>;