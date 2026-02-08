/**
 * RiasecProfileCard — Displays RIASEC personality profile with bar chart
 */

import React from "react";
import { Box, Card, CardContent, Typography, LinearProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

const MAX_SCORE = 7;

function RiasecProfileCard({ riasecScores }) {
  const { t } = useTranslation();

  if (!riasecScores) return null;

  const sortedScores = Object.entries(riasecScores).sort((a, b) => b[1] - a[1]);
  const descriptions = t("tests.programSuggestion.result.riasecProfile.types", {
    returnObjects: true,
  });

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🎯 {t("tests.programSuggestion.result.riasecProfile.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("tests.programSuggestion.result.riasecProfile.subtitle")}
        </Typography>

        {sortedScores.map(([letter, score]) => {
          const typeInfo = descriptions?.[letter] || {};
          return (
            <Box key={letter} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2">
                  <strong>{letter}</strong> - {typeInfo.name || letter}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {score.toFixed(2)} / {MAX_SCORE}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(score / MAX_SCORE) * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: score >= 4 ? "#4caf50" : score >= 2.5 ? "#ff9800" : "#f44336",
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {typeInfo.description || ""}
              </Typography>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default RiasecProfileCard;
