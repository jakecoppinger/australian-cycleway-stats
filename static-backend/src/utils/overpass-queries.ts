const excludeNonSealedSurfaces = `["surface"!~"^(dirt|gravel|unpaved|ground|compacted|fine_gravel|shells|rock|pebblestone|earth|grass|sand)$"]["mtb"!="yes"]`;

/** Selects common road types, excluding link roads. Cyclists not guaranteed to be able to use them (eg. highway=pedestrian) */
const highwaySelector = `["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service|pedestrian)$"]`

const excludeInaccessible = `["access"!~"^(private|permissive|no)$"]`;

/** Select roads that are publicly accessibly and not driveways. Cyclists not guaranteed to be able to use them (eg. highway=pedestrian)  */
const roadsQuerySelector = `${highwaySelector}${excludeInaccessible}["service"!~"^(driveway|parking_aisle)$"]`;

export const generateOnRoadCycleLanes = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  // Include on road painted lanes only if...
  // ...there is not tag that they are not segregated from traffic...
  way(area.region)["cycleway"="lane"]["cycleway:separation"!~".*"];
  // ...if they are segrgated, it's only by a painted line
  way(area.region)["cycleway"="lane"]["cycleway:separation"]["cycleway:separation"!~"^(no|solid_line|dashed_line)$"];

  // Similar for left / right / both variants.

  way(area.region)["cycleway:left"="lane"]["cycleway:separation"!~".*"];
  way(area.region)["cycleway:left"="lane"]["cycleway:left:separation"]["cycleway:left:separation"!~"^(no|solid_line|dashed_line)$"];

  way(area.region)["cycleway:right"="lane"]["cycleway:separation"!~".*"];
  way(area.region)["cycleway:right"="lane"]["cycleway:right:separation"]["cycleway:right:separation"!~"^(no|solid_line|dashed_line)$"];

  way(area.region)["cycleway:both"="lane"]["cycleway:separation"!~".*"];
  way(area.region)["cycleway:both"="lane"]["cycleway:both:separation"]["cycleway:both:separation"!~"^(no|solid_line|dashed_line)$"];
);
out geom;
`;

export const generateDedicatedCyclewaysQuery = (relationId: number) => `
  [out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"~"cycleway"]${excludeNonSealedSurfaces}["segregated"!="no"]["foot"!~"designated|yes"]${excludeInaccessible};

  way(area.region)["cycleway"="track"]["segregated"!="no"]["foot"!~"designated|yes"]${excludeInaccessible}${excludeNonSealedSurfaces};
  way(area.region)["cycleway:right"="track"]${excludeNonSealedSurfaces};
  way(area.region)["cycleway:left"="track"]${excludeNonSealedSurfaces};
  way(area.region)["cycleway:both"="track"]${excludeNonSealedSurfaces};

  // No longer includes painted lanes with painted buffer space (but no physical separator)
  // Eg: 110kph Princes Motorway and only paint: https://www.openstreetmap.org/way/5067683

  // Include painted lane ONLY if there is some sort of physical separator...
  // These might include car parking/bollards/flex posts/bumps/planters etc
  // See https://wiki.openstreetmap.org/wiki/Key:cycleway:separation
  way(area.region)["cycleway"="lane"]["cycleway:separation"]["cycleway:separation"!~"^(no|solid_line|dashed_line)$"];
  way(area.region)["cycleway:left"="lane"]["cycleway:left:separation"]["cycleway:right:separation"!~"^(no|solid_line|dashed_line)$"];
  way(area.region)["cycleway:right"="lane"]["cycleway:right:separation"]["cycleway:right:separation"!~"^(no|solid_line|dashed_line)$"];
  way(area.region)["cycleway:both"="lane"]["cycleway:both:separation"]["cycleway:both:separation"!~"^(no|solid_line|dashed_line)$"];

  // ...or if there is an exclusive lane reserved for bicycles.
  // As separation is commonly not tagged (eg. Paris), only include roads where vehicle speed <= 30kmh
  // https://wiki.openstreetmap.org/wiki/Tag:cycleway:lane%3Dexclusive
  way(area.region)["cycleway:left"="lane"]["cycleway:left:lane"="exclusive"]["maxspeed"~"^(5|10|15|20|25|30)$"];
  way(area.region)["cycleway:right"="lane"]["cycleway:right:lane"="exclusive"]["maxspeed"~"^(5|10|15|20|25|30)$"];
  way(area.region)["cycleway:both"="lane"]["cycleway:both:lane"="exclusive"]["maxspeed"~"^(5|10|15|20|25|30)$"];
  way(area.region)["cycleway"="lane"]["cycleway:lane"="exclusive"]["maxspeed"~"^(5|10|15|20|25|30)$"];

  // Include paved paths designated for bicycles
  way(area.region)["highway=path"]["bicycle"="designated"]["segregated"!="no"]${excludeNonSealedSurfaces};

  // Include bicycle ramps
  way(area.region)["ramp:bicycle"="yes"];
);
out geom;
`;

export const generateSharedPathsQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  // Exclude footpath cycling for equal comparisons across states, though you could argue
  // a legal cycling footpath is as valid as a shared path. I've added a note in the copy text that
  // footpath cycling is excluded for clarity.

  // Not all footpaths in legal juristictions are tagged with bicycle=yes as well so this would be
  // incomplete without additional filters by legal juristiction.

  // There may be false negatives here, but footpaths that allow cycling and aren't a shared path
  // are somewhat rare (and are possibly tagging errors) in non-footpath cycling states.
  // See overpass-turbo.eu/s/1FMP for these cases.

  // Include shared paths
  way(area.region)["highway"="cycleway"]["segregated"="no"]${excludeNonSealedSurfaces};
  way(area.region)["highway"="cycleway"][!"segregated"]["foot"~"yes|designated"]${excludeNonSealedSurfaces};

  // Include paved paths as long as they aren't shared with pedestrians
  way(area.region)["highway=path"]["bicycle"="designated"]["segregated"="yes"]${excludeNonSealedSurfaces};

  // Include pedestrian streets tagged as explicitly allowing cycling (eg. Martin Place, Sydney)
  way(area.region)["highway"="pedestrian"]["bicycle"="yes"]${excludeNonSealedSurfaces};

  way(area.region)["cycleway"="track"]["foot"~"designated|yes"]${excludeInaccessible}${excludeNonSealedSurfaces};
  way(area.region)["cycleway"="track"]["highway"="footway"]${excludeInaccessible}${excludeNonSealedSurfaces};
);
out geom;
`;


export const generateSafeStreetsQuery = (relationId: number) => `
  [out:json];
rel(${relationId});map_to_area->.region;
(
  // Include all roads with a specified speed limit of <= 30kmh (except pedestrian streets that may disallow biycles by default)...
  way(area.region)${roadsQuerySelector}["highway"!="pedestrian"]["maxspeed"~"^(5|10|15|20|25|30)$"]
  // ...but exclude roads with an exclusive cycleway lane as this is counted as a dedicated cycleway.
  ["cycleway:left:lane"!="exclusive"]
  ["cycleway:right:lane"!="exclusive"]
  ["cycleway:lane"!="exclusive"]
  ${excludeNonSealedSurfaces};

  // Include all roads with a specified advisory speed limit of <= 30kmh.
  // Eg. Many streets are signposted 30kmh in Copenhagen.
  // This doesn't pick up corner-speed advisory signs in Australia / EU as they are likely above
  // 30kmh (and if not, are likely rejected by the bikes disallowed clause for motorway links)
  way(area.region)${roadsQuerySelector}
  ["maxspeed:advisory"~"^(30|25|20|15|10)$"]
  ["bicycle"!~"^(no|dismount)$"];

  // Include living/shared streets even if they don't have a speed limit, but not if they have a >=30 kmh speed limit
  // (living streets imply bicycle=yes)
  way(area.region)["highway"="living_street"]["maxspeed"!~"^(40|50|60|70|80)$"]${excludeInaccessible}${excludeNonSealedSurfaces};

  // Include pedestrian streets tagged as explicitly allowing cycling as long as they have an
  // advistory speed limit <= 30kmh (or no limit marked)
  // Pedestrian streets don't imply bicycle=yes (and include George Street, Sydney)
  way(area.region)["highway"="pedestrian"]["bicycle"="yes"]["maxspeed"!~"^(40|50|60|70|80)$"]${excludeNonSealedSurfaces};
  way(area.region)["highway"="pedestrian"]["bicycle"="yes"]["maxspeed:advisory"~"^(5|10|15|20|25|30)$"]${excludeNonSealedSurfaces};
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

export const generateOnewayRoadsQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)${roadsQuerySelector}["oneway"="yes"];
);
out geom;
`;

export const generateBidiectionalRoadsQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)${roadsQuerySelector}["oneway"!="yes"];
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

/**
 * FInd all councils with admin_level=6.
 * Exclude unincorporated areas.
 */
export const generateAllCouncilsQuery = (relationId: number) => `
[out:json][timeout:25];
rel(${relationId});map_to_area->.searchArea;
(
  relation["admin_level"="6"]["boundary_type"!="unincorporated area"](area.searchArea);
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
