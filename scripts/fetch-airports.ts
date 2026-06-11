import { parse } from 'csv-parse/sync';

const AIRPORTS_DAT_URL =
  'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';

interface ParsedAirportRecord {
  id: string;
  name: string;
  city: string;
  country: string;
  iata: string;
  icao: string;
  latitude: string;
  longitude: string;
  altitude: string;
  timezone: string;
  dst: string;
  tz: string;
  type: string;
  source: string;
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
  }) as ParsedAirportRecord[];
}

async function main() {
  console.log(`Downloading airports.dat from ${AIRPORTS_DAT_URL}`);
  const datContent = await fetchAirportsDat();
  const records = parseAirportsDat(datContent);
  console.log(`Parsed ${records.length} airport records`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to fetch and parse airport data: ${message}`);
  process.exit(1);
});
