import type { Coordinates } from '../coordinates/coordinates.schema';

const EARTH_RADIUS_MILES = 3958.756;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineRadians(angleRadians: number): number {
  const halfAngle = angleRadians / 2;
  return Math.sin(halfAngle) ** 2;
}

export function haversineDistanceMiles(from: Coordinates, to: Coordinates): number {
  const deltaLatRadians = toRadians(to.latitude - from.latitude);
  const deltaLonRadians = toRadians(to.longitude - from.longitude);
  const originLatRadians = toRadians(from.latitude);
  const destinationLatRadians = toRadians(to.latitude);

  const haversineOfCentralAngle =
    haversineRadians(deltaLatRadians) +
    Math.cos(originLatRadians) *
    Math.cos(destinationLatRadians) *
    haversineRadians(deltaLonRadians);

  const centralAngleRadians =
    2 * Math.asin(Math.sqrt(Math.min(1, haversineOfCentralAngle)));

  return EARTH_RADIUS_MILES * centralAngleRadians;
}
