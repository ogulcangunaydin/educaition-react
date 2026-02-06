/**
 * RadarChart Organism
 *
 * Reusable radar/spider chart for displaying multi-dimensional data.
 * Built on Chart.js Radar chart with responsive defaults.
 *
 * Shows percentage values next to each data point via chartjs-plugin-datalabels.
 *
 * Works for personality tests (Big Five), RIASEC, or any multi-axis comparison.
 *
 * @example
 * <RadarChart
 *   labels={["Trait A", "Trait B", "Trait C"]}
 *   datasets={[{ label: "Scores", data: [80, 60, 90], color: "#22caec" }]}
 *   max={100}
 * />
 */

import React from "react";
import PropTypes from "prop-types";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register Chart.js components (safe to call multiple times)
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartDataLabels
);

/**
 * Converts a hex color to rgba
 * @param {string} hex - e.g. "#22caec"
 * @param {number} alpha - 0-1
 */
function hexToRgba(hex, alpha = 0.2) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const DEFAULT_COLOR = "#22caec";

function RadarChart({
  labels,
  datasets,
  max = 100,
  stepSize = 20,
  maxWidth = 500,
  showLegend,
  showValues = true,
  sx,
}) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const chartData = {
    labels,
    datasets: datasets.map((ds) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.backgroundColor || hexToRgba(ds.color || DEFAULT_COLOR, 0.2),
      borderColor: ds.borderColor || ds.color || DEFAULT_COLOR,
      borderWidth: ds.borderWidth || 2,
    })),
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max,
        ticks: { stepSize, backdropColor: "transparent" },
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        angleLines: { color: "rgba(0, 0, 0, 0.1)" },
        pointLabels: { font: { size: isSmallScreen ? 10 : 14 } },
      },
    },
    layout: { padding: { top: 10, bottom: 10 } },
    plugins: {
      legend: {
        display: showLegend != null ? showLegend : datasets.length > 1,
        position: "top",
      },
      tooltip: { enabled: true },
      datalabels: showValues
        ? {
            display: true,
            color: "#333",
            font: {
              size: isSmallScreen ? 10 : 12,
              weight: "bold",
            },
            formatter: (value) => (value != null ? `%${Math.round(value)}` : ""),
            anchor: "end",
            align: "end",
            offset: 4,
          }
        : { display: false },
    },
    maintainAspectRatio: true,
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        maxWidth,
        mx: "auto",
        ...sx,
      }}
    >
      <Radar data={chartData} options={options} />
    </Box>
  );
}

RadarChart.propTypes = {
  /** Axis labels around the radar */
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** One or more datasets to plot */
  datasets: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.number).isRequired,
      color: PropTypes.string,
      backgroundColor: PropTypes.string,
      borderColor: PropTypes.string,
      borderWidth: PropTypes.number,
    })
  ).isRequired,
  /** Maximum scale value */
  max: PropTypes.number,
  /** Grid step size */
  stepSize: PropTypes.number,
  /** Max width of chart container */
  maxWidth: PropTypes.number,
  /** Force legend visibility (auto-shows when >1 dataset) */
  showLegend: PropTypes.bool,
  /** Show data values next to each point (default: true) */
  showValues: PropTypes.bool,
  /** Additional sx styles for the wrapper Box */
  sx: PropTypes.object,
};

export default RadarChart;
