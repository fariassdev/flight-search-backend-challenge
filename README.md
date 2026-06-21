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

## Workflow

I used a [GitHub Projects kanban](https://github.com/users/fariassdev/projects/3/views/2) to stay organized. My approach was to focus on getting working software first, keeping PRs and commits atomic. Once the core challenge tasks were done (#1 to #20), I shifted focus to production-ready standards (error handling, logging, reproducible environments, and configuration safety), introducing them one clean PR at a time (#23 to #58).

### How I used AI

The core use was for issue and PR descriptions: Cursor or GitHub Copilot's "Summarize" button gave me a draft, I tweaked it, linked the issue, and submitted. That saved me time on the most repetitive writing.

For research I used Perplexity as my main search engine. It was really useful when I needed to compare approaches, for example when choosing how to generate the OpenAPI spec. I looked into [tsoa](https://github.com/lukeautry/tsoa), [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc), [zod-to-openapi](https://github.com/samchungy/zod-openapi) and [@asteasolutions/zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi), gathered the trade-offs through Perplexity, and made an informed decision based on my own criteria after having all the context.

Beyond that, I used it as a copilot assistant, not as the main driver. For most PRs the inline IDE autocomplete was enough to complete the implementation quickly by myself. In more complex parts, like the query validation middleware, I also used Perplexity and Cursor to help me reach the approach I liked the most, but without delegating the full implementation to them. For easier tasks to automate, like writing tests once I had the testing strategy clear, I let Cursor write some of them and then reviewed.

## Architecture and project structure

I moved away from the original monolithic `server.ts` into a modular layout in #16 and kept that shape from there on. Each file has a single responsibility, and the Express app creation is decoupled from the server binding: `createApp()` builds and wires the app, `server.ts` only binds the port and owns the process lifecycle (graceful shutdown, signals). That split (done in #31) is what makes the HTTP tests possible without ever opening a socket.

| Layer      | Files             | Responsibility                                         |
| ---------- | ----------------- | ------------------------------------------------------ |
| Server     | `server.ts`       | Bind port, lifecycle (graceful shutdown, signals)      |
| App        | `app.ts`          | Build Express app, wire middleware and routes          |
| Routes     | `*.routes.ts`     | Define endpoints, validate query, type the response    |
| Service    | `*.service.ts`    | Business logic: filter/score/sort, distance            |
| Repository | `*.repository.ts` | Data access: fetch flights, airport lookup             |
| Schema     | `*.schema.ts`     | Zod schemas = validation + inferred types at the edges |
| Shared     | `shared/**`       | Errors, middleware, logger, haversine                  |
| Config     | `config/env.ts`   | Typed env, validated once at startup                   |

```mermaid
flowchart TD
  client[Client] --> server[server.ts<br/>bind + lifecycle]
  server --> app[app.ts<br/>createApp + middleware]
  app --> routes[flight.routes.ts]
  routes -->|withValidatedQuery| schema[Zod schemas]
  routes --> fsvc[flight.service.ts]
  fsvc --> frepo[flight.repository.ts]
  fsvc --> asvc[airport.service.ts]
  asvc --> arepo[airport.repository.ts]
  asvc --> hav[haversine.ts]
  app --> err[errorHandler middleware]
```

The same modular shape pays off in the **tests**: pure logic (haversine, filter/score/sort, distance) is unit-tested in isolation, and the wired app is tested end-to-end with `supertest`, no running server needed. See the [Testing](#testing) section above.
