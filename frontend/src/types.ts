export interface GeneratedCouncilData {
  "councilName": string;
  "relationId": number;
  "dedicatedCyclewaysLength": number;
  "roadsLength": number;
  "onRoadCycleLanesLength": number;
  "sharedPathsLength": number;
  "dedicatedCyclewaysQuery": string;
  "roadsQuery": string;
  "onRoadCycleLanesQuery": string;
  "sharedPathsQuery": string;
  cyclewaysToRoadsRatio: number | null,
  /** Includes dedicated cycleways, shared paths, and safe streets */
  safePathsToRoadsRatio: number | null,

  safeRoadsToRoadsRatio: number | null,
  sharedPathsToRoadsRatio: number | null,

  /** In sq metres. Not yet working */
  councilArea: number

  underConstructionCyclewaysQuery: string
  underConstructionCyclewaysLength: number
  proposedCyclewaysLength: number
  proposedCyclewaysQuery: string


  safeStreetsQuery: string
  safeStreetsLength: number,
  wikipedia?: string | undefined
  wikidata?: string | undefined
  wikidataPopulation: number | null
}

export interface OSMWay {
  type: "way",
  id: number,
  nodes: number[],
  geometry: { lat: number, lon: number }[],
  tags: {
    highway?: string,
    maxspeed?: string,
    lanes?: string,
    lit?: string,
    name?: string,
    oneway?: string,
    sidewalk?: string,
    source?: string,
    width?: string,
    bicycle?: string,
    surface?: string,
  },

  bounds: {
    minlat: number,
    minlon: number,
    maxlat: number,
    maxlon: number,
  }
}

export interface OSMRelation {
  type: "relation",
  id: number,
  tags: {
    name?: string,
    type?: string,
    boundary?: string,
    admin_level?: string,
    ref?: string,
    place?: string,
    source?: string,
    wikidata?: string,
    wikipedia?: string,
  },
}
export interface OSMNode {
  type: "node",
  id: number,
  lat: number,
  lon: number,
  tags: {
  },
}