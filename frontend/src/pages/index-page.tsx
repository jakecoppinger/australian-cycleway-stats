import React, { Fragment } from "react";
import styled from '@emotion/styled'
import 'sortable-tablesort/sortable.min.css'
import 'sortable-tablesort/sortable.min.js'

import "../App.css";
import dataByCouncil from "../data/australian-data-by-council.json";
import internationalAreas from "../data/international-areas.json";
import { LinkToOverpassQuery } from "../components/LinkToOverpassQuery";
import { StatsFile, RelationStatsObject } from "../shared-types";

const PageTitle = styled.h1`
  font-weight: bold;
  line-height: 0.8;
  display: block;
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-style: normal;
  font-weight: 700;
  margin-left: -15px;
  margin-top: 15px;
  margin-bottom: 0px;
  color: black;
  text-transform: uppercase;

  font-size: 70px;

  @media (max-width: 500px) {
    font-size: 50px;
  }
`;
const PageHeading = styled.h2`
    text-transform: uppercase;
  `;

const HeadingBylineContainer = styled.div`
  max-width: 800px;
`;

const GreyTextContainer = styled.div`
  max-width: 800px;
  opacity: 0.8;
`;

export const IndexPageComponent = () => {

  return (
    <Fragment>
      <PageTitle>Australian<br></br>Cycleway<br></br>Stats.</PageTitle>
      <div>
        <HeadingBylineContainer>
          <h3>
            This dashboard provides an in-depth look at the length of cycle paths
            and safe streets in every Australian council, encompassing current,
            under-construction, proposed projects, along with international benchmarks.
          </h3>
        </HeadingBylineContainer>
        <GreyTextContainer>

          <p>Click on any statistic to open a map with the relevant paths.</p>

          <p><b>If you spot any data errors:</b> Contact <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://jakecoppinger.com"
          >
            Jake Coppinger</a> via <a href="mailto:jake@jakecoppinger.com">email</a>,{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://mastodon.social/@jakecoppinger"
            >Mastodon</a>, or <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/jakecoppinger/australian-cycleway-stats/issues">create a Github issue</a>.
            The issue may be in the query (ie. in <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/jakecoppinger/australian-cycleway-stats/blob/main/static-backend/src/utils/overpass-queries.ts"
            >
              overpass-queries.ts</a>) or in the OSM data itself. You can edit OSM yourself at <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://openstreetmap.org">openstreetmap.org</a>
            {" "}
            or find a volunteer in your area to update it at <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://wiki.openstreetmap.org/wiki/Australian_Mapping_Community">wiki.openstreetmap.org/wiki/Australian_Mapping_Community</a>
            {" "}(or ping me if you're in Sydney).</p>
          <p>
            <b>Data quality:</b> All data (excluding population info) is generated from the{" "}
            <a href="https://openstreetmap.org">OpenStreetMap</a> dataset{" "}
            which is licensed{" "}
            <a href="https://opendatacommons.org/licenses/odbl/">ODbL</a> (open
            source). Note that this data changes over time (as does the real world) and the query itself might change.
            Data is crowdsourced and offers no accuracy guarantees
            (but is usually more accurate than government data and Google Maps). Notably:
          </p>
          <ul>
            <li>
              Transport for NSW <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://wiki.openstreetmap.org/wiki/TfNSW">employs contributors</a> and utilise it for routing & the basemap on the
              {" "}<a href="https://transportnsw.info/trip">TfNSW Trip Planner</a>
            </li>
            <li>
              The Department of Transport and Planning (Victoria) has <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://wiki.openstreetmap.org/wiki/Department_of_Transport_and_Planning_(Victoria,_Australia)">
                taken the
                strategic step</a> of adopting OSM as the primary data source for the
              network maps; road, rail, train, tram and cycling:
              <blockquote>
                "As part of this decision the department has accepted that the
                use encompasses the responsibility to maintain and enhance the
                mapping content to the highest standard for all users of OSM"
              </blockquote>
            </li>
          </ul>

          <p>
            <b>Data license & how to reference:</b> If you use this data, please reference as "Source: Australian Cycleway Stats, OpenStreetMap contributors" or "© Australian Cycleway Stats, OpenStreetMap contributors".</p>
          <p>
            <b>Author:</b> This is a side project by{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://jakecoppinger.com"
            >
              Jake Coppinger
            </a> and is open source (AGPL-3.0) on{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/jakecoppinger/australian-cycleway-stats"
            >
              Github
            </a>
            . You can follow me on{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://mastodon.social/@jakecoppinger"
            >
              Mastodon
            </a>{" "}
            for future updates.
          </p>
        </GreyTextContainer>

        <PageHeading>City averages and international examples</PageHeading>
        <p>
          Note: The{" "}
          <i>
            Shared paths + legal footpaths + dedicated cycleways + safe roads /
            roads length (%){" "}
          </i>{" "}
          column can go above 100% as it includes non-road paths!
        </p>
        <p>See <a href="#notes-on-methodology">Notes on methodology</a> section for more details
        on what is and isn't included in each metric.</p>
        <CouncilTable dataByCouncil={internationalAreas}></CouncilTable>
        <PageHeading>Australian councils</PageHeading>
        <p>
          These rows are generated by finding all OSM relations with{" "}
          <code>admin_level=6</code>, which generally correspond to council
          boundaries.
        </p>
        <p>See <a href="#notes-on-methodology">Notes on methodology</a> section for more details
        on what is and isn't included in each metric.</p>
        <CouncilTable dataByCouncil={dataByCouncil}></CouncilTable>

        <p>If you want smartphone navigation directions using this data, see blog post <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://jakecoppinger.com/2020/07/the-best-apps-for-bicycle-directions/">
          The Best Apps for Bicycle Directions (2020)</a>.</p>
        <footer id="footer">
          <a id="notes-on-methodology"><PageHeading>Notes on methodology</PageHeading></a>
          <ul>
            <li>One-way cycleways are not counted any differently to bidirectional cycleways (for simplicity)</li>
            <li>Dual carriageway roads are currently "double counted"
              <ul>
                <li>
                  However one-way cycleways that might be adjacent also are
                </li>
                <li>In the case of areas with more dual carriageway roads than cycleways this inflates the measured road length</li>
                <li>
                  The correct behaviour here is not clear; halving the measured length of roads with <code>dual_carriageway=yes</code> roads
                  might make sense, but this might also necessitate halving the measured length of oneway cycleways.
                  However, oneway cycleways are common in contexts outside of dual carriageway roads (eg. contraflow)
                </li>
                <li>I'm open to improvements on this method!</li>
              </ul>
            </li>
            <li>Footpaths that allow bicycles are not currently included as "shared paths". Not all
              footpaths in footpath cycling legal councils are tagged with <code>bicycle=yes</code>{" "}
              and I haven't yet built functionality to categorise councils by state (and therefore legality).</li>
            <ul>
              <li>
                I'm somewhat concerned of the data quality of footpaths tagged with <code>bicycle=yes</code> in NSW -
                I think some of them are technically illegal to cycle on or should be tagged as a pedestrian street. See <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://overpass-turbo.eu/s/1FMP">overpass-turbo.eu/s/1FMP</a> for these cases.
              </li>
            </ul>
            <li>Substantial lengths of separated cycleways in rural councils may be false positives
               due to mountain bike trails incorrectly tagged as cycleways (cycleways with
               non-sealed surfaces are excluded). Viewing the map of dedicated cycleways can
               quickly identify these issues.</li>
          </ul>
          <PageHeading>
            Possible future improvements
          </PageHeading>
          <p>PRs welcome!</p>
          <ul>
            <li>Improve categorisation of international examples</li>
            <li>Add state of each council example</li>
            <li>Include length of contraflow streets</li>
            <li>Allow filtering based on various columns</li>
          </ul>

          <p>
            A side project by{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://jakecoppinger.com"
            >
              Jake Coppinger
            </a>
            . Open source (AGPL-3.0) on{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/jakecoppinger/australian-cycleway-stats"
            >
              Github
            </a>
            .
          </p>
          <p>Last full data cache invalidation of cycleway data on 2024-11-08. All data has been fetched
            from Overpass/OSM since then. Currently no guarantee it has <i>not</i> been updated since then
            due to partial cache invalidation via cache misses on the hashed query (in case of query
            changes). PRs welcome to improve versioning consistency!</p>
        </footer>
      </div>
    </Fragment>
  );
};

const CouncilTable = ({
  dataByCouncil,
}: {
  dataByCouncil: StatsFile;
}) => {
  return (
    <table className="sortable">
      <thead>
        <tr>
          <th>Council name</th>
          <th>Population (Wikidata)</th>
          <th>
            Shared paths + dedicated cycleways + safe roads /
            roads length (%)
          </th>
          <th>Safe roads length / roads length (%)</th>
          <th>Dedicated cycleways length / roads length (%)</th>
          <th>Roads (non-offramp/link) (km)</th>
          <th>{"Safe roads (≤30km/h) (km)"}</th>
          <th>Dedicated cycleways (km)</th>
          <th>Shared paths (km)</th>
          <th>On road lanes ("dooring lane") (km)</th>
          <th>Under construction cycleways (km)</th>
          <th>Proposed cycleways (km)</th>
        </tr>
      </thead>
      <tbody>
        {dataByCouncil.areas
          .filter(row => row.roadsLength > 0)
          .map((row) => (
            <CouncilTableRow key={row.relationId} overpassQueryStrings={dataByCouncil.overpassQueryStrings} row={row} />
          ))}
      </tbody>
    </table>
  );
};

function hydrateQueryString(query: string, relationId: number): string {
  const magicRelationNumber = 999999;
  // Replace instances of the magic number in the query with the relationId
  return query.replace(magicRelationNumber.toString(), relationId.toString());
}

function generateQueryOrUndefined(queryName: string, relationId: number, overpassQueryStrings: Record<string, string>): string | undefined {
  return overpassQueryStrings[queryName] ? hydrateQueryString(overpassQueryStrings[queryName], relationId) : undefined
}

const CouncilTableRow = ({ row, overpassQueryStrings }: { row: RelationStatsObject, overpassQueryStrings: Record<string,string> }) => {
  const {
    // relationInfoQuery,
    councilName,
    councilNameEnglish,
    dedicatedCyclewaysLength,
    roadsLength,
    sharedPathsLength,
    onRoadCycleLanesLength,
    cyclewaysToRoadsRatio,
    safePathsToRoadsRatio,
    underConstructionCyclewaysLength,
    proposedCyclewaysLength,
    safeStreetsLength,
    wikipedia,
    wikidataPopulation,
    relationId,
    safeRoadsToRoadsRatio,
  } = row;




  return (
    <tr>
      <td>
        <RelationLink relationId={relationId}>{councilNameEnglish && councilNameEnglish !== councilName ? `${councilNameEnglish} (${councilName})` : councilName}</RelationLink>{" "}
        {wikipedia ? (
          <WikipediaLink articleName={wikipedia}>(Wikipedia)</WikipediaLink>
        ) : null}
      </td>
      <td data-sort={wikidataPopulation}>{formatPopulation(wikidataPopulation)}</td>

      <td data-sort={safePathsToRoadsRatio}>{formatRatio(safePathsToRoadsRatio)}</td>
      <td data-sort={safeRoadsToRoadsRatio}>{formatRatio(safeRoadsToRoadsRatio)}</td>

      <td data-sort={cyclewaysToRoadsRatio}>{formatRatio(cyclewaysToRoadsRatio)}</td>

      <td>
        <LinkToOverpassQuery queryStr={generateQueryOrUndefined("roadsQuery", relationId, overpassQueryStrings)}>
          {formatLengthInKm(roadsLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={generateQueryOrUndefined("safeStreetsQuery", relationId, overpassQueryStrings)}>
          {formatLengthInKm(safeStreetsLength)}
        </LinkToOverpassQuery>
      </td>

      <td>
        <LinkToOverpassQuery queryStr={generateQueryOrUndefined("dedicatedCyclewaysQuery", relationId, overpassQueryStrings)}>
          {formatLengthInKm(dedicatedCyclewaysLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={generateQueryOrUndefined("sharedPathsQuery", relationId, overpassQueryStrings)}>
          {formatLengthInKm(sharedPathsLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={generateQueryOrUndefined("onRoadCycleLanesQuery", relationId, overpassQueryStrings)}>
          {formatLengthInKm(onRoadCycleLanesLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={generateQueryOrUndefined("underConstructionCyclewaysQuery", relationId, overpassQueryStrings)}>
          {formatLengthInKm(underConstructionCyclewaysLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={generateQueryOrUndefined("proposedCyclewaysQuery", relationId, overpassQueryStrings)}>
          {formatLengthInKm(proposedCyclewaysLength)}
        </LinkToOverpassQuery>
      </td>
    </tr>
  );
};

function formatLengthInKm(lengthInMetres: number): string {
  return `${(lengthInMetres / 1000).toFixed(2)}`;
}

function formatRatio(ratio: number | null): string {
  if (ratio === null) {
    return "N/A";
  }
  return `${(ratio * 100).toFixed(1)}%`;
}

/** Takes an area in square metres and formats it in square kilometres  */
function formatArea(areaInSquareMetres: number): string {
  return `${(areaInSquareMetres / 1000000).toFixed(1)} km²`;
}
/** Links to an opensreetmap relation, and renders children */
function RelationLink({
  relationId,
  children,
}: {
  relationId: number;
  children: React.ReactNode;
}) {
  const lookup: Record<string, string> = { 'Centrum': 'Amsterdam (Centrum)' }
  const name = lookup[children as string] || children as string
  return (
    <a
      href={`https://openstreetmap.org/relation/${relationId}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {name}
    </a>
  );
}

function WikipediaLink({
  articleName,
  children,
}: {
  articleName: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`https://en.wikipedia.org/wiki/${articleName}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

/**
 * Format a population number
 * Adds a thousands separator.
 */
function formatPopulation(population: number | null): string {
  if (population === null) {
    return "(no data)";
  }
  // Add thousands separator to population number and returns it as a string
  return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
