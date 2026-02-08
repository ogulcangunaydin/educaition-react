/**
 * ScoreExpectationStep — Step 3: Score Range, Ranking Estimation, Alternative Area
 *
 * Features:
 * - Normal distribution visualization behind the score slider
 * - Midpoint emphasis in the distribution
 * - Warning note about midpoint prioritization
 * - Alternative area selection with validation rules:
 *   - SAY can select EA only
 *   - SÖZ cannot select SAY
 *   - EA can select both SAY and SÖZ
 *   - DİL can select SÖZ
 */

import React, { useMemo } from "react";
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Paper, Alert } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import NormalDistributionSlider from "./NormalDistributionSlider";

/**
 * Alternative area selection rules:
 * - SAY: can select EA (not SÖZ)
 * - SÖZ: can select EA (not SAY)
 * - EA: can select both SAY and SÖZ
 * - DİL: can select SÖZ
 */
const ALTERNATIVE_AREA_RULES = {
  say: ["ea"], // SAY can only select EA as alternative
  ea: ["say", "söz"], // EA can select both SAY and SÖZ
  söz: ["ea"], // SÖZ can only select EA (not SAY)
  dil: ["söz"], // DİL can select SÖZ
};

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

  // Get allowed alternative areas based on the main area
  const allowedAlternativeAreas = useMemo(() => {
    if (!formData.area) return [];
    const rules = ALTERNATIVE_AREA_RULES[formData.area.toLowerCase()] || [];
    return (enums.scoreAreas || []).filter(
      (a) => a.value !== formData.area && rules.includes(a.value.toLowerCase())
    );
  }, [formData.area, enums.scoreAreas]);

  // Clear alternative area if it's no longer valid when main area changes
  React.useEffect(() => {
    if (formData.alternativeArea) {
      const rules = ALTERNATIVE_AREA_RULES[formData.area?.toLowerCase()] || [];
      if (!rules.includes(formData.alternativeArea.toLowerCase())) {
        updateFormData({ alternativeArea: "", alternativeScoreRange: [200, 400] });
      }
    }
  }, [formData.area, formData.alternativeArea, updateFormData]);

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

      {/* Main Area Score Range with Normal Distribution */}
      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          {t("tests.programSuggestion.scoreExpectation.expectedRange", {
            area: formData.area?.toUpperCase() || "",
          })}
        </Typography>

        <NormalDistributionSlider
          value={formData.expectedScoreRange}
          onChange={(_, value) => updateFormData({ expectedScoreRange: value })}
          min={scoreBounds.min}
          max={scoreBounds.max}
          step={5}
          marks={renderSliderMarks(scoreBounds)}
          color="primary"
          formatMidpointLabel={(score) =>
            formatRanking(estimateRanking(Math.round(score), formData.area))
          }
        />

        {/* Midpoint prioritization warning */}
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon />}
          sx={{ mb: 2, backgroundColor: "info.50", border: "1px solid", borderColor: "info.200" }}
        >
          <Typography variant="body2">
            {t("tests.programSuggestion.scoreExpectation.midpointNote", {
              defaultValue:
                "Orta değer seçilerek orta değere yakın bölümler önceliklendirilecektir.",
            })}
          </Typography>
        </Alert>

        <Paper
          elevation={0}
          sx={{
            p: 2,
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

        {allowedAlternativeAreas.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t("tests.programSuggestion.scoreExpectation.noAlternativeAllowed", {
              defaultValue: "Seçtiğiniz alan için alternatif alan seçimi yapılamamaktadır.",
            })}
          </Alert>
        ) : (
          <RadioGroup
            value={formData.alternativeArea}
            onChange={(e) => updateFormData({ alternativeArea: e.target.value })}
          >
            <FormControlLabel value="" control={<Radio />} label={t("common.no")} />
            {allowedAlternativeAreas.map((area) => (
              <FormControlLabel
                key={area.value}
                value={area.value}
                control={<Radio />}
                label={area.label}
              />
            ))}
          </RadioGroup>
        )}

        {/* Show rule explanation */}
        {formData.area && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            {getAlternativeRuleExplanation(formData.area)}
          </Typography>
        )}
      </Box>

      {/* Alternative Area Score Range */}
      {formData.alternativeArea && (
        <Box>
          <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
            {t("tests.programSuggestion.scoreExpectation.alternativeRange", {
              area: formData.alternativeArea.toUpperCase(),
            })}
          </Typography>

          <NormalDistributionSlider
            value={formData.alternativeScoreRange}
            onChange={(_, value) => updateFormData({ alternativeScoreRange: value })}
            min={altScoreBounds.min}
            max={altScoreBounds.max}
            step={5}
            marks={renderSliderMarks(altScoreBounds)}
            color="secondary"
            formatMidpointLabel={(score) =>
              formatRanking(estimateRanking(Math.round(score), formData.alternativeArea))
            }
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

/**
 * Get human-readable explanation of alternative area rules
 */
function getAlternativeRuleExplanation(area) {
  const rules = {
    say: "SAY alanı için sadece EA alternatif olarak seçilebilir.",
    ea: "EA alanı için SAY veya SÖZ alternatif olarak seçilebilir.",
    söz: "SÖZ alanı için sadece EA alternatif olarak seçilebilir.",
    dil: "DİL alanı için SÖZ alternatif olarak seçilebilir.",
  };
  return rules[area?.toLowerCase()] || "";
}

export default ScoreExpectationStep;
