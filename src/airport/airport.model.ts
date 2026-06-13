export interface Airport {
  readonly iataCode: string;
  readonly latitude: number;
  readonly longitude: number;
}

export type AirportsJson = Record<Airport['iataCode'], Airport>;