/** A link that takes a wikidata object ID, and becomes
 * a link to the wikidata object.
 * @param wikidataId The Wikidata ID of the object to link to, eg. Q1094194
 * @param children The children to render.
 * @returns A link to the wikidata object, eg https://www.wikidata.org/wiki/Q1094194
 */
export function LinkToWikidataObject({
  wikidataId,
  children,
}: {
  wikidataId: string;
  children: React.ReactNode;
}): React.ReactNode {
  return <a href={`https://www.wikidata.org/wiki/${wikidataId}`} target="_blank"
    rel="noopener noreferrer">{children}</a>
}