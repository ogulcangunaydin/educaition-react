/**
 * SuggestedJobsCard — Displays RIASEC-matched job suggestions
 *
 * Features:
 * - Shows top 6 job recommendations
 */

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Collapse,
  Button,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoIcon from "@mui/icons-material/Info";
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

const AREA_LABELS = {
  say: "Sayısal",
  ea: "Eşit Ağırlık",
  söz: "Sözel",
  dil: "Yabancı Dil",
};

const AREA_COLORS = {
  say: { bg: "#e3f2fd", border: "#1976d2", text: "#1565c0" },
  ea: { bg: "#f3e5f5", border: "#9c27b0", text: "#7b1fa2" },
  söz: { bg: "#e8f5e9", border: "#4caf50", text: "#2e7d32" },
  dil: { bg: "#fff3e0", border: "#ff9800", text: "#e65100" },
};

function SuggestedJobsCard({ suggestedJobs, userRiasecScores, area, alternativeArea }) {
  const { t } = useTranslation();
  const [expandedJobs, setExpandedJobs] = useState({});
  const [areaTab, setAreaTab] = useState(0);

  const allJobs = suggestedJobs || [];

  // Split jobs by area field (each job now has an "area" key)
  const mainJobs = allJobs.filter((j) => j.area === area);
  const altJobs = alternativeArea ? allJobs.filter((j) => j.area === alternativeArea) : [];
  const hasAlt = altJobs.length > 0;

  if (allJobs.length === 0) return null;

  const activeJobs = areaTab === 1 && hasAlt ? altJobs : mainJobs;
  const activeArea = areaTab === 1 && hasAlt ? alternativeArea : area;
  const displayJobs = activeJobs.slice(0, 6);

  const toggleExpand = (index) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            <WorkIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: { xs: 20, sm: 24 } }} />
            {t("tests.programSuggestion.result.suggestedJobs.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            {t("tests.programSuggestion.result.suggestedJobs.subtitle")}
          </Typography>

          {hasAlt && (
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              {[
                { label: AREA_LABELS[area] || area, idx: 0, areaKey: area },
                {
                  label: AREA_LABELS[alternativeArea] || alternativeArea,
                  idx: 1,
                  areaKey: alternativeArea,
                },
              ].map(({ label, idx, areaKey }) => {
                const colors = AREA_COLORS[areaKey] || AREA_COLORS.say;
                const isActive = areaTab === idx;
                return (
                  <Chip
                    key={idx}
                    label={`${idx === 0 ? "Ana" : "Alt."}: ${label} (${idx === 0 ? mainJobs.length : altJobs.length})`}
                    onClick={() => {
                      setAreaTab(idx);
                      setExpandedJobs({});
                    }}
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                      backgroundColor: isActive ? colors.bg : "transparent",
                      border: `2px solid ${isActive ? colors.border : "#ccc"}`,
                      color: isActive ? colors.text : "text.secondary",
                      cursor: "pointer",
                    }}
                  />
                );
              })}
            </Box>
          )}

          {activeArea && (
            <Chip
              label={AREA_LABELS[activeArea] || activeArea}
              size="small"
              sx={{
                mb: 2,
                fontWeight: "bold",
                backgroundColor: (AREA_COLORS[activeArea] || AREA_COLORS.say).bg,
                color: (AREA_COLORS[activeArea] || AREA_COLORS.say).text,
                border: `1px solid ${(AREA_COLORS[activeArea] || AREA_COLORS.say).border}`,
              }}
            />
          )}

          <Grid container spacing={2} columnSpacing={3} rowSpacing={2}>
            {displayJobs.map((job, index) => {
              const isExpanded = expandedJobs[index];
              const matchPercent = job.match_score
                ? (job.match_score * 100).toFixed(0)
                : ((1 - job.distance / 7) * 100).toFixed(0);

              return (
                <Grid item xs={12} md={4} key={index}>
                  <Paper
                    elevation={index < 3 ? 3 : 1}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      height: "100%",
                      backgroundColor: index === 0 ? "#e3f2fd" : index < 3 ? "#f5f5f5" : "white",
                      border: index === 0 ? "2px solid #1976d2" : "none",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: { xs: "0.85rem", sm: "1rem" } }}>
                        #{index + 1} {translateJob(job.job)}
                      </Typography>
                      {index === 0 && (
                        <Chip
                          label={t("tests.programSuggestion.result.suggestedJobs.bestMatch", {
                            defaultValue: "En İyi Eşleşme",
                          })}
                          color="primary"
                          size="small"
                        />
                      )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                      <Chip
                        label={`${t("tests.programSuggestion.result.suggestedJobs.compatibility")}: ${matchPercent}%`}
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

                    {/* Expandable explanation */}
                    <Box sx={{ mt: 1.5 }}>
                      <Button
                        size="small"
                        startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => toggleExpand(index)}
                        sx={{ textTransform: "none", p: 0 }}
                      >
                        {t("tests.programSuggestion.result.suggestedJobs.showExplanation", {
                          defaultValue: "Önerinin açıklamasını görmek için tıklayın",
                        })}
                      </Button>

                      <Collapse in={isExpanded}>
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            backgroundColor: "rgba(0,0,0,0.02)",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <InfoIcon
                              sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }}
                            />
                            {job.reason ||
                              t("tests.programSuggestion.result.suggestedJobs.noExplanation", {
                                defaultValue: "Bu meslek, RIASEC profilinize göre önerildi.",
                              })}
                          </Typography>

                          {job.riasec_scores && (
                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
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
                                        score >= 4
                                          ? "#e8f5e9"
                                          : score >= 2.5
                                            ? "#fff3e0"
                                            : "#ffebee",
                                    }}
                                  />
                                ))}
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}

export default SuggestedJobsCard;
