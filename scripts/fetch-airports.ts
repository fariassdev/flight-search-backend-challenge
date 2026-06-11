import { parse } from 'csv-parse/sync';

const AIRPORTS_DAT_URL =
  'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
const OPENFLIGHTS_NULL = '\\N';

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

function isValidRecord(record: ParsedAirportRecord): boolean {
  return (
    isValidCoordinate(record.latitude, record.longitude) &&
    isValidCode(record.iata)
  );
}

function filterValidRecords(records: ParsedAirportRecord[]): ParsedAirportRecord[] {
  return records.filter(isValidRecord);
}

async function main() {
  console.log(`Downloading airports.dat from ${AIRPORTS_DAT_URL}`);
  const datContent = await fetchAirportsDat();
  const records = parseAirportsDat(datContent);
  const validRecords = filterValidRecords(records);
  const skipped = records.length - validRecords.length;
  console.log(`Parsed ${records.length} airport records`);
  console.log(`${validRecords.length} valid records (${skipped} skipped)`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to fetch and parse airport data: ${message}`);
  process.exit(1);
});
