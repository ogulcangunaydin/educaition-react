/**
 * SuggestedProgramsCard — Displays university program recommendations
 */

import React from "react";
import { Box, Card, CardContent, Typography, Paper, Chip, Divider, Alert } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useTranslation } from "react-i18next";
import jobTranslations from "@data/riasec/job_translations.json";

const normalizeForComparison = (str) =>
  str
    .toLocaleLowerCase("en-US")
    .replace(/[,\-–—]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const translateJob = (englishName) => {
  const normalizedInput = normalizeForComparison(englishName);
  const translation = jobTranslations.find(
    (job) => normalizeForComparison(job.en) === normalizedInput
  );
  return translation ? translation.tr : englishName;
};

function SuggestedProgramsCard({ suggestedPrograms }) {
  const { t } = useTranslation();

  if (!suggestedPrograms || suggestedPrograms.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        {t("tests.programSuggestion.result.suggestedPrograms.noResults")}
      </Alert>
    );
  }

  const getBorderColor = (index) => {
    if (index < 3) return "#4caf50";
    if (index < 6) return "#2196f3";
    return "#9c27b0";
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <SchoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          {t("tests.programSuggestion.result.suggestedPrograms.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("tests.programSuggestion.result.suggestedPrograms.subtitle")}
        </Typography>

        {suggestedPrograms.map((program, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{ p: 2, mb: 2, borderLeft: `4px solid ${getBorderColor(index)}` }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {index + 1}. {program.program}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {program.university}
                </Typography>
                {program.faculty && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {program.faculty}
                  </Typography>
                )}
              </Box>
              <Box sx={{ textAlign: "right" }}>
                {program.taban_score && (
                  <Chip
                    label={`${t("tests.programSuggestion.result.suggestedPrograms.baseScore")}: ${program.taban_score}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              {program.city && (
                <Chip
                  icon={<LocationOnIcon />}
                  label={program.city}
                  size="small"
                  variant="outlined"
                />
              )}
              {program.scholarship && (
                <Chip
                  label={program.scholarship}
                  size="small"
                  color={program.scholarship === "Burslu" ? "success" : "default"}
                />
              )}
              {program.job && (
                <Chip
                  label={`${t("tests.programSuggestion.result.suggestedJobs.title")}: ${translateJob(program.job)}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>

            {program.reason && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                💡 {program.reason}
              </Typography>
            )}
          </Paper>
        ))}
      </CardContent>
    </Card>
  );
}

export default SuggestedProgramsCard;
