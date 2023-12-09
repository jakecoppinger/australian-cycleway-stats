export const generateSafeStreetsQuery = (relationId: number) => `
  [out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["maxspeed"~"^(10|20|30)$"]["highway"]["access"!="private"];
  way(area.region)["highway"="living_street"][!"maxspeed"]["access"!="private"];
);
out geom;
`

/**
 * Excludes shared paths like prince alfred park
 */
export const generateDedicatedCyclewaysQuery = (relationId: number) => `
  [out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"~"cycleway"]["segregated"!="no"]["foot"!~"designated|yes"]["surface"!="dirt"]["surface"!="gravel"]["access"!="no"];
);
out geom;
`;

export const generateSharedPathsQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"="footway"]["bicycle"="yes"];
  way(area.region)["highway"="cycleway"]["segregated"="no"];
way(area.region)["highway"="cycleway"][!"segregated"]["foot"~"yes|designated"];
);
out geom;
  `;


/**
 * includes living streets. doesn't include pedestrian malls or cycleways
 */
export const generateRoadsQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service})$"]["access"!="private"]["service"!="driveway"]["level"!~"-"]["layer"!~"-"];
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
  way(area.region)["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service})$"]["access"!="private"]["service"!="driveway"]["level"!~"-"]["layer"!~"-"]["oneway"="yes"];
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
  way(area.region)["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service})$"]["access"!="private"]["service"!="driveway"]["level"!~"-"]["layer"!~"-"]["oneway"!="yes"];
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
);
out geom;
`;
export const generateUnderConstructionCyclewaysQuery = (relationId: number) => `
[out:json];
rel(${relationId});map_to_area->.region;
(
  way(area.region)["highway"="construction"]["construction"="cycleway"];
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