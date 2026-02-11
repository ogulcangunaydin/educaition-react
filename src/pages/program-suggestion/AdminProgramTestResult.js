/**
 * AdminProgramTestResult Page
 *
 * Teacher/admin version of ProgramTestResult.
 * Uses JWT auth instead of student cookie. Read-only (no interaction logging).
 */

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
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { fetchScoreRankingDistribution } from "@services/liseService";
import { getStudentResultAuth } from "@services/programSuggestionService";

import RiasecProfileCard from "./components/RiasecProfileCard";
import SuggestedJobsCard from "./components/SuggestedJobsCard";
import SuggestedProgramsCard from "./components/SuggestedProgramsCard";

const AREA_LABELS = {
  say: "Sayısal (SAY)",
  ea: "Eşit Ağırlık (EA)",
  söz: "Sözel (SÖZ)",
  dil: "Dil",
};

function AdminProgramTestResult() {
  const { studentId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreDistribution, setScoreDistribution] = useState(null);

  useEffect(() => {
    fetchScoreRankingDistribution()
      .then(setScoreDistribution)
      .catch((err) => console.error("Error loading score distribution:", err));
  }, []);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getStudentResultAuth(studentId);
        setResult(data);
      } catch (err) {
        console.error("Error fetching result:", err);
        setError("Sonuçlar yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [studentId]);

  const estimateRanking = (score, area) => {
    if (!scoreDistribution || !area || !score) return null;
    const areaData = scoreDistribution[area.toLowerCase()];
    if (!areaData || !areaData.distribution) return null;
    const distribution = areaData.distribution;
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

  const formatRanking = (ranking) => {
    if (!ranking) return "—";
    return ranking.toLocaleString("tr-TR");
  };

  const renderScoreAndRanking = () => {
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
            <Grid item xs={12} md={hasAlternative ? 6 : 12}>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: "#e8f5e9", height: "100%" }}>
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
            {hasAlternative && (
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2, backgroundColor: "#fff3e0", height: "100%" }}>
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
        <Typography>Sonuçlar yükleniyor...</Typography>
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
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: 4 }}>
      <Paper sx={{ maxWidth: 900, margin: "0 auto", p: 4 }}>
        <Chip label="Öğretmen Görünümü" color="warning" size="small" sx={{ mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
          🎓 {result?.name ? `${result.name} - Test Sonuçları` : "Test Sonuçları"}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mb: 4 }}>
          RIASEC kariyer testi ve tercihlerine göre öğrenci önerileri
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

        <RiasecProfileCard riasecScores={result?.riasec_scores} />

        <SuggestedJobsCard
          suggestedJobs={result?.suggested_jobs}
          userRiasecScores={result?.riasec_scores}
          area={result?.area}
          alternativeArea={result?.alternative_area}
        />

        <SuggestedProgramsCard
          suggestedPrograms={result?.suggested_programs}
          suggestedJobs={result?.suggested_jobs}
          area={result?.area}
          alternativeArea={result?.alternative_area}
          onProgramClick={() => {}}
        />

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Bu öneriler RIASEC kariyer testi ve tercihlerine göre oluşturulmuştur.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default AdminProgramTestResult;
