import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
  Alert,
  LinearProgress,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import jobTranslations from "./RiasecTest/job_translations.json";

// Normalize string for comparison (handle dash/comma confusion, whitespace, etc.)
const normalizeForComparison = (str) => {
  return str
    .toLocaleLowerCase("en-US")
    .replace(/[,\-–—]/g, "") // Remove commas and all types of dashes
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

// Helper function to translate job name from English to Turkish
const translateJob = (englishName) => {
  const normalizedInput = normalizeForComparison(englishName);
  const translation = jobTranslations.find(
    (job) => normalizeForComparison(job.en) === normalizedInput
  );
  return translation ? translation.tr : englishName;
};

// Area labels in Turkish
const AREA_LABELS = {
  say: "Sayısal (SAY)",
  ea: "Eşit Ağırlık (EA)",
  söz: "Sözel (SÖZ)",
  dil: "Dil",
};

// RIASEC type descriptions
const RIASEC_DESCRIPTIONS = {
  R: {
    name: "Realistic (Gerçekçi)",
    description: "Pratik, fiziksel aktiviteler, el işleri, mekanik",
  },
  I: {
    name: "Investigative (Araştırmacı)",
    description: "Analitik düşünme, araştırma, bilim",
  },
  A: {
    name: "Artistic (Sanatsal)",
    description: "Yaratıcılık, sanat, ifade özgürlüğü",
  },
  S: {
    name: "Social (Sosyal)",
    description: "İnsanlarla çalışma, yardım etme, öğretme",
  },
  E: {
    name: "Enterprising (Girişimci)",
    description: "Liderlik, ikna, iş yönetimi",
  },
  C: {
    name: "Conventional (Geleneksel)",
    description: "Organizasyon, veri işleme, detay odaklı",
  },
};

function ProgramTestResult() {
  const { studentId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreDistribution, setScoreDistribution] = useState(null);

  // Load score distribution data
  useEffect(() => {
    const loadScoreDistribution = async () => {
      try {
        const response = await fetch("/assets/data_2025/score_ranking_distribution.json");
        const data = await response.json();
        setScoreDistribution(data);
      } catch (error) {
        console.error("Error loading score distribution:", error);
      }
    };
    loadScoreDistribution();
  }, []);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/program-suggestion/students/${studentId}/result`
        );

        if (response.ok) {
          const data = await response.json();
          setResult(data);
        } else {
          setError("Sonuçlar yüklenemedi. Lütfen daha sonra tekrar deneyin.");
        }
      } catch (error) {
        console.error("Error fetching result:", error);
        setError("Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [studentId]);

  // Estimate ranking based on score for a given area
  const estimateRanking = (score, area) => {
    if (!scoreDistribution || !area || !score) return null;

    const areaData = scoreDistribution[area.toLowerCase()];
    if (!areaData || !areaData.distribution) return null;

    const distribution = areaData.distribution;

    // Find the closest score bucket
    let closestIdx = 0;
    let minDiff = Infinity;

    for (let i = 0; i < distribution.length; i++) {
      const diff = Math.abs(distribution[i].score - score);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    return distribution[closestIdx].avgRanking;
  };

  // Format ranking with thousands separator
  const formatRanking = (ranking) => {
    if (!ranking) return "—";
    return ranking.toLocaleString("tr-TR");
  };

  const renderScoreAndRanking = () => {
    console.log("Result in renderScoreAndRanking:", result);
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
            Puan ve Sıralama Tahmini
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Belirlediğiniz puan aralığına göre tahmini sıralamanız
          </Typography>

          <Grid container spacing={2}>
            {/* Main Area */}
            <Grid item xs={12} md={hasAlternative ? 6 : 12}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  backgroundColor: "#e8f5e9",
                  height: "100%",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ana Alan
                </Typography>
                <Chip
                  label={AREA_LABELS[result.area] || result.area.toUpperCase()}
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body1" sx={{ fontWeight: "bold", mt: 1 }}>
                  📊 Puan Aralığı: {result.expected_score_min} - {result.expected_score_max}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Orta Puan: {midScore}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  🎯 Tahmini Sıralama
                </Typography>
                <Typography variant="h5" color="success.main" sx={{ fontWeight: "bold" }}>
                  {formatRanking(estimatedRanking)}
                </Typography>
              </Paper>
            </Grid>

            {/* Alternative Area */}
            {hasAlternative && (
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    backgroundColor: "#fff3e0",
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Alternatif Alan
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
                    📊 Puan Aralığı: {result.alternative_score_min} - {result.alternative_score_max}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Orta Puan: {altMidScore}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    🎯 Tahmini Sıralama
                  </Typography>
                  <Typography variant="h5" color="warning.main" sx={{ fontWeight: "bold" }}>
                    {formatRanking(altEstimatedRanking)}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            * Tahmini sıralama, geçen yılın verilerine göre hesaplanmıştır.
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const renderRiasecProfile = () => {
    if (!result?.riasec_scores) return null;

    const maxScore = 7;
    const sortedScores = Object.entries(result.riasec_scores).sort((a, b) => b[1] - a[1]);

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 RIASEC Profili
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Kişilik profilinize göre en yüksek puanlarınız
          </Typography>

          {sortedScores.map(([letter, score]) => (
            <Box key={letter} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2">
                  <strong>{letter}</strong> - {RIASEC_DESCRIPTIONS[letter]?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {score.toFixed(2)} / {maxScore}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(score / maxScore) * 100}
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
                {RIASEC_DESCRIPTIONS[letter]?.description}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderSuggestedJobs = () => {
    if (!result?.suggested_jobs || result.suggested_jobs.length === 0) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <WorkIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Önerilen Meslekler
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            RIASEC profilinize en uygun meslekler
          </Typography>

          <Grid container spacing={2}>
            {result.suggested_jobs.map((job, index) => (
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
                      label={`Uyumluluk: ${job.match_score ? (job.match_score * 100).toFixed(0) : ((1 - job.distance / 7) * 100).toFixed(0)}%`}
                      color={index === 0 ? "success" : "default"}
                      size="small"
                    />
                    {job.holland_code && (
                      <Chip
                        label={`Kod: ${job.holland_code}`}
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
                        Meslek RIASEC Profili:
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
  };

  const renderSuggestedPrograms = () => {
    if (!result?.suggested_programs || result.suggested_programs.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          Program önerileri hesaplanıyor veya kriterlere uygun program bulunamadı.
        </Alert>
      );
    }

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <SchoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Önerilen Programlar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Profilinize ve tercihlerinize uygun üniversite programları
          </Typography>

          {result.suggested_programs.map((program, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                borderLeft: `4px solid ${index < 3 ? "#4caf50" : index < 6 ? "#2196f3" : "#9c27b0"}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
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
                      label={`Taban: ${program.taban_score}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
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
                    label={`Meslek: ${translateJob(program.job)}`}
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
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Sonuçlarınız yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          p: 3,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        py: 4,
      }}
    >
      <Paper sx={{ maxWidth: 900, margin: "0 auto", p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
          🎓 Test Sonuçlarınız
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mb: 4 }}>
          RIASEC kariyer testi ve tercihlerinize göre size özel öneriler
        </Typography>

        {result?.area && (
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Chip label={`Ana Alan: ${result.area.toUpperCase()}`} color="primary" sx={{ mr: 1 }} />
            {result.alternative_area && (
              <Chip
                label={`Alternatif: ${result.alternative_area.toUpperCase()}`}
                color="secondary"
              />
            )}
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {renderScoreAndRanking()}
        {renderRiasecProfile()}
        {renderSuggestedJobs()}
        {renderSuggestedPrograms()}

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Bu öneriler RIASEC kariyer testi ve tercihlerinize göre oluşturulmuştur. Son kararı
            verirken aileniz ve danışmanlarınızla görüşmenizi öneririz.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default ProgramTestResult;
