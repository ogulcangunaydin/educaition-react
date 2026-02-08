/**
 * ScoreExpectationStep — Step 3: Score Range, Ranking Estimation, Alternative Area
 */

import React from "react";
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Slider, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

function ScoreExpectationStep({
  formData,
  updateFormData,
  enums,
  estimateRanking,
  getScoreBounds,
  formatRanking,
}) {
  const { t } = useTranslation();

  const scoreBounds = getScoreBounds(formData.area);
  const midScore = Math.round(
    (formData.expectedScoreRange[0] + formData.expectedScoreRange[1]) / 2
  );
  const estimatedRanking = estimateRanking(midScore, formData.area);

  const altScoreBounds = formData.alternativeArea
    ? getScoreBounds(formData.alternativeArea)
    : { min: 100, max: 560 };
  const altMidScore = Math.round(
    (formData.alternativeScoreRange[0] + formData.alternativeScoreRange[1]) / 2
  );
  const altEstimatedRanking = formData.alternativeArea
    ? estimateRanking(altMidScore, formData.alternativeArea)
    : null;

  const renderSliderMarks = (bounds) => [
    { value: bounds.min, label: String(bounds.min) },
    {
      value: Math.round((bounds.min + bounds.max) / 2),
      label: String(Math.round((bounds.min + bounds.max) / 2)),
    },
    { value: bounds.max, label: String(bounds.max) },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6">{t("tests.programSuggestion.steps.scoreExpectation")}</Typography>

      {/* Main Area Score Range */}
      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          {t("tests.programSuggestion.scoreExpectation.expectedRange", {
            area: formData.area.toUpperCase(),
          })}
        </Typography>
        <Slider
          value={formData.expectedScoreRange}
          onChange={(_, value) => updateFormData({ expectedScoreRange: value })}
          min={scoreBounds.min}
          max={scoreBounds.max}
          step={5}
          valueLabelDisplay="on"
          marks={renderSliderMarks(scoreBounds)}
          sx={{ mt: 4, mb: 2 }}
        />

        <Paper
          elevation={0}
          sx={{
            p: 2,
            mt: 1,
            bgcolor: "primary.50",
            border: "1px solid",
            borderColor: "primary.200",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t("tests.programSuggestion.scoreExpectation.estimatedRanking", { score: midScore })}
          </Typography>
          <Typography variant="h5" color="primary.main" fontWeight="bold">
            {formatRanking(estimatedRanking)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("tests.programSuggestion.scoreExpectation.rankingNote")}
          </Typography>
        </Paper>
      </Box>

      {/* Alternative Area Selection */}
      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          {t("tests.programSuggestion.scoreExpectation.alternativeAreaQuestion")}
        </Typography>
        <RadioGroup
          value={formData.alternativeArea}
          onChange={(e) => updateFormData({ alternativeArea: e.target.value })}
        >
          <FormControlLabel value="" control={<Radio />} label={t("common.no")} />
          {(enums.scoreAreas || [])
            .filter((a) => a.value !== formData.area)
            .map((area) => (
              <FormControlLabel
                key={area.value}
                value={area.value}
                control={<Radio />}
                label={area.label}
              />
            ))}
        </RadioGroup>
      </Box>

      {/* Alternative Area Score Range */}
      {formData.alternativeArea && (
        <Box>
          <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
            {t("tests.programSuggestion.scoreExpectation.alternativeRange", {
              area: formData.alternativeArea.toUpperCase(),
            })}
          </Typography>
          <Slider
            value={formData.alternativeScoreRange}
            onChange={(_, value) => updateFormData({ alternativeScoreRange: value })}
            min={altScoreBounds.min}
            max={altScoreBounds.max}
            step={5}
            valueLabelDisplay="on"
            marks={renderSliderMarks(altScoreBounds)}
            sx={{ mt: 4, mb: 2 }}
          />

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mt: 1,
              bgcolor: "secondary.50",
              border: "1px solid",
              borderColor: "secondary.200",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("tests.programSuggestion.scoreExpectation.estimatedRanking", {
                score: altMidScore,
              })}
            </Typography>
            <Typography variant="h5" color="secondary.main" fontWeight="bold">
              {formatRanking(altEstimatedRanking)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("tests.programSuggestion.scoreExpectation.rankingNote")}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default ScoreExpectationStep;
