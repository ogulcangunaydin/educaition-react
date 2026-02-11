/**
 * SuggestedJobsCard — Displays RIASEC-matched job suggestions
 *
 * Features:
 * - Shows top 6 job recommendations
 * - Expandable explanations for each job
 * - "Why this fits you?" modal with RIASEC match reasoning
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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoIcon from "@mui/icons-material/Info";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
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

// RIASEC type descriptions for "Why this fits" modal
const RIASEC_DESCRIPTIONS = {
  R: {
    name: "Realistic (Gerçekçi)",
    traits: "Pratik, el becerileri, mekanik yetenekler",
  },
  I: {
    name: "Investigative (Araştırmacı)",
    traits: "Analitik düşünce, araştırma, problem çözme",
  },
  A: {
    name: "Artistic (Artistik)",
    traits: "Yaratıcılık, sanatsal ifade, özgünlük",
  },
  S: {
    name: "Social (Sosyal)",
    traits: "İnsanlarla çalışma, yardım etme, iletişim",
  },
  E: {
    name: "Enterprising (Girişimci)",
    traits: "Liderlik, ikna, risk alma",
  },
  C: {
    name: "Conventional (Geleneksel)",
    traits: "Düzen, detay odaklı, prosedürlere uyum",
  },
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
  const [selectedJob, setSelectedJob] = useState(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);
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

  const openWhyModal = (job) => {
    setSelectedJob(job);
    setWhyModalOpen(true);
  };

  const getMatchReason = (job) => {
    if (!job.riasec_scores || !userRiasecScores) return [];

    const reasons = [];
    const sortedUserScores = Object.entries(userRiasecScores).sort((a, b) => b[1] - a[1]);
    const topUserTypes = sortedUserScores.slice(0, 3).map(([letter]) => letter);

    Object.entries(job.riasec_scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([letter, score]) => {
        if (topUserTypes.includes(letter)) {
          const userScore = userRiasecScores[letter] || 0;
          reasons.push({
            letter,
            type: RIASEC_DESCRIPTIONS[letter],
            jobScore: score,
            userScore,
            isMatch: true,
          });
        }
      });

    return reasons;
  };

  const getJobExplanation = (job) => {
    const hollandCode = job.holland_code || "";
    const letters = hollandCode.split("");
    const parts = letters.map((letter) => RIASEC_DESCRIPTIONS[letter]?.traits || "");
    return parts.filter(Boolean).join(", ");
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <WorkIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            {t("tests.programSuggestion.result.suggestedJobs.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("tests.programSuggestion.result.suggestedJobs.subtitle")}
          </Typography>

          {hasAlt && (
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
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
                    label={`${idx === 0 ? "Ana Alan" : "Alternatif Alan"}: ${label} (${idx === 0 ? mainJobs.length : altJobs.length})`}
                    onClick={() => {
                      setAreaTab(idx);
                      setExpandedJobs({});
                    }}
                    sx={{
                      fontWeight: "bold",
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

          <Grid container spacing={2} columnSpacing={3} rowSpacing={10}>
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
                      p: 2,
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
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
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
                            {getJobExplanation(job) ||
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

                          <Button
                            size="small"
                            variant="text"
                            startIcon={<HelpOutlineIcon />}
                            onClick={() => openWhyModal(job)}
                            sx={{ textTransform: "none" }}
                          >
                            {t("tests.programSuggestion.result.suggestedJobs.whyFits", {
                              defaultValue: "Bu meslek sana neden uyuyor?",
                            })}
                          </Button>
                        </Box>
                      </Collapse>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {suggestedJobs.length > 6 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2, textAlign: "center" }}
            >
              {t("tests.programSuggestion.result.suggestedJobs.moreJobs", {
                count: suggestedJobs.length - 6,
                defaultValue: `+${suggestedJobs.length - 6} daha fazla öneri mevcut`,
              })}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Why This Fits Modal */}
      <Dialog open={whyModalOpen} onClose={() => setWhyModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <HelpOutlineIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          {t("tests.programSuggestion.result.suggestedJobs.whyFitsTitle", {
            defaultValue: "Bu meslek sana neden uyuyor?",
          })}
        </DialogTitle>
        <DialogContent dividers>
          {selectedJob && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {translateJob(selectedJob.job)}
              </Typography>

              {selectedJob.holland_code && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Holland Kodu: <strong>{selectedJob.holland_code}</strong>
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                {t("tests.programSuggestion.result.suggestedJobs.matchingTraits", {
                  defaultValue: "Eşleşen Özellikler:",
                })}
              </Typography>

              {getMatchReason(selectedJob).length > 0 ? (
                getMatchReason(selectedJob).map((reason, idx) => (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2">
                        <strong>{reason.letter}</strong> - {reason.type.name}
                      </Typography>
                      <Chip
                        label={t("tests.programSuggestion.result.suggestedJobs.matched", {
                          defaultValue: "Eşleşti",
                        })}
                        color="success"
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 0.5 }}
                    >
                      {reason.type.traits}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption">
                          {t("tests.programSuggestion.result.suggestedJobs.yourScore", {
                            defaultValue: "Senin puanın",
                          })}
                          :
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(reason.userScore / 7) * 100}
                          sx={{ height: 8, borderRadius: 4, backgroundColor: "#e0e0e0" }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption">
                          {t("tests.programSuggestion.result.suggestedJobs.jobNeeds", {
                            defaultValue: "Meslek gereksinimleri",
                          })}
                          :
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(reason.jobScore / 7) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#e0e0e0",
                            "& .MuiLinearProgress-bar": { backgroundColor: "#1976d2" },
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t("tests.programSuggestion.result.suggestedJobs.generalMatch", {
                    defaultValue: "Bu meslek, genel RIASEC profilinize göre önerilmiştir.",
                  })}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                {t("tests.programSuggestion.result.suggestedJobs.explainer", {
                  defaultValue:
                    "RIASEC testi, ilgi alanlarınızı 6 farklı kategoride ölçer. Bu meslek, sizin en güçlü olduğunuz kategorilerle uyumlu olduğu için önerilmiştir.",
                })}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWhyModalOpen(false)}>
            {t("common.close", { defaultValue: "Kapat" })}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SuggestedJobsCard;
