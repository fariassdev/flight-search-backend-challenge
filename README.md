# Flight Search API - Technical Challenge

Fix a ranking bug, add search filters, and calculate real distances between airports.

## Quick start

```bash
npm install
npm run dev    # http://localhost:3000
npm test
```

```bash
curl "http://localhost:3000/api/flights/search"
curl "http://localhost:3000/api/flights/search?preferredAirline=AA"
curl "http://localhost:3000/api/flights/search?maxDuration=5"
```

Airport data is already committed. To regenerate: `npm run fetch-airports`.

## Core implementation

### Task A - Fix ranking

The bug was in `scoreAndSortFlights`: preferred airline flights were scored right but sorted wrong.

- Score = `duration × 0.9` when carrier matches `preferredAirline`, else `duration × 1.0`
- Sort by score ascending (lower is better)

I also split scoring and sorting into `scoreFlights` and `sortByScore`, one job each, and sorting no longer mutates the input. #1, #3, #40 (changed to modern toSorted syntax later)

### Task B - Filters

Optional query params: `maxDuration`, `minDepartureTime`, `maxDepartureTime`. Applied before scoring; they work together and with `preferredAirline`. Requirements in #2, first implementation in #5.

In #5 I added a quick `maxDuration` check, but it always ran `Number(maxDuration)`, so a request without `maxDuration` got a 400. The final fix is in #33: `FlightSearchQuerySchema` treats all filter params as optional, coerces types, and returns proper validation errors only when a param is actually sent. I also added a validation in #58 to ensure that the `maxDepartureTime` query parameter is after `minDepartureTime`.

### Task C - Real distance

For the airport data, I wrote a script (`npm run fetch-airports`) to download OpenFlights `airports.dat`, parse the CSV, validate the records with Zod, and build a JSON map keyed by IATA code for O(1) lookup. Since the OpenFlights file hasn't changed in years, I committed the pre-processed `airports.json` instead of fetching it on every server start. At runtime, `findByIata` just reads that file once. Only airports with a valid IATA code are kept (see [assumptions](#assumptions) below). More context in #12.

To calculate the distance, I used TDD. I wrote tests first using [airmilescalculator.com](https://www.airmilescalculator.com/) to calibrate the expected distances, implemented `haversineDistanceMiles` to pass them, and then refactored. The function itself is pure math, with no coordinate validation inside; that happens at the edges. If an airport code is missing or unknown, `getDistanceBetweenAirports` returns `null` instead of throwing, so the flight still shows up in results. #17, #20

I followed this "Zod at the edges" approach for the rest of the project: search query params, upstream flight JSON, airport fetch script output, the committed `airports.json` on load, and env config at startup. Any invalid input fails fast and returns a 400 with `application/problem+json`. #33, #35

### Testing

- Unit tests for pure logic: haversine, filter/score/sort, airport distance
- HTTP tests with supertest: query params, response shape, validation errors

Haversine correctness is tested on its own. Airport service tests mock only the haversine function and use the real `airports.json` for lookups. Flight service tests mock the airport service to avoid using the real `airports.json` for lookups and focus on flight service logic.

Relevant PRs: #14, #49, #58

## Assumptions

- Only airports with valid IATA codes, since the API is for commercial flights and the flight feed uses IATA codes.
- Airport data doesn't change much. Committing the pre-processed JSON is fine for this challenge. In production I'd store it in a database and cache in Redis.
- Unknown airport codes return `distance: null`, not an error. The flight still shows up in results.
