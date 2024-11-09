import { OSMNode, OSMWay } from "../types";

function haversineDistance(coord1: { lat: number, lon: number }, coord2: { lat: number, lon: number }): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = degreesToRadians(coord2.lat - coord1.lat);
  const dLon = degreesToRadians(coord2.lon - coord1.lon);

  const lat1 = degreesToRadians(coord1.lat);
  const lat2 = degreesToRadians(coord2.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c; // Distance in km
  // Returned in metres, rounded to 0 decimal places
  return Math.round(km * 1000);
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

type MissingGeometryWarning = { wayId: number, missingNodes: number, errorMessage: 'missing geometry point' };
const warnings: MissingGeometryWarning[] = [];
export function storeWarning(warning: MissingGeometryWarning): void {
  warnings.push(warning);
}
export function getWarnings(): MissingGeometryWarning[] {
  return warnings;
}

export function calculateWayLength(way: OSMWay): number {
  const nonNullGeometry = way.geometry.filter((element) => element !== null);
  if (nonNullGeometry.length !== way.geometry.length) {
    console.warn(`Warning: Way ${way.id} has ${way.geometry.length - nonNullGeometry.length} missing geometry points.`);
    storeWarning({ wayId: way.id, errorMessage: 'missing geometry point',
      missingNodes: way.geometry.length - nonNullGeometry.length });
  }

  if (nonNullGeometry.length < 2) {
    return 0;
  }
  let totalDistance = 0;
  let { lat: prevLat, lon: prevLon } = nonNullGeometry[0];

  for (let i = 1; i < nonNullGeometry.length; i++) {
    const { lat, lon } = nonNullGeometry[i];
    const distance = haversineDistance({ lat: prevLat, lon: prevLon }, { lat: lat, lon: lon });
    prevLat = lat;
    prevLon = lon;
    totalDistance += distance;
  }
  return totalDistance;
}

export function generateWayLengthLookup(rawData: OSMWay[]): Record<number, number> {
  const wayLengthLookup: Record<number, number> = {};
  for (let i = 0; i < rawData.length; i++) {
    const way = rawData[i];
    wayLengthLookup[way.id] = calculateWayLength(way);
  }
  return wayLengthLookup;
}

export function getLengthOfAllWays(rawData: OSMWay[]): number {
  return rawData
    .map((element) => calculateWayLength(element as OSMWay))
    .reduce((a, b) => a + b, 0);
}
export function getLengthOfAllWaysInLookup(wayLengthLookup: Record<number, number>): number {
  return Object.values(wayLengthLookup)
    .reduce((a, b) => a + b, 0);
}


export interface WayLengthStat {
  name: string;
  length: number;
}
/** Function that takes the raw data and way length lookup record object and returns an array.
 * The array contains the name of each way (if it exists) and the length of the way in descending order,
 * almost like a CSV.
 */
export function generateWayLengthStats(rawData: OSMWay[], wayLengthLookup: Record<number, number>): WayLengthStat[] {
  const wayLengthStats: WayLengthStat[] = [];
  for (let i = 0; i < rawData.length; i++) {
    const way = rawData[i];
    const length = wayLengthLookup[way.id];
    const name = way.tags.name || "";
    wayLengthStats.push({ name, length });
  }
  return wayLengthStats;
}