const excludeNonSealedSurfaces = `["surface"!~"^(dirt|gravel|unpaved|ground|compacted|fine_gravel|shells|rock|pebblestone|earth|grass|sand)$"]`;
/**
 * Excludes shared paths like prince alfred park
 */
export const generateDedicatedCyclewaysQuery = (relationId: number) => `
  [out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"~"cycleway"]${excludeNonSealedSurfaces}["segregated"!="no"]["foot"!~"designated|yes"]["access"!="no"];

  way(area.region)["cycleway"="track"]${excludeNonSealedSurfaces};
  way(area.region)["cycleway:right"="track"]${excludeNonSealedSurfaces};
  way(area.region)["cycleway:left"="track"]${excludeNonSealedSurfaces};


  // https://wiki.openstreetmap.org/wiki/Key:cycleway:buffer
  way(area.region)["cycleway"="lane"]["cycleway:buffer"]["cycleway:buffer"!~"^(0|no)$"];
  way(area.region)["cycleway:right"="lane"]["cycleway:buffer"]["cycleway:right:buffer"!~"^(0|no)$"];
  way(area.region)["cycleway:left"="lane"]["cycleway:buffer"]["cycleway:left:buffer"!~"^(0|no)$"];
);
out geom;
`;

export const generateSharedPathsQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"="footway"]["bicycle"="yes"]${excludeNonSealedSurfaces};
  way(area.region)["highway"="cycleway"]["segregated"="no"]${excludeNonSealedSurfaces};
way(area.region)["highway"="cycleway"][!"segregated"]["foot"~"yes|designated"]${excludeNonSealedSurfaces};
);
out geom;
  `;


// To exclude underground 
// ["level"!~"-"]["layer"!~"-"]';

/** Selects common road types, excluding link roads */
const highwaySelector = `["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service)$"]`

const inaccessibleWays = `["access"!~"^(private|permissive)$"]`;
/** Select roads that are publicly accessibly and not driveways */
const roadsQuerySelector = `${highwaySelector}${inaccessibleWays}["service"!="driveway"]`;


export const generateSafeStreetsQuery = (relationId: number) => `
  [out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)${roadsQuerySelector}["maxspeed"~"^(5|10|15|20|25|30)$"];
  way(area.region)["highway"="living_street"][!"maxspeed"]${inaccessibleWays};
);
out geom;
`

export const generateRoadsQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)${roadsQuerySelector};
);
out geom;
`;

/**
 * includes living streets. doesn't include pedestrian malls or cycleways
 */
export const generateOnewayRoadsQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)${roadsQuerySelector}["oneway"="yes"];
);
out geom;
`;
/**
 * includes living streets. doesn't include pedestrian malls or cycleways
 */
export const generateBidiectionalRoadsQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)${roadsQuerySelector}["oneway"!="yes"];
);
out geom;
`;


// way(area.region)["highway"~"motorway|trunk|primary|secondary|tertiary|unclassified|residential|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link|living_street|service"]["access"!="private"]["service"!="driveway"]["level"!~"-1|-2"];

export const generateOnRoadCycleLanes = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["cycleway"="lane"];
  way(area.region)["cycleway:left"="lane"];
  way(area.region)["cycleway:right"="lane"];
);
out geom;
`;

export const generateProposedCyclewaysQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"="proposed"]["proposed"="cycleway"];
  way(area.region)["proposed:highway"="cycleway"];
);
out geom;
`;
export const generateUnderConstructionCyclewaysQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"="construction"]["construction"="cycleway"];
  way(area.region)["construction:highway"="cycleway"];
);
out geom;
`;

export const generateAllCouncilsQuery = (relationId: number) => `
[out:json][timeout:25];
rel(${relationId});map_to_area->.searchArea;
(
  relation["admin_level"="6"](area.searchArea);
);
out tags;
`;

export const generateRelationInfoQuery = (relationId: number) => `
[out:json][timeout:25];
relation(${relationId});
out tags;
`;

/** Generate an overpass turbo query that returns info on multiple relations. Takes in an array of OSM relation IDs. */
export const generateRelationsInfoQuery = (relationIds: number[]) =>
  `[out:json];${relationIds.map((id) => `relation(${id});out tags;`).join('')}`;

export const generateRelationPointsQuery = (relationId: number) => `
[out:json];
relation(${relationId});   // Replace RELATION_ID with the actual ID of the relation
way(r);                 // Retrieves all ways in the relation
(._;>;);                // Recursively retrieves all nodes in these ways
out body;               // Outputs the result
`;
// [out:json];
//         relation(${relationId});
//         way(r);
//         node(w);
//         out;