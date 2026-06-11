import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const AIRPORTS_DAT_URL =
  'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'airports.json');
const OPENFLIGHTS_NULL = '\\N';

interface AirportCoordinate {
  latitude: number;
  longitude: number;
}

type AirportLookupMap = Record<string, AirportCoordinate>;

interface ParsedAirportRecord {
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

interface NormalizedAirport {
  iata: string;
  latitude: number;
  longitude: number;
}

function castOpenFlightsValue(value: string): string | null {
  return value === OPENFLIGHTS_NULL ? null : value;
}

async function fetchAirportsDat(): Promise<string> {
  const response = await fetch(AIRPORTS_DAT_URL);
  if (!response.ok) {
    throw new Error(`Failed to download airports.dat: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function parseAirportsDat(content: string): ParsedAirportRecord[] {
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
  }) as ParsedAirportRecord[];
}

function isValidCode(code: string | null | undefined): code is string {
  return !!code && typeof code === 'string';
}

function isValidCoordinate(latitude: string | null, longitude: string | null): boolean {
  const lat = Number(latitude);
  const lon = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lon);
}

function normalizeRecord(record: ParsedAirportRecord): NormalizedAirport | null {
  if (!isValidCode(record.iata) || !isValidCoordinate(record.latitude, record.longitude)) {
    return null;
  }

  return {
    iata: record.iata.toUpperCase(),
    latitude: Number(record.latitude),
    longitude: Number(record.longitude),
  };
}

function normalizeRecords(records: ParsedAirportRecord[]): NormalizedAirport[] {
  const normalized: NormalizedAirport[] = [];

  for (const record of records) {
    const airport = normalizeRecord(record);
    if (airport) {
      normalized.push(airport);
    }
  }

  return normalized;
}

function buildAirportLookup(airports: NormalizedAirport[]): AirportLookupMap {
  const lookup: AirportLookupMap = {};

  for (const { iata, latitude, longitude } of airports) {
    lookup[iata] = { latitude, longitude };
  }

  return lookup;
}

function writeAirportsJson(lookup: AirportLookupMap, filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(lookup, null, 2)}\n`, 'utf8');
}

async function main() {
  console.log(`Downloading airports.dat from ${AIRPORTS_DAT_URL}`);
  const datContent = await fetchAirportsDat();
  const records = parseAirportsDat(datContent);
  const normalized = normalizeRecords(records);
  const skipped = records.length - normalized.length;
  console.log(`Parsed ${records.length} airport records`);
  console.log(`${normalized.length} valid records (${skipped} skipped)`);

  const lookup = buildAirportLookup(normalized);
  writeAirportsJson(lookup, OUTPUT_PATH);
  console.log(`Wrote ${Object.keys(lookup).length} airport codes to ${OUTPUT_PATH}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to fetch and parse airport data: ${message}`);
  process.exit(1);
});
