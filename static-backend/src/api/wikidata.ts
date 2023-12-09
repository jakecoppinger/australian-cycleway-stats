function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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