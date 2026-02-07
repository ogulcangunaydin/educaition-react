/**
 * DissonanceResultContent
 *
 * Shared result component for the dissonance test.
 * Used in DissonanceTestRoomDetail (inside ResultDetailDialog)
 * to show teachers the full dissonance analysis.
 *
 * Shows:
 *   1. First / second round answer comparison
 *   2. Displayed averages (fake averages used in the experiment)
 *   3. Dissonance analysis (diff chips)
 *   4. Job recommendation / GPT analysis (if available)
 */

import React from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MarkdownSection } from "@components/molecules";

// ── Helpers ──────────────────────────────────────────────

/** Simple stat display (label + big value) */
function StatItem({ label, value }) {
  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight="bold">
        {value ?? "-"}
      </Typography>
    </Box>
  );
}

/** Chip showing difference between rounds with colour coding */
function DiffChip({ label, diff }) {
  if (diff === null || diff === undefined) {
    return (
      <Box sx={{ minWidth: 120 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Chip label="-" size="small" />
      </Box>
    );
  }

  const color = diff === 0 ? "default" : diff > 0 ? "success" : "error";
  const sign = diff > 0 ? "+" : "";

  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Chip
        label={`${sign}${diff}`}
        color={color}
        size="small"
        sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
      />
    </Box>
  );
}

// ── Main Component ───────────────────────────────────────

function DissonanceResultContent({ participant }) {
  const { t } = useTranslation();
  const p = participant;

  // Diffs between rounds
  const comfortDiff =
    p.comfort_question_second_answer !== null && p.comfort_question_second_answer !== undefined
      ? p.comfort_question_second_answer - p.comfort_question_first_answer
      : null;
  const fareDiff =
    p.fare_question_second_answer !== null && p.fare_question_second_answer !== undefined
      ? p.fare_question_second_answer - p.fare_question_first_answer
      : null;

  return (
    <Box>
      {/* ── First Round ─────────────────────────────── */}
      <Typography variant="h6" gutterBottom>
        {t("tests.dissonance.roomDetail.firstRound")}
      </Typography>
      <Box sx={{ display: "flex", gap: 4, mb: 3, flexWrap: "wrap" }}>
        <StatItem
          label={t("tests.dissonance.taxiQuestions.comfortQuestion")}
          value={p.comfort_question_first_answer}
        />
        <StatItem
          label={t("tests.dissonance.taxiQuestions.fareQuestion")}
          value={p.fare_question_first_answer}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ── Displayed Averages ──────────────────────── */}
      <Typography variant="h6" gutterBottom>
        {t("tests.dissonance.roomDetail.displayedAverages")}
      </Typography>
      <Box sx={{ display: "flex", gap: 4, mb: 3, flexWrap: "wrap" }}>
        <StatItem
          label={t("tests.dissonance.roomDetail.comfortAvg")}
          value={
            p.comfort_question_displayed_average != null
              ? Number(p.comfort_question_displayed_average).toFixed(2)
              : "-"
          }
        />
        <StatItem
          label={t("tests.dissonance.roomDetail.fareAvg")}
          value={
            p.fare_question_displayed_average != null
              ? Number(p.fare_question_displayed_average).toFixed(2)
              : "-"
          }
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ── Second Round ────────────────────────────── */}
      <Typography variant="h6" gutterBottom>
        {t("tests.dissonance.roomDetail.secondRound")}
      </Typography>
      <Box sx={{ display: "flex", gap: 4, mb: 3, flexWrap: "wrap" }}>
        <StatItem
          label={t("tests.dissonance.taxiQuestions.comfortQuestion")}
          value={p.comfort_question_second_answer ?? "-"}
        />
        <StatItem
          label={t("tests.dissonance.taxiQuestions.fareQuestion")}
          value={p.fare_question_second_answer ?? "-"}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ── Dissonance Analysis ─────────────────────── */}
      <Typography variant="h6" gutterBottom>
        {t("tests.dissonance.roomDetail.dissonanceAnalysis")}
      </Typography>
      <Box sx={{ display: "flex", gap: 4, mb: 3, flexWrap: "wrap" }}>
        <DiffChip label={t("tests.dissonance.roomDetail.comfortFirst")} diff={comfortDiff} />
        <DiffChip label={t("tests.dissonance.roomDetail.fareFirst")} diff={fareDiff} />
      </Box>

      {/* ── GPT Job Recommendation / Analysis (if available) ── */}
      {p.job_recommendation && (
        <>
          <Divider sx={{ my: 2 }} />
          <MarkdownSection
            title={t("tests.dissonance.jobRecommendation")}
            content={p.job_recommendation}
          />
        </>
      )}
    </Box>
  );
}

export default DissonanceResultContent;
