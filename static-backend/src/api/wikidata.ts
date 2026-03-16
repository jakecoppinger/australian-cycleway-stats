function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retrieves the area of a Wikidata item.
 * @param wikidataId The Wikidata ID of the item to get the area of.
 * @returns The area in square kilometres if found, otherwise null.
 */
export async function getArea(wikidataId: string): Promise<number | null> {
  const endpointUrl = 'https://query.wikidata.org/sparql';
  const sparqlQuery = `
   * SELECT ?area ?unitLabel WHERE {
  wd:${wikidataId} p:P2046 ?statement.
  ?statement psv:P2046 ?valueNode.
  ?valueNode wikibase:quantityAmount ?area.
  ?valueNode wikibase:quantityUnit ?unit.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 1
  `;

  const url = endpointUrl + '?query=' + encodeURIComponent(sparqlQuery) + '&format=json';

  try {
    console.log(`calling query.wikidata.org/sparql at ${new Date().toISOString()}...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'YourApp/1.0 (http://example.com/YourApp)',
        'Accept': 'application/sparql-results+json'
      }
    });
    // Rate limit a bit
    await sleep(50);

    const json = await response.json();
    const row = json.results.bindings[0]
    console.log({ row });
    const areaValue = parseFloat(row?.area?.value);
    const unitLabel = row?.unitLabel?.value;
    if(unitLabel !== 'square kilometre') {
      throw new Error(`Unsupported unit: ${unitLabel}`);
    }
    return areaValue ? areaValue : null;
  } catch (error) {
    console.error('Error fetching area data:', error);
    return null;
  }
}



export async function getPopulation(wikidataId: string): Promise<number | null> {
  const endpointUrl = 'https://query.wikidata.org/sparql';
  const sparqlQuery = `
  SELECT ?population WHERE {
      wd:${wikidataId} wdt:P1082 ?population.
  } ORDER BY DESC(?population)
  LIMIT 1`;

  const url = endpointUrl + '?query=' + encodeURIComponent(sparqlQuery) + '&format=json';

  try {
    console.log(`calling query.wikidata.org/sparql at ${new Date().toISOString()}...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'YourApp/1.0 (http://example.com/YourApp)',
        'Accept': 'application/sparql-results+json'
      }
    });
    // Rate limit a bit
    await sleep(50);

    const json = await response.json();
    const population = json.results.bindings[0]?.population.value;

    return population ? parseInt(population) : null;
  } catch (error) {
    console.error('Error fetching population data:', error);
    return null;
  }
}