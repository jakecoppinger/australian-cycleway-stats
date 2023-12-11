import React, { useEffect, useState } from "react";
import "../App.css";
import { GeneratedCouncilData } from "../types";
import dataByCouncil from "../data/data-by-council.json";
import internationalAreas from "../data/international-areas.json";
import { LinkToOverpassQuery } from "../components/LinkToOverpassQuery";

export const IndexPageComponent = () => {
  return (
    <div>
      <h1>Australian Cycleway Stats</h1>
      <p>
        This is very much a work in progress - take these stats with a grain of
        salt!
      </p>
      <p>
        Click on a statistic link to see a map with the relevant objects (it
        will open{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://wiki.openstreetmap.org/wiki/Overpass_turbo"
        >
          Overpass Turbo
        </a>{" "}
        where you can adjust the query). See{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/jakecoppinger/australian-cycleway-stats/blob/main/static-backend/src/utils/overpass-queries.ts"
        >
          overpass-qureries.ts on Github
        </a>{" "}
        for how each column is calculated.
      </p>
      <p>
        All data (except population info) is generated from{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://openstreetmap.org/"
        >
          OpenStreetMap
        </a>
        . See <a href="#footer">below the table</a> for notes on the accuracy on
        OpenStreetMap data.
      </p>
      <p>
        Possible future improvements: (PRs welcome!)
        <ul>
          <li>
            Add aliases for unfamiliar names (Centrum is Amsterdam-Centrum)
          </li>
          <li>Include council/city area in the statistics</li>
          <li>
            Show breakdown of under construction/proposed cycleways by name and
            completion date
          </li>
          <li>Include length of contraflow streets</li>
          <li>Allow filtering based on various columns</li>
          <li>Show map of cycleways/roads when hovering on a statistic</li>
        </ul>
      </p>
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

      <h2>City averages or international examples</h2>
      <CouncilTable dataByCouncil={internationalAreas}></CouncilTable>
      <h2>Australian councils</h2>
      <p>
        These rows are generated by finding all OSM relations with{" "}
        <code>admin_level=6</code>, which generally corresponds to council
        boundaries.
      </p>
      <CouncilTable dataByCouncil={dataByCouncil}></CouncilTable>

      <footer id="footer">
        <p>
          All data is from <a href="https://openstreetmap.org">OpenStreetMap</a>{" "}
          and is licensed{" "}
          <a href="https://opendatacommons.org/licenses/odbl/">ODbL</a> (open
          source). All data is crowdsourced and offers no accuracy guarantees
          (but is often more accurate than government data). Notably:
          <ul>
            <li>
              The{" "}
              <a href="https://transportnsw.info/trip">TfNSW Trip Planner</a>{" "}
              uses OSM data
            </li>
            <li>
              The Department of Transport and Planning (Victoria) has taken the
              strategic step of adopting OSM as the primary data source for the
              network maps; road, rail, train, tram and cycling:
              <blockquote>
                "As part of this decision the department has accepted that the
                use encompasses the responsibility to maintain and enhance the
                mapping content to the highest standard for all users of OSM"
              </blockquote>
            </li>
          </ul>
        </p>

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
            Shared paths + legal footpaths + dedicated cycleways + safe roads /
            roads (%)
          </th>
          <th>Safe roads / roads (%)</th>
          <th>Dedicated cycleways length / roads (%)</th>
          <th>Roads (non-offramp/link) (km)</th>
          <th>{"Safe roads (<=30kmh) (km)"}</th>
          <th>Dedicated cycleways (km)</th>
          <th>Shared paths (km)</th>
          <th>On road lanes ("dooring lane") (km)</th>
          <th>Under construction cycleways (km)</th>
          <th>Proposed cycleways (km)</th>
        </tr>
      </thead>
      <tbody>
        {dataByCouncil.map((row) => (
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
        <RelationLink relationId={relationId}>{councilName}</RelationLink>{" "}
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
  return (
    <a
      href={`https://openstreetmap.org/relation/${relationId}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
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
