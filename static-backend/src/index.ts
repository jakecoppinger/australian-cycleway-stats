import * as turf from '@turf/turf';
import * as fs from 'fs';

import {
  cachedOverpassTurboRequest
} from "./api/overpass.js";

import {
  generateDedicatedCyclewaysQuery,
  generateAllCouncilsQuery,
  generateOnRoadCycleLanes, generateProposedCyclewaysQuery, generateRelationInfoQuery, generateRelationPointsQuery, generateRoadsQuery, generateSafeStreetsQuery, generateSharedPathsQuery, generateUnderConstructionCyclewaysQuery, generateOnewayRoadsQuery, generateBidiectionalRoadsQuery,
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
  const jsonString = JSON.stringify(object, null, 2);
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
  const onewayRoads = await cachedOverpassTurboRequest(generateOnewayRoadsQuery(relationId)) as OSMWay[];
  const bidirectionalRoads = await cachedOverpassTurboRequest(generateBidiectionalRoadsQuery(relationId)) as OSMWay[];
  return (getLengthOfAllWays(onewayRoads) / 2) + getLengthOfAllWays(bidirectionalRoads);
}

const outlierRelationIds = [
  16694855, // Kings park
  11716544 // Darwin Waterfront Precinct Municipality
]

async function main() {
  console.log("Starting generation...");
  // NSW: 2316593
  const nswRelationId = 2316593;
  const australiaRelationId = 80500;
  const allCouncilsQuery = generateAllCouncilsQuery(australiaRelationId);
  const allCouncilRaw = await cachedOverpassTurboRequest(allCouncilsQuery) as OSMRelation[];
  const allCouncils = allCouncilRaw
    .map(
      (relation) => ({ relationId: relation.id, 
        name: relation.tags.name, wikipedia: relation.tags.wikipedia, 
        wikidata: relation.tags.wikidata }))
    // Filter out outlier relation IDs
    .filter((relation) => !outlierRelationIds.includes(relation.relationId))



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
      // , relationInfoQuery,
      cyclewaysToRoadsRatio, safePathsToRoadsRatio, councilArea,
      underConstructionCyclewaysQuery, underConstructionCyclewaysLength, proposedCyclewaysLength, proposedCyclewaysQuery,
      safeStreetsQuery, safeStreetsLength, wikipedia, wikidata, wikidataPopulation
    };

    dataByCouncil.push(generatedCouncilData);
  }


  const sortedDataByCouncil = dataByCouncil.sort((a, b) => {
    if(a.cyclewaysToRoadsRatio === null) {
      return 0;
    }
    if(b.cyclewaysToRoadsRatio === null) {
      return 0;
    }
    return b.cyclewaysToRoadsRatio - a.cyclewaysToRoadsRatio;
  });

  await saveObjectToJsonFile(
    sortedDataByCouncil,
    `${jsonRelativeOutputPath}data-by-council.json`,
  );
  console.log("Saved data-by-council.json");
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
