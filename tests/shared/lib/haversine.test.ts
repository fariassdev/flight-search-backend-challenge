import { haversineDistanceMiles } from '../../../src/shared/lib/haversine';

const airports = {
  jfk: { latitude: 40.63980103, longitude: -73.77890015 },
  lga: { latitude: 40.77719879, longitude: -73.87259674 },
  ord: { latitude: 41.9786, longitude: -87.9048 },
  lhr: { latitude: 51.4706, longitude: -0.461941 },
  cdg: { latitude: 49.012798, longitude: 2.55 },
  gru: { latitude: -23.435556411743164, longitude: -46.47305679321289 },
  dyr: { latitude: 64.734902, longitude: 177.740997 },
  ome: { latitude: 64.51219940185547, longitude: -165.44500732421875 },
} as const;

const DEFAULT_TOLERANCE_MILES = 0.3;

// This could be a custom Jest matcher, but for simplicity, we'll just use a helper function here.
function expectDistanceBeCloseTo(actual: number, expected: number, toleranceMiles = DEFAULT_TOLERANCE_MILES) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(toleranceMiles);
}

describe('haversineDistanceMiles', () => {
  it('should return 0 miles when both coordinates refer to the same airport', () => {
    const distance = haversineDistanceMiles(airports.jfk, airports.jfk);
    expect(distance).toBe(0);
  });

  it('should return the same distance when given the same coordinates in reverse order', () => {
    const distance1 = haversineDistanceMiles(airports.jfk, airports.lhr);
    const distance2 = haversineDistanceMiles(airports.lhr, airports.jfk);
    expect(distance1).toEqual(distance2);
  });

  it('should calculate correct distance when airports are close (JFK to LGA)', () => {
    const distance = haversineDistanceMiles(airports.jfk, airports.lga);
    expectDistanceBeCloseTo(distance, 10.7);
  });

  it('should calculate correct distance when airports are at medium distance (JFK to ORD)', () => {
    const distance = haversineDistanceMiles(airports.jfk, airports.ord);
    expectDistanceBeCloseTo(distance, 738.1);
  });

  it('should calculate correct distance when airports are distant (JFK to LHR)', () => {
    const distance = haversineDistanceMiles(airports.jfk, airports.lhr);
    expectDistanceBeCloseTo(distance, 3442.2);
  });

  it('should calculate correct distance when crossing the Prime Meridian (LHR to CDG)', () => {
    const distance = haversineDistanceMiles(airports.lhr, airports.cdg);
    expectDistanceBeCloseTo(distance, 216);
  });

  it('should calculate correct distance when crossing the equator (JFK to GRU)', () => {
    const distance = haversineDistanceMiles(airports.jfk, airports.gru);
    expectDistanceBeCloseTo(distance, 4762.2);
  });

  it('should calculate correct distance when crossing the 180th meridian (DYR to OME)', () => {
    const distance = haversineDistanceMiles(airports.dyr, airports.ome);
    expectDistanceBeCloseTo(distance, 496.7);
  });

  it('should calculate correct distance between Antipodes (North Pole to South Pole)', () => {
    const northPole = { latitude: 90, longitude: 0 };
    const southPole = { latitude: -90, longitude: 0 };
    const distance = haversineDistanceMiles(northPole, southPole);
    expectDistanceBeCloseTo(distance, 12436.8);
  });

  it('should calculate correct distance from Null Island (0, 0) to JFK', () => {
    const nullIsland = { latitude: 0, longitude: 0 };
    const distance = haversineDistanceMiles(nullIsland, airports.jfk);
    expectDistanceBeCloseTo(distance, 5372.84);
  });
});

