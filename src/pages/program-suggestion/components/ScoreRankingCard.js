/**
 * ScoreRankingCard — Displays score range and estimated ranking for main & alternative areas
 */

import React from "react";
import { Card, CardContent, Typography, Grid, Paper, Chip, Divider } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useTranslation } from "react-i18next";

const AREA_LABELS = {
  say: "Sayısal (SAY)",
  ea: "Eşit Ağırlık (EA)",
  söz: "Sözel (SÖZ)",
  dil: "Dil",
};

function ScoreRankingCard({ result, estimateRanking, formatRanking }) {
  const { t } = useTranslation();

  if (!result?.area || !result?.expected_score_min) return null;

  const midScore = Math.round((result.expected_score_min + result.expected_score_max) / 2);
  const estimatedRanking = estimateRanking(midScore, result.area);

  const hasAlternative =
    result.alternative_area && result.alternative_score_min && result.alternative_score_max;
  let altMidScore, altEstimatedRanking;
  if (hasAlternative) {
    altMidScore = Math.round((result.alternative_score_min + result.alternative_score_max) / 2);
    altEstimatedRanking = estimateRanking(altMidScore, result.alternative_area);
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <TrendingUpIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          {t("tests.programSuggestion.result.scoreRanking.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("tests.programSuggestion.result.scoreRanking.subtitle")}
        </Typography>

        <Grid container spacing={2}>
          {/* Main Area */}
          <Grid item xs={12} md={hasAlternative ? 6 : 12}>
            <Paper elevation={2} sx={{ p: 2, backgroundColor: "#e8f5e9", height: "100%" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t("tests.programSuggestion.result.scoreRanking.mainArea")}
              </Typography>
              <Chip
                label={AREA_LABELS[result.area] || result.area.toUpperCase()}
                color="primary"
                size="small"
                sx={{ mb: 1 }}
              />
              <Typography variant="body1" sx={{ fontWeight: "bold", mt: 1 }}>
                📊 {t("tests.programSuggestion.result.scoreRanking.scoreRange")}:{" "}
                {result.expected_score_min} - {result.expected_score_max}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("tests.programSuggestion.result.scoreRanking.midScore")}: {midScore}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                🎯 {t("tests.programSuggestion.result.scoreRanking.estimatedRanking")}
              </Typography>
              <Typography variant="h5" color="success.main" sx={{ fontWeight: "bold" }}>
                {formatRanking(estimatedRanking)}
              </Typography>
            </Paper>
          </Grid>

          {/* Alternative Area */}
          {hasAlternative && (
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: "#fff3e0", height: "100%" }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t("tests.programSuggestion.result.scoreRanking.alternativeArea")}
                </Typography>
                <Chip
                  label={
                    AREA_LABELS[result.alternative_area] || result.alternative_area.toUpperCase()
                  }
                  color="secondary"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body1" sx={{ fontWeight: "bold", mt: 1 }}>
                  📊 {t("tests.programSuggestion.result.scoreRanking.scoreRange")}:{" "}
                  {result.alternative_score_min} - {result.alternative_score_max}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("tests.programSuggestion.result.scoreRanking.midScore")}: {altMidScore}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  🎯 {t("tests.programSuggestion.result.scoreRanking.estimatedRanking")}
                </Typography>
                <Typography variant="h5" color="warning.main" sx={{ fontWeight: "bold" }}>
                  {formatRanking(altEstimatedRanking)}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
          * {t("tests.programSuggestion.result.scoreRanking.disclaimer")}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ScoreRankingCard;
