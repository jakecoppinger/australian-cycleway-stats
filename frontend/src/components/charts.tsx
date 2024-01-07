import "../App.css";
import { GeneratedCouncilData } from "../types";
import dataByCouncil from "../data/data-by-council.json";
import internationalAreas from "../data/international-areas.json";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/** Indexes councilName in the JSON */
const capitalCityCentres = [
  "Adelaide City Council",
  "Council of the City of Sydney",
  "City of Melbourne",
  "City of Perth",
  "Brisbane City",
  "Australian Capital Territory",
  "City of Hobart",
];
const capitalCityCentresRelations: GeneratedCouncilData[] = [
  ...dataByCouncil.filter((row) =>
    capitalCityCentres.includes(row.councilName)
  ),
  ...internationalAreas.filter((row) =>
    capitalCityCentres.includes(row.councilName)
  ),
];

const capitalCityCentresByCycleways: GeneratedCouncilData[] = [
  ...capitalCityCentresRelations,
].sort(
  (a, b) => (b.cyclewaysToRoadsRatio || 0) - (a.cyclewaysToRoadsRatio || 0)
);

const capitalCityCentresBySharedPaths: GeneratedCouncilData[] = [
  ...capitalCityCentresRelations,
].sort(
  (a, b) => (b.sharedPathsToRoadsRatio || 0) - (a.sharedPathsToRoadsRatio || 0)
);

const xPercentageScales: ChartOptions<"bar">["scales"] = {
  x: {
    beginAtZero: true,
    position: "left" as const,
    title: {
      display: true,
      text: "Percentage",
    },
    ticks: {
      // Format the ticks to display as percentages
      callback: function (value: string | number) {
        if (typeof value === "string") {
          return value;
        }
        return (value * 100).toFixed(0) + "%";
      },
    },
  },
};

function generatePlugins(title: string) {
  return {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: title
    },
  };
}

export function CapitalCityCentreCycleways() {
  const data: ChartData<"bar"> = {
    labels: capitalCityCentresByCycleways.map((row) => row.councilName),
    datasets: [
      {
        label: "Capital City Centres cycleway/roads %",
        data: capitalCityCentresByCycleways.map(
          (row) => row.cyclewaysToRoadsRatio
        ),
      },
    ],
  };
  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    plugins: generatePlugins("Ratio of cycleways to roads length in capital city centres"),
    scales: xPercentageScales,
  };
  return <Bar options={options} data={data} />;
}

export function CapitalCityCentreSharedPaths() {
  const data: ChartData<"bar"> = {
    labels: capitalCityCentresBySharedPaths.map((row) => row.councilName),
    datasets: [
      {
        label: "Capital city centres shared paths/roads %",
        data: capitalCityCentresBySharedPaths.map(
          (row) => row.sharedPathsToRoadsRatio
        ),
      },
    ],
  };
  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    plugins: generatePlugins("Ratio of shared paths to roads length in capital city centres"),
    scales: xPercentageScales,
  };
  return <Bar options={options} data={data} />;
}
