import React, { Fragment, useEffect, useState } from "react";
import "../App.css";
import { GeneratedCouncilData } from "../types";
import dataByCouncil from "../data/data-by-council.json";
import internationalAreas from "../data/international-areas.json";
import { LinkToOverpassQuery } from "../components/LinkToOverpassQuery";
import styled from '@emotion/styled'

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
      <PageTitle>Australian<br></br>CYCLEWAY<br></br>STATS.</PageTitle>
      <div>
        <HeadingBylineContainer>
          <h3>
          This dashboard provides an in-depth look at the kilometres of cycleways
          and safe streets in every Australian council, encompassing current,
          under-construction, and proposed projects, as well as international benchmarks.
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
              href="https://mastodon.jakecoppinger.com/@jake"
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

          <p><b>Data license & how to reference:</b> If you use this data, please reference as "© Australian Cycleway Stats, OpenStreetMap contributors" or "Source: Australian Cycleway Stats, OpenStreetMap contributors".</p>
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
              href="https://mastodon.jakecoppinger.com/@jake"
            >
              Mastodon (@jake@jakecoppinger.mastodon.com)
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
        <CouncilTable dataByCouncil={internationalAreas}></CouncilTable>
        <PageHeading>Australian councils</PageHeading>
        <p>
          These rows are generated by finding all OSM relations with{" "}
          <code>admin_level=6</code>, which generally correspond to council
          boundaries.
        </p>
        <CouncilTable dataByCouncil={dataByCouncil}></CouncilTable>

        <p>If you want smartphone navigation directions using this data, see blog post <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://jakecoppinger.com/2020/07/the-best-apps-for-bicycle-directions/">
          The Best Apps for Bicycle Directions (2020)</a>.</p>
        <footer id="footer">
          <PageHeading>Notes on methodology</PageHeading>
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
              footpaths in footpath cycling legal councils are tagged with <code>bicycle=yes</code>
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
          </ul>
          <PageHeading>
            Possible future improvements
          </PageHeading>
          <p>PRs welcome!</p>
          <ul>
            <li>
              Add aliases for unfamiliar names (Centrum is Amsterdam-Centrum)
            </li>
            <li>Improve categorisation of international examples</li>
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
        </footer>
      </div>
    </Fragment>
  );
};

const CouncilTable = ({
  dataByCouncil,
}: {
  dataByCouncil: GeneratedCouncilData[];
}) => {
  return (
    <table>
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
        {dataByCouncil
          .filter(row => row.roadsLength > 0)
          .map((row) => (
            <CouncilTableRow key={row.relationId} row={row} />
          ))}
      </tbody>
    </table>
  );
};

const CouncilTableRow = ({ row }: { row: GeneratedCouncilData }) => {
  const {
    // relationInfoQuery,
    councilName,
    councilNameEnglish,
    dedicatedCyclewaysLength,
    dedicatedCyclewaysQuery,
    roadsLength,
    roadsQuery,
    sharedPathsLength,
    sharedPathsQuery,
    onRoadCycleLanesQuery,
    onRoadCycleLanesLength,

    cyclewaysToRoadsRatio,
    safePathsToRoadsRatio,
    underConstructionCyclewaysLength,
    underConstructionCyclewaysQuery,
    proposedCyclewaysLength,
    proposedCyclewaysQuery,
    safeStreetsLength,
    safeStreetsQuery,
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
      <td>{formatPopulation(wikidataPopulation)}</td>

      <td>{formatRatio(safePathsToRoadsRatio)}</td>
      <td>{formatRatio(safeRoadsToRoadsRatio)}</td>

      <td>{formatRatio(cyclewaysToRoadsRatio)}</td>

      <td>
        <LinkToOverpassQuery queryStr={roadsQuery}>
          {formatLengthInKm(roadsLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={safeStreetsQuery}>
          {formatLengthInKm(safeStreetsLength)}
        </LinkToOverpassQuery>
      </td>

      <td>
        <LinkToOverpassQuery queryStr={dedicatedCyclewaysQuery}>
          {formatLengthInKm(dedicatedCyclewaysLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={sharedPathsQuery}>
          {formatLengthInKm(sharedPathsLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={onRoadCycleLanesQuery}>
          {formatLengthInKm(onRoadCycleLanesLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={underConstructionCyclewaysQuery}>
          {formatLengthInKm(underConstructionCyclewaysLength)}
        </LinkToOverpassQuery>
      </td>
      <td>
        <LinkToOverpassQuery queryStr={proposedCyclewaysQuery}>
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
  console.log(children);
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
