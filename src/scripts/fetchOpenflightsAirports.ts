import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Airport, AirportsJson } from '../airport/airport.model';
import { AirportSchema, AirportsJsonSchema } from '../airport/airport.schema';
import type { ZodError } from 'zod';

const AIRPORTS_DAT_URL =
  'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'airports.json');
const ERROR_LOG_PATH = path.join(process.cwd(), 'data', 'airports.errors.json');
const OPENFLIGHTS_NULL = '\\N';

interface AirportValidationError {
  field: string;
  error: string;
  records: OpenFlightsAirport[];
}

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

function parseAirportSchema(record: OpenFlightsAirport) {
  return AirportSchema.safeParse({
    iataCode: record.iata?.toUpperCase(),
    latitude: Number(record.latitude),
    longitude: Number(record.longitude),
  });
}

function processZodErrors(issues: ZodError<Airport>['issues']) {
  return issues.map(({ path, message }) => ({
    field: String(path[0] ?? 'unknown'),
    error: message,
  }));
}

function mapOpenFlightsToAirports(records: OpenFlightsAirport[]): {
  airports: Airport[];
  errors: Record<string, AirportValidationError> | null;
} {
  const airports: Airport[] = [];
  let errors: Record<string, AirportValidationError> | null = null;

  for (const record of records) {
    const result = parseAirportSchema(record);

    if (result.success) {
      airports.push(result.data);
      continue;
    }

    const zodErrors = processZodErrors(result.error.issues);
    errors ??= {};
    for (const { field, error } of zodErrors) {
      if (!errors[field]) {
        errors[field] = { field, error, records: [] };
      }
      errors[field].records.push(record);
    }
  }

  return { airports, errors };
}

function buildAirportsJson(airports: Airport[]): AirportsJson {
  const airportsJson: AirportsJson = {};

  for (const { iataCode, latitude, longitude } of airports) {
    airportsJson[iataCode] = { iataCode, latitude, longitude };
  }

  return airportsJson;
}

function validateAirportsJson(airportsJson: AirportsJson): AirportsJson {
  return AirportsJsonSchema.parse(airportsJson);
}

function writeJson(filePath: string, data: Record<string, unknown>): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function main() {
  console.log(`Downloading airports.dat from ${AIRPORTS_DAT_URL}`);
  const rawOpenFlightsAirports = await fetchOpenFlightsAirports();
  const openFlightsAirports = parseOpenFlightsAirports(rawOpenFlightsAirports);
  const { airports, errors } = mapOpenFlightsToAirports(openFlightsAirports);
  
  const skipped = openFlightsAirports.length - airports.length;
  console.log(`Parsed ${openFlightsAirports.length} airport records`);
  console.log(`${airports.length} valid records (${skipped} skipped)`);
  
  const airportsJson = validateAirportsJson(buildAirportsJson(airports));
  writeJson(OUTPUT_PATH, airportsJson);
  console.log(`Wrote ${airports.length} airport codes to ${OUTPUT_PATH}`);

  if (errors) {
    writeJson(ERROR_LOG_PATH, errors);
    console.log(`Wrote ${skipped} validation errors to ${ERROR_LOG_PATH}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to fetch and parse airport data: ${message}`);
  process.exit(1);
});
