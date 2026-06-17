import { getDistanceBetweenAirports } from '../../../src/modules/airport/airport.service';
import * as haversine from '../../../src/shared/lib/haversine';

const MOCKED_DISTANCE_MILES = 1234.5;
const haversineDistanceMilesMock = jest
  .spyOn(haversine, 'haversineDistanceMiles')
  .mockReturnValue(MOCKED_DISTANCE_MILES);

describe('getDistanceBetweenAirports', () => {
  it('should return null when the origin code is missing', () => {
    expect(getDistanceBetweenAirports(undefined, 'JFK')).toBeNull();
    expect(getDistanceBetweenAirports('', 'JFK')).toBeNull();
    expect(haversineDistanceMilesMock).not.toHaveBeenCalled();
  });

  it('should return null when the destination code is missing', () => {
    expect(getDistanceBetweenAirports('JFK', undefined)).toBeNull();
    expect(getDistanceBetweenAirports('JFK', '')).toBeNull();
    expect(haversineDistanceMilesMock).not.toHaveBeenCalled();
  });

  it('should return null when the origin airport is not found', () => {
    expect(getDistanceBetweenAirports('XXX', 'JFK')).toBeNull();
    expect(haversineDistanceMilesMock).not.toHaveBeenCalled();
  });

  it('should return null when the destination airport is not found', () => {
    expect(getDistanceBetweenAirports('JFK', 'ZZZ')).toBeNull();
    expect(haversineDistanceMilesMock).not.toHaveBeenCalled();
  });

  it('should return the haversine distance when both airports exist', () => {
    const distance = getDistanceBetweenAirports('JFK', 'LHR');

    expect(distance).toBe(MOCKED_DISTANCE_MILES);
    expect(haversineDistanceMilesMock).toHaveBeenCalledWith(
      expect.objectContaining({ iataCode: 'JFK' }),
      expect.objectContaining({ iataCode: 'LHR' }),
    );
  });

  it('should resolve airport codes case-insensitively when lowercased airport codes are provided', () => {
    const distance = getDistanceBetweenAirports('jfk', 'lhr');

    expect(distance).toBe(MOCKED_DISTANCE_MILES);
    expect(haversineDistanceMilesMock).toHaveBeenCalledWith(
      expect.objectContaining({ iataCode: 'JFK' }),
      expect.objectContaining({ iataCode: 'LHR' }),
    );
  });
});
