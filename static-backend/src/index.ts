import * as turf from '@turf/turf';
import * as fs from 'fs';

import {
  cachedOverpassTurboRequest
} from "./api/overpass.js";

import { config } from './config.js';
const { regenerateAustralianData, regenerateInternationalData } = config;

import {
  generateDedicatedCyclewaysQuery,
  generateAllCouncilsQuery,
  generateOnRoadCycleLanes, generateProposedCyclewaysQuery, generateRelationInfoQuery, generateRelationPointsQuery, generateRoadsQuery, generateSafeStreetsQuery, generateSharedPathsQuery, generateUnderConstructionCyclewaysQuery, generateOnewayRoadsQuery, generateBidiectionalRoadsQuery, generateRelationsInfoQuery,
} from "./utils/overpass-queries.js";

import { GeneratedCouncilData, OSMNode, OSMRelation, OSMWay } from "./types.js";
import { getLengthOfAllWays } from "./utils/osm-geometry-utils.js";
import { cachedFunctionCall } from './utils/cached-function-call.js';
import { getPopulation } from './api/wikidata.js';

const jsonRelativeOutputPath = '../frontend/src/data/'

/**
 * Function that takes an object and saves it to a JSON file.
 */
async function saveObjectToJsonFile(object: any, fileName: string) {
  const writeFile = fs.promises.writeFile;
  const jsonString = JSON.stringify(object);
  await writeFile(fileName, jsonString);
}

// only for debug
const councilOsmRelationIds =
  [
    1251066, // City of sydney
    2404870, // city of melbourne
  ]

async function generateCouncilArea(relationId: number): Promise<number> {
  const relationPoints = await cachedOverpassTurboRequest(generateRelationPointsQuery(relationId)) as (OSMNode | OSMWay)[];
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


async function generateRoadsLength(relationId: number): Promise<number> {
  // const onewayRoads = await cachedOverpassTurboRequest(generateOnewayRoadsQuery(relationId)) as OSMWay[];
  // const bidirectionalRoads = await cachedOverpassTurboRequest(generateBidiectionalRoadsQuery(relationId)) as OSMWay[];
  // return (getLengthOfAllWays(onewayRoads) / 2) + getLengthOfAllWays(bidirectionalRoads);

  const roads = await cachedOverpassTurboRequest(generateRoadsQuery(relationId)) as OSMWay[];
  return getLengthOfAllWays(roads);
}

const outlierRelationIds: number[] = [
  16694855, // Kings park
  11716544, // Darwin Waterfront Precinct Municipality
]

async function relationsToSummaries(relations: OSMRelation[]): Promise<GeneratedCouncilData[]> {

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



  let dataByCouncil: GeneratedCouncilData[] = [];
  for (let i = 0; i < allCouncils.length; i++) {
    const council = allCouncils[i];
    const { relationId, wikipedia, wikidata } = council;
    const wikidataPopulation: number | null = wikidata
      ? await cachedFunctionCall(wikidata, getPopulation) || null
      : null;

    const councilArea = await generateCouncilArea(relationId);

    const relationInfoQuery = generateRelationInfoQuery(relationId);
    const relationInfo = (await cachedOverpassTurboRequest(relationInfoQuery))[0] as OSMRelation;
    const councilName = relationInfo.tags.name || '(area missing name)';
    const councilNameEnglish = relationInfo.tags['name:en'];

    const dedicatedCyclewaysQuery = generateDedicatedCyclewaysQuery(relationId)
    const dedicatedCyclewaysLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(dedicatedCyclewaysQuery) as OSMWay[]
    )
    const roadsQuery = generateRoadsQuery(relationId)
    const roadsLength = await generateRoadsLength(relationId);

    const onRoadCycleLanesQuery = generateOnRoadCycleLanes(relationId)
    const onRoadCycleLanesLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(onRoadCycleLanesQuery) as OSMWay[]
    )
    const sharedPathsQuery = generateSharedPathsQuery(relationId)
    const sharedPathsLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(sharedPathsQuery) as OSMWay[]
    )


    const underConstructionCyclewaysQuery = generateUnderConstructionCyclewaysQuery(relationId);
    const underConstructionCyclewaysLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(underConstructionCyclewaysQuery) as OSMWay[]
    )

    const proposedCyclewaysQuery = generateProposedCyclewaysQuery(relationId);
    const proposedCyclewaysLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(proposedCyclewaysQuery) as OSMWay[]
    )

    const safeStreetsQuery = generateSafeStreetsQuery(relationId);
    const safeStreetsLength = getLengthOfAllWays(
      await cachedOverpassTurboRequest(safeStreetsQuery) as OSMWay[]
    )

    const safeRoadsToRoadsRatio = roadsLength > 0
      ? safeStreetsLength / roadsLength : null;

    const cyclewaysToRoadsRatio = roadsLength > 0
      ? dedicatedCyclewaysLength / roadsLength : null;

    const safePathsToRoadsRatio = roadsLength > 0
      ? (dedicatedCyclewaysLength + sharedPathsLength + safeStreetsLength) / roadsLength
      : null;


    // const waysLength = generateWayLengthLookup(rawData);
    // const waysStats = generateWayLengthStats(rawData, waysLength);

    const generatedCouncilData: GeneratedCouncilData = {
      councilName, relationId, dedicatedCyclewaysLength, roadsLength,
      onRoadCycleLanesLength, sharedPathsLength,
      dedicatedCyclewaysQuery, roadsQuery, onRoadCycleLanesQuery, sharedPathsQuery,
      cyclewaysToRoadsRatio, safePathsToRoadsRatio, councilArea,
      underConstructionCyclewaysQuery, underConstructionCyclewaysLength, 
      proposedCyclewaysLength, proposedCyclewaysQuery,
      safeStreetsQuery, safeStreetsLength, wikipedia, wikidata, wikidataPopulation,
      safeRoadsToRoadsRatio, councilNameEnglish
    };

    dataByCouncil.push(generatedCouncilData);
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

  return sortedDataByCouncil;
}

async function main() {
  console.log("Starting generation...");
  if (regenerateAustralianData) {
    // NSW: 2316593

    const nswRelationId = 2316593;
    const australiaRelationId = 80500;
    const allCouncilsQuery = generateAllCouncilsQuery(australiaRelationId);
    const allCouncilRaw = await cachedOverpassTurboRequest(allCouncilsQuery) as OSMRelation[];

    const sortedDataByCouncil = await relationsToSummaries(allCouncilRaw);

    await saveObjectToJsonFile(
      sortedDataByCouncil,
      `${jsonRelativeOutputPath}data-by-council.json`,
    );
    console.log("Saved data-by-council.json");
  } else {
    console.log('Skipping Australian data generation');
  }


  if (regenerateInternationalData) {
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
    ]
    const internationalExampleRelationsQuery = generateRelationsInfoQuery(internationalExampleRelationIds);
    const internationalRelations = await cachedOverpassTurboRequest(internationalExampleRelationsQuery) as OSMRelation[];
    const internationalAreasSummaries = await relationsToSummaries(internationalRelations);
    await saveObjectToJsonFile(
      internationalAreasSummaries,
      `${jsonRelativeOutputPath}international-areas.json`,
    );
  } else {
    console.log('Skipping international data generation');
  }
  console.log('done!');
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
