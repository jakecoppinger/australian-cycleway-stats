// This file is copied from the backend to frontend code at compile time.

export interface StatsFile {
  /** One per row. Can be a city, council or any relation in OSM. */
  areas: RelationStatsObject[],
  /** Map of query names to overpass queries */
  overpassQueryStrings: Record<string, string>,
}

/** Object containing all fields for a given relation */
export interface RelationStatsObject {
  councilName: string;
  councilNameEnglish?: string | undefined,

  relationId: number;

  dedicatedCyclewaysLength: number;
  roadsLength: number;
  onRoadCycleLanesLength: number;
  sharedPathsLength: number;

  cyclewaysToRoadsRatio: number | null,
  /** Includes dedicated cycleways, shared paths, and safe streets */
  safePathsToRoadsRatio: number | null,
  safeRoadsToRoadsRatio: number | null,

  /** In sq metres. Not yet working */
  councilArea: number

  underConstructionCyclewaysLength: number
  proposedCyclewaysLength: number
  safeStreetsLength: number,

  wikipedia?: string | undefined
  wikidata?: string | undefined
  wikidataPopulation: number | null
}
