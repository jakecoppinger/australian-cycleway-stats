import * as turf from '@turf/turf';
import * as fs from 'fs';

import {
  cachedOverpassTurboRequest
} from "./api/overpass.js";

import { config } from './config.js';

import {
  generateDedicatedCyclewaysQuery,
  generateAllCouncilsQuery,
  generateOnRoadCycleLanes,
  generateProposedCyclewaysQuery,
  generateRelationInfoQuery,
  generateRelationPointsQuery,
  generateRoadsQuery,
  generateSafeStreetsQuery,
  generateSharedPathsQuery,
  generateUnderConstructionCyclewaysQuery,
  generateOnewayRoadsQuery,
  generateBidiectionalRoadsQuery,
  generateRelationsInfoQuery,
} from "./utils/overpass-queries.js";
import { RelationStatsObject, StatsFile } from './shared-types.js';
import { OSMNode, OSMRelation, OSMWay } from "./types.js";
import { getLengthOfAllWays, getWarnings } from "./utils/osm-geometry-utils.js";
import { cachedFunctionCall } from './utils/cached-function-call.js';
import { getArea, getPopulation } from './api/wikidata.js';

const jsonRelativeOutputPath = '../frontend/src/data/'

const internationalExampleRelationIds = [
  47811, // Amsterdam (level 8)
  11960504, // Amsterdam city (suburb)
  2192363, // Copenhagen (admin 7)
  7426387, // Bogotá (admin 7)
  2186660, // Frederiksberg,
  7444, // Paris (level 8)
  20727, // Paris 1st Arrondissement
  5750005, // All Sydney
  4246124, // All Melbourne
  2354197, // ACT
  44915, // Milan (level 8)
  8398124, // Manhattan (level 7)
];

/**
 * Function that takes an object and saves it to a JSON file.
 */
async function saveObjectToJsonFile(object: StatsFile, fileName: string) {
  if (object === undefined) {
    throw new Error('Cannot save undefined object to JSON');
  }
  const writeFile = fs.promises.writeFile;
  const jsonString = JSON.stringify(object);
  await writeFile(fileName, jsonString);
}

/**
 * Not yet working
 */
async function generateCouncilArea(relationId: number, overpassEndpoint: string): Promise<number> {
  const relationPoints = await cachedOverpassTurboRequest({
    request: generateRelationPointsQuery(relationId),
    overpassEndpoint
  }) as (OSMNode | OSMWay)[];
  const coords = (relationPoints
    .filter((node) => node.type === 'node') as OSMNode[])
    .filter((node) => {
      if (node.lat && node.lon) {
        return true
      } else {
        console.log(`Node ${node.id} is missing lat or lon`);
        return false
      }
    })
    .map((node) => [node.lon, node.lat])
  coords.push(coords[0]);
  const polygon = turf.polygon([coords]);
  const councilArea = turf.area(polygon);
  return councilArea;
}


/**
 * Genrates the roads query and makes an Overpass request, then returns the length of all roads.
 */
async function generateRoadsLength(relationId: number, overpassEndpoint: string): Promise<number> {
  // const onewayRoads = await cachedOverpassTurboRequest(generateOnewayRoadsQuery(relationId)) as OSMWay[];
  // const bidirectionalRoads = await cachedOverpassTurboRequest(generateBidiectionalRoadsQuery(relationId)) as OSMWay[];
  // return (getLengthOfAllWays(onewayRoads) / 2) + getLengthOfAllWays(bidirectionalRoads);

  const roads = await cachedOverpassTurboRequest({ request: generateRoadsQuery(relationId), overpassEndpoint }) as OSMWay[];
  return getLengthOfAllWays(roads);
}

const outlierRelationIds: number[] = [
  16694855, // Kings park - it's only park, no houses or buildings
  11716544, // Darwin Waterfront Precinct Municipality - only a port
]

async function relationsToSummaries(relations: OSMRelation[], overpassEndpoint: string): Promise<StatsFile> {
  const allCouncils = relations
    .map(
      (relation) => ({
        relationId: relation.id,
        name: relation.tags.name, wikipedia: relation.tags.wikipedia,
        wikidata: relation.tags.wikidata
      }))
    // Filter out outlier relation IDs
    .filter((relation) => !outlierRelationIds.includes(relation.relationId))
    .filter((relation) => !config.debug || relation.name === "Council of the City of Sydney")

  /**
   * Used for generating queries. This number is then replaced on the frontend to generate
   * queries for a given relation ID.
   */
  const magicRelationNumber = 999999;
  const overpassQueryStrings: Record<string, string> = {
    dedicatedCyclewaysQuery: generateDedicatedCyclewaysQuery(magicRelationNumber),
    allCouncilsQuery: generateAllCouncilsQuery(magicRelationNumber),
    onRoadCycleLanesQuery: generateOnRoadCycleLanes(magicRelationNumber),
    proposedCyclewaysQuery: generateProposedCyclewaysQuery(magicRelationNumber),
    relationInfoQuery: generateRelationInfoQuery(magicRelationNumber),
    relationPointsQuery: generateRelationPointsQuery(magicRelationNumber),
    roadsQuery: generateRoadsQuery(magicRelationNumber),
    safeStreetsQuery: generateSafeStreetsQuery(magicRelationNumber),
    sharedPathsQuery: generateSharedPathsQuery(magicRelationNumber),
    underConstructionCyclewaysQuery: generateUnderConstructionCyclewaysQuery(magicRelationNumber),
    onewayRoadsQuery: generateOnewayRoadsQuery(magicRelationNumber),
    bidirectionalRoadsQuery: generateBidiectionalRoadsQuery(magicRelationNumber),
    relationsInfoQuery: generateRelationsInfoQuery([magicRelationNumber]),
  };

  let dataByCouncil: RelationStatsObject[] = [];
  for (let i = 0; i < allCouncils.length; i++) {
    const councilStartTime = Date.now();
    const council = allCouncils[i];
    const { relationId, wikipedia, wikidata } = council;
    const wikidataPopulation: number | null = wikidata
      ? await cachedFunctionCall(wikidata, getPopulation) || null
      : null;
    let wikidataArea: number | null = null;

    try {
      if (wikidata) {
        wikidataArea = await cachedFunctionCall(wikidata, getArea);
      }
    } catch (error) {
      console.error(`Error fetching area data (won't be cached):`, error);
    }

    const councilArea = await generateCouncilArea(relationId, overpassEndpoint);

    const relationInfoQuery = generateRelationInfoQuery(relationId);
    const dedicatedCyclewaysQuery = generateDedicatedCyclewaysQuery(relationId)
    // const roadsQuery = generateRoadsQuery(relationId)
    const onRoadCycleLanesQuery = generateOnRoadCycleLanes(relationId)
    const underConstructionCyclewaysQuery = generateUnderConstructionCyclewaysQuery(relationId);

    // 4x. Parallel requests
    const relationInfoPromise = cachedOverpassTurboRequest({ request: relationInfoQuery, overpassEndpoint })
    const dedicatedCyclewaysPromise = cachedOverpassTurboRequest({ request: dedicatedCyclewaysQuery, overpassEndpoint })
    const onRoadCycleLanesPromise = cachedOverpassTurboRequest({ request: onRoadCycleLanesQuery, overpassEndpoint })
    const underConstructionCyclewaysLengthPromise = cachedOverpassTurboRequest({ request: underConstructionCyclewaysQuery, overpassEndpoint })


    const relationInfo = (await relationInfoPromise)[0] as OSMRelation;
    const councilName = relationInfo.tags.name || '(area missing name)';
    const councilNameEnglish = relationInfo.tags['name:en'];
    const dedicatedCyclewaysLength = getLengthOfAllWays( await dedicatedCyclewaysPromise as OSMWay[]);
    const onRoadCycleLanesLength = getLengthOfAllWays( await onRoadCycleLanesPromise as OSMWay[]);
    const underConstructionCyclewaysLength = getLengthOfAllWays( await underConstructionCyclewaysLengthPromise as OSMWay[])


    // 1x request
    const roadsLength = await generateRoadsLength(relationId, overpassEndpoint);


    const sharedPathsQuery = generateSharedPathsQuery(relationId)
    const proposedCyclewaysQuery = generateProposedCyclewaysQuery(relationId);
    const safeStreetsQuery = generateSafeStreetsQuery(relationId);


    // 3x. parallel requests
    const sharedPathsPromise = cachedOverpassTurboRequest({ request: sharedPathsQuery, overpassEndpoint })
    const proposedCyclewaysPromise = cachedOverpassTurboRequest({ request: proposedCyclewaysQuery, overpassEndpoint })
    const safeStreetsPromise = cachedOverpassTurboRequest({ request: safeStreetsQuery, overpassEndpoint })

    const sharedPathsLength = getLengthOfAllWays( await sharedPathsPromise as OSMWay[] )
    const proposedCyclewaysLength = getLengthOfAllWays( await proposedCyclewaysPromise as OSMWay[])
    const safeStreetsLength = getLengthOfAllWays( await safeStreetsPromise as OSMWay[] )

    const safeRoadsToRoadsRatio = roadsLength > 0
      ? safeStreetsLength / roadsLength : null;

    const cyclewaysToRoadsRatio = roadsLength > 0
      ? dedicatedCyclewaysLength / roadsLength : null;

    const safePathsToRoadsRatio = roadsLength > 0
      ? (dedicatedCyclewaysLength + sharedPathsLength + safeStreetsLength) / roadsLength
      : null;

    const separatedCyclewayLengthPerResident = wikidataPopulation
      ? dedicatedCyclewaysLength / wikidataPopulation
      : null;

    const separatedCyclewayMetresPerSquareKilometre = wikidataArea
      ? dedicatedCyclewaysLength / wikidataArea
      : null;

    const generatedCouncilData: RelationStatsObject = {
      councilName, relationId, dedicatedCyclewaysLength, roadsLength,
      onRoadCycleLanesLength, sharedPathsLength,
      cyclewaysToRoadsRatio, safePathsToRoadsRatio, councilArea,
      underConstructionCyclewaysLength,
      proposedCyclewaysLength,
      safeStreetsLength, wikipedia, wikidata, wikidataPopulation,
      safeRoadsToRoadsRatio, councilNameEnglish,
      separatedCyclewayLengthPerResident,
      separatedCyclewayMetresPerSquareKilometre,
      wikidataId: wikidata,
    };

    dataByCouncil.push(generatedCouncilData);

    const councilEndTime = Date.now();
    const councilDuration = councilEndTime - councilStartTime;
    console.log(`Generated data for ${councilName} in ${councilDuration}ms`);
  }


  const sortedDataByCouncil = dataByCouncil.sort((a, b) => {
    if (a.safePathsToRoadsRatio === null) {
      return 0;
    }
    if (b.safePathsToRoadsRatio === null) {
      return 0;
    }
    return b.safePathsToRoadsRatio - a.safePathsToRoadsRatio;
  });

  return { areas: sortedDataByCouncil, overpassQueryStrings };
}

/**
 * Request all councils in Australia, then:
 * - request data for each council and cache the results of the Overpass request into a JSON file.
 * - crunch all the numbers for all the councils and output a JSON file.
 *
 * Shouldn't be run in parallel with other functions to generate data if they use the same Overpass
 * endpoint (to limit load).
 */
async function generateAustalianData() {
  const overpassEndpoint = config.overpassApiEndpoints.australia
  // const nswRelationId = 2316593; // If needed for deubg
  const australiaRelationId = 80500;
  const allCouncilsQuery = generateAllCouncilsQuery(australiaRelationId);
  const allCouncilRaw = await cachedOverpassTurboRequest({ request: allCouncilsQuery, overpassEndpoint }) as OSMRelation[];

  const sortedDataByCouncil = await relationsToSummaries(allCouncilRaw, overpassEndpoint);

  await saveObjectToJsonFile(
    sortedDataByCouncil,
    `${jsonRelativeOutputPath}australian-data-by-council.json`,
  );
  console.log("Saved australian-data-by-council.json");
}

/**
 * Request specific (hardcoded) relations of interest around the world, then:
 * - request data for each relation and cache the results of the Overpass request into a JSON file.
 * - crunch all the numbers for all the relations and output a JSON file.
 *
 * Shouldn't be run in parallel with other functions to generate data if they use the same Overpass
 * endpoint (to limit load).
 */
async function generateInternationalData() {
  const overpassEndpoint = config.overpassApiEndpoints.default;
  const internationalExampleRelationsQuery = generateRelationsInfoQuery(internationalExampleRelationIds);
  const internationalRelations = await cachedOverpassTurboRequest({ request: internationalExampleRelationsQuery, overpassEndpoint }) as OSMRelation[];
  const internationalAreasSummaries = await relationsToSummaries(internationalRelations, overpassEndpoint);
  await saveObjectToJsonFile(
    internationalAreasSummaries,
    `${jsonRelativeOutputPath}international-areas.json`,
  );
}

async function main() {
  console.log("Starting generation!");
  console.log(`Note: you can Ctrl-C at any time and you won't waste much time - each post request
    is cached and will be reused on the next run. Data generation from cached requests is quick.`);

  /**
   * Only run in parallel if the Australian endpoint is different to the international one,
   * we're not in debug mode, and we're not skipping data generation.
   */
  const runInParallel =
    config.overpassApiEndpoints.australia !== config.overpassApiEndpoints.default
    && !config.debug
    && config.skipRegeneratingAustralianData === false
    && config.skipRegeneratingInternationalData === false;

  if (runInParallel) {
    console.log('Running Australian & international requests in parallel...');
    await Promise.all([
      generateAustalianData(),
      generateInternationalData()
    ]);
    console.log('All parallel tasks done!');
  } else {
    console.log('Running Australian & international requests in series...');
    if (!config.skipRegeneratingAustralianData) {
      await generateAustalianData();
    } else {
      console.log('Skipping Australian data generation');
    }

    if (!config.skipRegeneratingInternationalData) {
      await generateInternationalData();
    } else {
      console.log('Skipping international data generation');
    }
    console.log('Done sequential runs!');
  }
  console.log(`Experienced ${getWarnings().length} warnings.`)
  console.log(`Offending way IDs:\n${getWarnings().map((warning) => warning.wayId).join(', ')}`);
}

main();

// population sort
// const sortedDataByCouncil = dataByCouncil.sort((a, b) => {
//   if(a.wikidataPopulation === null) {
//     return 0;
//   }
//   if(b.wikidataPopulation === null) {
//     return 0;
//   }
//   return b.wikidataPopulation - a.wikidataPopulation;
// });
