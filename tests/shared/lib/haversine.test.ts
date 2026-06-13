import { haversineDistanceMiles } from '../../../src/shared/lib/haversine';

const airports = {
  jfk: { latitude: 40.63980103, longitude: -73.77890015 },
  lga: { latitude: 40.77719879, longitude: -73.87259674 },
  ord: { latitude: 41.9786, longitude: -87.9048 },
  lhr: { latitude: 51.4706, longitude: -0.461941 },
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

  it('should return roughly 10.7 miles when given JFK and LGA coordinates', () => {
    const distance = haversineDistanceMiles(airports.jfk, airports.lga);
    expectDistanceBeCloseTo(distance, 10.7);
  });

  it('should return roughly 738.1 miles when given JFK and ORD coordinates', () => {
    const distance = haversineDistanceMiles(airports.jfk, airports.ord);
    expectDistanceBeCloseTo(distance, 738.1);
  });

  it('should return roughly 3442.2 miles when given JFK and LHR coordinates', () => {
    const distance = haversineDistanceMiles(airports.jfk, airports.lhr);
    expectDistanceBeCloseTo(distance, 3442.2);
  });

  it('should return the same distance when given the same coordinates in reverse order', () => {
    const distance1 = haversineDistanceMiles(airports.jfk, airports.lhr);
    const distance2 = haversineDistanceMiles(airports.lhr, airports.jfk);
    expect(distance1).toEqual(distance2);
  });

  it('should throw an error for invalid latitudes', () => {
    const invalidLat = { latitude: 95, longitude: 0 };
    expect(() => haversineDistanceMiles(airports.jfk, invalidLat)).toThrow('Latitude must be between -90 and 90');
  });

  it('should throw an error for invalid longitudes', () => {
    const invalidLon = { latitude: 0, longitude: 190 };
    expect(() => haversineDistanceMiles(airports.jfk, invalidLon)).toThrow('Longitude must be between -180 and 180');
  });
});

