/**
 * NormalDistributionSlider — Score slider with normal distribution background
 *
 * Displays a bell curve visualization behind a range slider, with the
 * selected range highlighted. The midpoint of the selection is emphasized.
 */

import React, { useMemo } from "react";
import { Box, Slider, Typography } from "@mui/material";

// Generate normal distribution points for the curve
const generateNormalDistributionPoints = (min, max, mean, stdDev, numPoints = 100) => {
  const points = [];
  const step = (max - min) / numPoints;

  for (let x = min; x <= max; x += step) {
    // Normal distribution formula: f(x) = (1/(σ√(2π))) * e^(-((x-μ)²)/(2σ²))
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    const y = Math.exp(exponent);
    points.push({ x, y });
  }

  return points;
};

// Create SVG path from points
const createPathFromPoints = (points, width, height, padding = 20) => {
  if (points.length === 0) return "";

  const maxY = Math.max(...points.map((p) => p.y));
  const minX = points[0].x;
  const maxX = points[points.length - 1].x;

  const scaleX = (x) => padding + ((x - minX) / (maxX - minX)) * (width - 2 * padding);
  const scaleY = (y) => height - padding - (y / maxY) * (height - 2 * padding);

  let path = `M ${scaleX(points[0].x)} ${scaleY(points[0].y)}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${scaleX(points[i].x)} ${scaleY(points[i].y)}`;
  }

  return path;
};

// Create filled area path for selected range
const createFilledAreaPath = (points, width, height, padding, rangeMin, rangeMax) => {
  if (points.length === 0) return "";

  const maxY = Math.max(...points.map((p) => p.y));
  const minX = points[0].x;
  const maxX = points[points.length - 1].x;

  const scaleX = (x) => padding + ((x - minX) / (maxX - minX)) * (width - 2 * padding);
  const scaleY = (y) => height - padding - (y / maxY) * (height - 2 * padding);

  // Filter points within range
  const rangePoints = points.filter((p) => p.x >= rangeMin && p.x <= rangeMax);
  if (rangePoints.length < 2) return "";

  const baselineY = height - padding;

  let path = `M ${scaleX(rangePoints[0].x)} ${baselineY}`;
  path += ` L ${scaleX(rangePoints[0].x)} ${scaleY(rangePoints[0].y)}`;

  for (let i = 1; i < rangePoints.length; i++) {
    path += ` L ${scaleX(rangePoints[i].x)} ${scaleY(rangePoints[i].y)}`;
  }

  path += ` L ${scaleX(rangePoints[rangePoints.length - 1].x)} ${baselineY}`;
  path += " Z";

  return path;
};

function NormalDistributionSlider({
  value,
  onChange,
  min,
  max,
  step = 5,
  marks,
  color = "primary",
  height = 120,
  formatMidpointLabel, // Optional function to format midpoint label (e.g., show rank instead of score)
}) {
  const width = 100; // percentage width

  // Calculate distribution parameters
  const mean = (min + max) / 2;
  const stdDev = (max - min) / 6; // ~99.7% of data within range

  // Generate curve points
  const points = useMemo(
    () => generateNormalDistributionPoints(min, max, mean, stdDev, 150),
    [min, max, mean, stdDev]
  );

  // Calculate midpoint of selected range
  const midpoint = (value[0] + value[1]) / 2;
  const midpointX = ((midpoint - min) / (max - min)) * 100;

  // SVG dimensions (relative to container)
  const svgHeight = height;
  const padding = 10;

  return (
    <Box sx={{ position: "relative", width: "100%", mt: 2, mb: 4 }}>
      {/* Normal distribution background */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: svgHeight,
          mb: 1,
        }}
      >
        <svg
          viewBox={`0 0 400 ${svgHeight}`}
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {/* Background curve (faded) */}
          <path
            d={createPathFromPoints(points, 400, svgHeight, padding)}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="2"
          />

          {/* Filled area for selected range */}
          <path
            d={createFilledAreaPath(points, 400, svgHeight, padding, value[0], value[1])}
            fill={color === "primary" ? "rgba(25, 118, 210, 0.2)" : "rgba(156, 39, 176, 0.2)"}
            stroke="none"
          />

          {/* Midpoint indicator line */}
          <line
            x1={padding + (midpointX / 100) * (400 - 2 * padding)}
            y1={padding}
            x2={padding + (midpointX / 100) * (400 - 2 * padding)}
            y2={svgHeight - padding}
            stroke={color === "primary" ? "#1565c0" : "#7b1fa2"}
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Midpoint circle */}
          <circle
            cx={padding + (midpointX / 100) * (400 - 2 * padding)}
            cy={svgHeight - padding}
            r="6"
            fill={color === "primary" ? "#1565c0" : "#7b1fa2"}
          />
        </svg>

        {/* Midpoint label */}
        <Box
          sx={{
            position: "absolute",
            bottom: -8,
            left: `${midpointX}%`,
            transform: "translateX(-50%)",
            backgroundColor: color === "primary" ? "primary.main" : "secondary.main",
            color: "white",
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontSize: "0.75rem",
            fontWeight: "bold",
            zIndex: 2,
          }}
        >
          {formatMidpointLabel ? formatMidpointLabel(midpoint) : Math.round(midpoint)}
        </Box>
      </Box>

      {/* Slider (positioned over the curve) */}
      <Box sx={{ px: 1 }}>
        <Slider
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          valueLabelDisplay="on"
          marks={marks}
          color={color}
          sx={{
            "& .MuiSlider-thumb": {
              width: 20,
              height: 20,
              "&:hover, &.Mui-focusVisible": {
                boxShadow: "0 0 0 8px rgba(25, 118, 210, 0.16)",
              },
            },
            "& .MuiSlider-track": {
              height: 6,
            },
            "& .MuiSlider-rail": {
              height: 6,
              opacity: 0.3,
            },
            "& .MuiSlider-valueLabel": {
              backgroundColor: color === "primary" ? "primary.main" : "secondary.main",
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default NormalDistributionSlider;
