/**
 * RiasecStep — Step 5: RIASEC Career Test Questions
 */

import React from "react";
import { Box, Typography, Card, CardContent, LinearProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Button } from "@components/atoms";

const RIASEC_OPTIONS = [
  {
    value: "strongly_like",
    labelKey: "tests.programSuggestion.riasec.stronglyLike",
    color: "#4caf50",
  },
  { value: "like", labelKey: "tests.programSuggestion.riasec.like", color: "#8bc34a" },
  { value: "unsure", labelKey: "tests.programSuggestion.riasec.unsure", color: "#ff9800" },
  { value: "dislike", labelKey: "tests.programSuggestion.riasec.dislike", color: "#ff5722" },
  {
    value: "strongly_dislike",
    labelKey: "tests.programSuggestion.riasec.stronglyDislike",
    color: "#f44336",
  },
];

function RiasecStep({ riasecQuestionsList, currentQuestionIndex, onAnswer }) {
  const { t } = useTranslation();

  const currentQuestion = riasecQuestionsList[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / riasecQuestionsList.length) * 100;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6">{t("tests.programSuggestion.riasec.title")}</Typography>

      {/* Progress */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("tests.questionOf", {
              current: currentQuestionIndex + 1,
              total: riasecQuestionsList.length,
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Question Card */}
      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
            {currentQuestion.text}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 3 }}>
            {RIASEC_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant="outlined"
                onClick={() => onAnswer(currentQuestion.id, option.value)}
                sx={{
                  py: 1.5,
                  borderColor: option.color,
                  color: option.color,
                  "&:hover": {
                    backgroundColor: option.color,
                    color: "white",
                  },
                }}
              >
                {t(option.labelKey)}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default RiasecStep;
