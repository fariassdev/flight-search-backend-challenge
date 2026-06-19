import request from 'supertest';
import { createApp } from '../../../src/app';
import * as flightRepository from '../../../src/modules/flight/flight.repository';
import { buildFlight } from '../../fixtures/flights';

const app = createApp();

describe('GET /api/flights/search', () => {
  it('should return a sorted flight list when the search endpoint is called', async () => {
    const flights = [
      buildFlight('AA', '2026-06-01T08:00:00Z', 3),
      buildFlight('BB', '2026-06-01T14:00:00Z', 6),
      buildFlight('CC', '2026-06-01T18:00:00Z', 4),
      buildFlight('DD', '2026-06-01T22:00:00Z', 5),
    ];
    jest.spyOn(flightRepository, 'fetchFlights').mockResolvedValue(flights);

    const response = await request(app)
      .get('/api/flights/search')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.count).toBe(4);
    expect(response.body.flights).toHaveLength(4);

    const scores = response.body.flights.map(
      (flight: { score: number }) => flight.score,
    );
    expect(scores).toEqual([3, 4, 5, 6]);
  });

  it('should rank preferred airline flights first when preferredAirline is provided', async () => {
    // Equal duration, AA should win by the 0.9 multiplier
    const flights = [
      buildFlight('AA', '2026-06-01T10:00:00Z', 5),
      buildFlight('BB', '2026-06-01T11:00:00Z', 5),
    ];
    jest.spyOn(flightRepository, 'fetchFlights').mockResolvedValue(flights);

    const response = await request(app)
      .get('/api/flights/search?preferredAirline=AA')
      .expect(200);

    expect(response.body.flights[0]).toMatchObject({
      carrier: 'AA',
      score: 4.5,
    });
    expect(response.body.flights[1]).toMatchObject({ carrier: 'BB', score: 5 });
  });

  it('should return fewer flights when maxDuration filters out long routes', async () => {
    const flights = [
      buildFlight('AA', '2026-06-01T08:00:00Z', 3),
      buildFlight('BB', '2026-06-01T14:00:00Z', 6),
      buildFlight('CC', '2026-06-01T18:00:00Z', 4),
      buildFlight('DD', '2026-06-01T22:00:00Z', 5),
    ];
    jest.spyOn(flightRepository, 'fetchFlights').mockResolvedValue(flights);

    const unfiltered = await request(app)
      .get('/api/flights/search')
      .expect(200);
    const filtered = await request(app)
      .get('/api/flights/search?maxDuration=4')
      .expect(200);

    expect(filtered.body.count).toBeLessThan(unfiltered.body.count);
    expect(filtered.body.count).toBe(2);
  });
});
