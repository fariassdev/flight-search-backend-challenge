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

async function main() {
  console.log(`Downloading airports.dat from ${AIRPORTS_DAT_URL}`);
  const datContent = await fetchAirportsDat();
  const records = parseAirportsDat(datContent);
  const withoutIata = records.filter((record) => record.iata === null).length;
  console.log(`Parsed ${records.length} airport records (${withoutIata} without IATA code)`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to fetch and parse airport data: ${message}`);
  process.exit(1);
});
