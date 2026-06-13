import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Airport, AirportsJson } from '../airport/airport.model';

const AIRPORTS_DAT_URL =
  'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
const OUTPUT_PATH = path.join(__dirname, '..', '..', 'data', 'airports.json');
const OPENFLIGHTS_NULL = '\\N';
interface OpenFlightsAirport {
  id: string;
  name: string;
  city: string;
  country: string;
  iata: string | null;
  icao: string | null;
  latitude: string | null;
  longitude: string | null;
  altitude: string | null;
  timezone: string | null;
  dst: string | null;
  tz: string | null;
  type: string | null;
  source: string | null;
}

function castOpenFlightsValue(value: string): string | null {
  return value === OPENFLIGHTS_NULL ? null : value;
}

async function fetchOpenFlightsAirports(): Promise<string> {
  const response = await fetch(AIRPORTS_DAT_URL);
  if (!response.ok) {
    throw new Error(`Failed to download airports.dat: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function parseOpenFlightsAirports(content: string): OpenFlightsAirport[] {
  return parse(content, {
    columns: [
      'id',
      'name',
      'city',
      'country',
      'iata',
      'icao',
      'latitude',
      'longitude',
      'altitude',
      'timezone',
      'dst',
      'tz',
      'type',
      'source',
    ],
    relax_quotes: true,
    skip_empty_lines: true,
    cast: castOpenFlightsValue,
  }) as OpenFlightsAirport[];
}

function isValidCode(code: string | null | undefined): code is string {
  return !!code && typeof code === 'string';
}

function isValidCoordinate(latitude: string | null, longitude: string | null): boolean {
  const lat = Number(latitude);
  const lon = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lon);
}

function normalizeAirport(record: OpenFlightsAirport): Airport | null {
  if (!isValidCode(record.iata) || !isValidCoordinate(record.latitude, record.longitude)) {
    return null;
  }

  return {
    iataCode: record.iata.toUpperCase(),
    latitude: Number(record.latitude),
    longitude: Number(record.longitude),
  };
}

function normalizeAirports(records: OpenFlightsAirport[]): Airport[] {
  const airports: Airport[] = [];

  for (const record of records) {
    const airport = normalizeAirport(record);
    if (airport) {
      airports.push(airport);
    }
  }

  return airports;
}

function buildAirportsJson(airports: Airport[]): AirportsJson {
  const airportsJson: AirportsJson = {};

  for (const { iataCode, latitude, longitude } of airports) {
    airportsJson[iataCode] = { iataCode, latitude, longitude };
  }

  return airportsJson;
}

function writeAirportsJson(airportsJson: AirportsJson, filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(airportsJson, null, 2)}\n`, 'utf8');
}

async function main() {
  console.log(`Downloading airports.dat from ${AIRPORTS_DAT_URL}`);
  const rawOpenFlightsAirports = await fetchOpenFlightsAirports();
  const openFlightsAirports = parseOpenFlightsAirports(rawOpenFlightsAirports);
  const airports = normalizeAirports(openFlightsAirports);
  const skipped = openFlightsAirports.length - airports.length;
  console.log(`Parsed ${openFlightsAirports.length} airport records`);
  console.log(`${airports.length} valid records (${skipped} skipped)`);

  const airportsJson = buildAirportsJson(airports);
  writeAirportsJson(airportsJson, OUTPUT_PATH);
  console.log(`Wrote ${Object.keys(airportsJson).length} airport codes to ${OUTPUT_PATH}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to fetch and parse airport data: ${message}`);
  process.exit(1);
});
