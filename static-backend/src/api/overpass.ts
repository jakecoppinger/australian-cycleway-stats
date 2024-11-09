import { config } from "../config.js";
import { OSMNode, OSMRelation, OSMWay } from "../types.js";
import { cachedFunctionCall } from "../utils/cached-function-call.js";

export async function cachedOverpassTurboRequest({ request, overpassEndpoint }: 
  { request: string, overpassEndpoint: string }): Promise<(OSMNode | OSMWay | OSMRelation)[]> {
  return cachedFunctionCall({request, overpassEndpoint}, robustOverpassTurboRequest);
}

/**
 * Repeatedly call `overpassTurboRequest` up to `maxTries` times until it succeeds.
 */
export async function robustOverpassTurboRequest({ request, overpassEndpoint, maxTries=2 }: { request: string, overpassEndpoint: string, maxTries?: number }): Promise<(OSMNode | OSMWay | OSMRelation)[]> {
  let tries = 0;
  while (true) {
    try {
      return await overpassTurboRequest({ request, overpassEndpoint });
    } catch (e) {
      tries++;
      if (tries >= maxTries) {
        console.error(`Failed to fetch data after ${maxTries} attempts.`);
        throw e;
      }
      console.error(`Failed to fetch data on attempt ${tries} of ${maxTries}, retrying...`);
    }
  }
}

export async function overpassTurboRequest({ request, overpassEndpoint }: { request: string, overpassEndpoint: string }): Promise<(OSMNode | OSMWay | OSMRelation)[]> {
  const apiUrl = overpassEndpoint ? overpassEndpoint : config.overpassApiEndpoints.default
  console.log(`Started POST request to ${overpassEndpoint} at ${new Date().toISOString()}...`);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: request,
  });

  if (!response.ok) {
    console.error(`Request: ${request}`);
    throw new Error(`Fetch error: ${response.statusText}`);
  }

  const textResponse = await response.text();
  try {
    const jsonResponse = JSON.parse(textResponse);
    return jsonResponse.elements as (OSMNode | OSMWay)[];
  } catch (e) {
    console.error(`Request: ${request}`);
    console.error(`Response: ${textResponse}`);
    throw new Error('Failed to parse response as JSON:' + e);
  }
}
