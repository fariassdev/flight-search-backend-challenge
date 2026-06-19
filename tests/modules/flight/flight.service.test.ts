import * as airportService from '../../../src/modules/airport/airport.service';
import * as flightRepository from '../../../src/modules/flight/flight.repository';
import { searchFlights } from '../../../src/modules/flight/flight.service';
import { buildFlight } from '../../fixtures/flights';

const MOCKED_DISTANCE_MILES = 100;

describe('searchFlights', () => {
  beforeEach(() => {
    jest
      .spyOn(airportService, 'getDistanceBetweenAirports')
      .mockReturnValue(MOCKED_DISTANCE_MILES);
  });

  it('should sort flights by ascending score when no preferred airline is given', async () => {
    const flights = [
      buildFlight('AA', '2026-06-01T08:00:00Z', 3),
      buildFlight('BB', '2026-06-01T14:00:00Z', 6),
      buildFlight('CC', '2026-06-01T18:00:00Z', 4),
      buildFlight('DD', '2026-06-01T22:00:00Z', 5),
    ];
    jest.spyOn(flightRepository, 'fetchFlights').mockResolvedValue(flights);

    const results = await searchFlights({ filters: {} });

    expect(results.map((flight) => flight.carrier)).toEqual([
      'AA',
      'CC',
      'DD',
      'BB',
    ]);
    expect(results.map((flight) => flight.score)).toEqual([3, 4, 5, 6]);
  });

  it('should apply a 0.9 score multiplier when the carrier matches the preferred airline', async () => {
    const flights = [buildFlight('AA', '2026-06-01T14:00:00Z', 6)];
    jest.spyOn(flightRepository, 'fetchFlights').mockResolvedValue(flights);

    const results = await searchFlights({
      filters: {},
      preferredAirline: 'AA',
    });

    expect(results[0]).toMatchObject({
      carrier: 'AA',
      duration: 6,
      score: 5.4,
    });
  });

  it('should keep a shorter non-preferred flight first when its raw score is still lower', async () => {
    const flights = [
      buildFlight('AA', '2026-06-01T08:00:00Z', 3),
      buildFlight('BB', '2026-06-01T14:00:00Z', 6),
      buildFlight('CC', '2026-06-01T18:00:00Z', 4),
    ];
    jest.spyOn(flightRepository, 'fetchFlights').mockResolvedValue(flights);

    const results = await searchFlights({
      filters: {},
      preferredAirline: 'BB',
    });

    expect(results.map((flight) => flight.carrier)).toEqual(['AA', 'CC', 'BB']);
  });

  it('should rank a preferred airline flight first when its discounted score beats competitors', async () => {
    // Equal duration, AA should win by the 0.9 multiplier
    const flights = [
      buildFlight('AA', '2026-06-01T10:00:00Z', 5),
      buildFlight('BB', '2026-06-01T11:00:00Z', 5),
    ];
    jest.spyOn(flightRepository, 'fetchFlights').mockResolvedValue(flights);

    const results = await searchFlights({
      filters: {},
      preferredAirline: 'AA',
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ carrier: 'AA', score: 4.5 });
    expect(results[1]).toMatchObject({ carrier: 'BB', score: 5 });
  });

  it('should return enriched flights with duration distance and score when search completes', async () => {
    const flights = [
      buildFlight('AA', '2026-06-01T08:00:00Z', 3),
      buildFlight('BB', '2026-06-01T14:00:00Z', 6),
      buildFlight('CC', '2026-06-01T18:00:00Z', 4),
      buildFlight('DD', '2026-06-01T22:00:00Z', 5),
    ];
    jest.spyOn(flightRepository, 'fetchFlights').mockResolvedValue(flights);

    const results = await searchFlights({ filters: {} });

    expect(results).toHaveLength(flights.length);
    for (const flight of results) {
      expect(flight).toMatchObject({
        duration: expect.any(Number),
        distance: MOCKED_DISTANCE_MILES,
        score: expect.any(Number),
      });
    }
  });
});
