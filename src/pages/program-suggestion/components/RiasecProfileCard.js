/**
 * RiasecProfileCard — Displays RIASEC personality profile with bar chart
 *
 * Features:
 * - Bar chart visualization of RIASEC scores
 * - Average benchmark indicator from platform data (notch on each bar)
 * - Optional radar chart toggle
 * - Color-coded scores based on intensity
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import RadarIcon from "@mui/icons-material/Radar";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import { getRiasecAverages } from "../../../services/programSuggestionService";

const MAX_SCORE = 7;

// Default fallback values if API fails
const DEFAULT_BENCHMARKS = {
  R: 3.5,
  I: 3.5,
  A: 3.5,
  S: 3.5,
  E: 3.5,
  C: 3.5,
};

function RiasecProfileCard({ riasecScores }) {
  const { t } = useTranslation();
  const [viewType, setViewType] = useState("bar"); // 'bar' or 'radar'
  const [platformAverages, setPlatformAverages] = useState(null);
  const [sampleSize, setSampleSize] = useState(0);
  const [isLoadingAverages, setIsLoadingAverages] = useState(true);

  // Fetch platform averages on mount
  useEffect(() => {
    const fetchAverages = async () => {
      try {
        const result = await getRiasecAverages();
        setPlatformAverages(result.averages);
        setSampleSize(result.sample_size);
      } catch (error) {
        console.error("Failed to fetch RIASEC averages:", error);
        setPlatformAverages(DEFAULT_BENCHMARKS);
      } finally {
        setIsLoadingAverages(false);
      }
    };
    fetchAverages();
  }, []);

  // Use platform averages or fallback
  const benchmarks = platformAverages || DEFAULT_BENCHMARKS;

  const sortedScores = useMemo(() => {
    if (!riasecScores) return [];
    return Object.entries(riasecScores).sort((a, b) => b[1] - a[1]);
  }, [riasecScores]);

  // Calculate overall average of user's scores
  const userAverage = useMemo(() => {
    if (!riasecScores) return 0;
    const values = Object.values(riasecScores);
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }, [riasecScores]);

  const descriptions = t("tests.programSuggestion.result.riasecProfile.types", {
    returnObjects: true,
  });

  if (!riasecScores) return null;

  const getScoreColor = (score) => {
    if (score >= 4) return "#4caf50";
    if (score >= 2.5) return "#ff9800";
    return "#f44336";
  };

  const renderBarChart = () => (
    <Box>
      {isLoadingAverages && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {sortedScores.map(([letter, score]) => {
        const typeInfo = descriptions?.[letter] || {};
        const benchmark = benchmarks[letter] || 3.5;
        const benchmarkPercent = (benchmark / MAX_SCORE) * 100;

        return (
          <Box key={letter} sx={{ mb: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2">
                <strong>{letter}</strong> - {typeInfo.name || letter}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {score.toFixed(2)} / {MAX_SCORE}
                </Typography>
                {score > benchmark && (
                  <Typography variant="caption" sx={{ color: "success.main", fontWeight: "bold" }}>
                    ▲{" "}
                    {t("tests.programSuggestion.result.riasecProfile.aboveAverage", {
                      defaultValue: "Ortalamanın üstünde",
                    })}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Progress bar with benchmark indicator */}
            <Box sx={{ position: "relative" }}>
              <LinearProgress
                variant="determinate"
                value={(score / MAX_SCORE) * 100}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getScoreColor(score),
                    borderRadius: 6,
                  },
                }}
              />

              {/* Average benchmark notch */}
              <Tooltip
                title={t("tests.programSuggestion.result.riasecProfile.averageBenchmark", {
                  defaultValue: `Ortalama: ${benchmark.toFixed(1)}`,
                })}
                arrow
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: `${benchmarkPercent}%`,
                    top: -2,
                    width: 2,
                    height: 16,
                    backgroundColor: "#1976d2",
                    borderRadius: 1,
                    cursor: "help",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -4,
                      left: -3,
                      width: 8,
                      height: 8,
                      backgroundColor: "#1976d2",
                      borderRadius: "50%",
                    },
                  }}
                />
              </Tooltip>
            </Box>

            <Typography variant="caption" color="text.secondary">
              {typeInfo.description || ""}
            </Typography>
          </Box>
        );
      })}

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mt: 2,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tooltip
          title={
            sampleSize > 0
              ? t("tests.programSuggestion.result.riasecProfile.platformAverageTooltip", {
                  defaultValue: `Bu ortalama, platformumuzdaki ${sampleSize} tamamlanmış test sonucundan hesaplanmıştır.`,
                  count: sampleSize,
                })
              : t("tests.programSuggestion.result.riasecProfile.noDataTooltip", {
                  defaultValue: "Henüz yeterli veri bulunmamaktadır.",
                })
          }
          arrow
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "help" }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1976d2" }} />
            <Typography variant="caption" color="text.secondary">
              {t("tests.programSuggestion.result.riasecProfile.averageIndicator", {
                defaultValue: "Platform Ortalaması",
              })}
            </Typography>
            <InfoOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            {sampleSize > 0 && (
              <Typography variant="caption" color="text.secondary">
                (n={sampleSize})
              </Typography>
            )}
          </Box>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          {t("tests.programSuggestion.result.riasecProfile.yourAverage", {
            defaultValue: `Sizin ortalamanız: ${userAverage.toFixed(2)}`,
          })}
        </Typography>
      </Box>
    </Box>
  );

  const renderRadarChart = () => {
    // Simple CSS-based radar chart representation
    const letters = ["R", "I", "A", "S", "E", "C"];
    const angleStep = (2 * Math.PI) / 6;
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;

    const getPoint = (index, value) => {
      const angle = angleStep * index - Math.PI / 2;
      const radius = (value / MAX_SCORE) * maxRadius;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    };

    const userPoints = letters.map((letter, i) => getPoint(i, riasecScores[letter] || 0));
    const benchmarkPoints = letters.map((letter, i) => getPoint(i, benchmarks[letter] || 3.5));

    const createPath = (points) =>
      points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <svg width="300" height="300" viewBox="0 0 300 300">
          {/* Grid circles */}
          {[1, 2, 3, 4, 5, 6, 7].map((level) => (
            <circle
              key={level}
              cx={centerX}
              cy={centerY}
              r={(level / MAX_SCORE) * maxRadius}
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {letters.map((_, i) => {
            const point = getPoint(i, MAX_SCORE);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={point.x}
                y2={point.y}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            );
          })}

          {/* Benchmark area */}
          <path
            d={createPath(benchmarkPoints)}
            fill="rgba(25, 118, 210, 0.1)"
            stroke="#1976d2"
            strokeWidth="2"
            strokeDasharray="5 3"
          />

          {/* User score area */}
          <path
            d={createPath(userPoints)}
            fill="rgba(76, 175, 80, 0.2)"
            stroke="#4caf50"
            strokeWidth="2"
          />

          {/* Labels */}
          {letters.map((letter, i) => {
            const labelPoint = getPoint(i, MAX_SCORE + 0.8);
            return (
              <text
                key={letter}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#333"
              >
                {letter}
              </text>
            );
          })}

          {/* Score dots */}
          {userPoints.map((point, i) => (
            <circle key={i} cx={point.x} cy={point.y} r="5" fill="#4caf50" />
          ))}
        </svg>
      </Box>
    );
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
              🎯 {t("tests.programSuggestion.result.riasecProfile.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("tests.programSuggestion.result.riasecProfile.subtitle")}
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={(_, value) => value && setViewType(value)}
            size="small"
          >
            <ToggleButton value="bar">
              <Tooltip
                title={t("tests.programSuggestion.result.riasecProfile.barChart", {
                  defaultValue: "Çubuk Grafik",
                })}
              >
                <BarChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="radar">
              <Tooltip
                title={t("tests.programSuggestion.result.riasecProfile.radarChart", {
                  defaultValue: "Radar Grafik",
                })}
              >
                <RadarIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {viewType === "bar" ? renderBarChart() : renderRadarChart()}
      </CardContent>
    </Card>
  );
}

export default RiasecProfileCard;
