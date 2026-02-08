/**
 * SuggestedJobsCard — Displays RIASEC-matched job suggestions
 */

import React from "react";
import { Box, Card, CardContent, Typography, Grid, Paper, Chip } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
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

function SuggestedJobsCard({ suggestedJobs }) {
  const { t } = useTranslation();

  if (!suggestedJobs || suggestedJobs.length === 0) return null;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <WorkIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          {t("tests.programSuggestion.result.suggestedJobs.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("tests.programSuggestion.result.suggestedJobs.subtitle")}
        </Typography>

        <Grid container spacing={2}>
          {suggestedJobs.map((job, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: "100%",
                  backgroundColor: index === 0 ? "#e3f2fd" : "white",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  #{index + 1} {translateJob(job.job)}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                  <Chip
                    label={`${t("tests.programSuggestion.result.suggestedJobs.compatibility")}: ${
                      job.match_score
                        ? (job.match_score * 100).toFixed(0)
                        : ((1 - job.distance / 7) * 100).toFixed(0)
                    }%`}
                    color={index === 0 ? "success" : "default"}
                    size="small"
                  />
                  {job.holland_code && (
                    <Chip
                      label={`${t("tests.programSuggestion.result.suggestedJobs.code")}: ${job.holland_code}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                </Box>
                {job.riasec_scores && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 0.5 }}
                    >
                      {t("tests.programSuggestion.result.suggestedJobs.jobProfile")}:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {Object.entries(job.riasec_scores)
                        .sort((a, b) => b[1] - a[1])
                        .map(([letter, score]) => (
                          <Chip
                            key={letter}
                            label={`${letter}: ${score.toFixed(1)}`}
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              height: "20px",
                              backgroundColor:
                                score >= 4 ? "#e8f5e9" : score >= 2.5 ? "#fff3e0" : "#ffebee",
                            }}
                          />
                        ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default SuggestedJobsCard;
