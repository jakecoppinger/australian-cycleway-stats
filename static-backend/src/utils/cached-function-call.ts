import { OSMNode, OSMRelation, OSMWay } from "../types.js";
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
/**
 * Cached based on input string - if function is different and input is the same, it will clash
 */
export async function cachedFunctionCall(input: string, fn: (s: string) => Promise<any>): Promise<any> {
  const hash = createHash('md5').update(input).digest('hex');
  const cachePath = path.join('./cache', `${hash}.json`);

  // Check if the cache file exists
  if (fs.existsSync(cachePath)) {
    // Read the cache file
    const data = fs.readFileSync(cachePath, 'utf-8');
    return JSON.parse(data);
  } else {
    // Generate new data
    const data = await fn(input);

    // Save the data to cache
    fs.writeFileSync(cachePath, JSON.stringify(data), 'utf-8');

    return data;
  }
}