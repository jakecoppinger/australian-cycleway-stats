import { config } from "../config.js";
import { OSMNode, OSMRelation, OSMWay } from "../types.js";
import { cachedFunctionCall } from "../utils/cached-function-call.js";

export async function cachedOverpassTurboRequest(input: string): Promise<(OSMNode | OSMWay | OSMRelation)[]> {
  return cachedFunctionCall(input, overpassTurboRequest);
}


export async function overpassTurboRequest(request: string): Promise<(OSMNode | OSMWay | OSMRelation)[]> {
  const apiUrl = config.overpassApi
  console.log(`Started POST request at ${new Date().toISOString()}`);

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
