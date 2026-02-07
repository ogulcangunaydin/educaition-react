import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Box,
  Chip,
} from "@mui/material";
import { EmojiEvents as TrophyIcon } from "@mui/icons-material";

import { PageLayout, PageLoading } from "@components/templates";
import { Button, Typography, Card, GridContainer, GridItem, Center } from "@components/atoms";
import { RadarChart } from "@components/organisms";
import ParticipantDetailCard from "@organisms/ParticipantDetailCard";
import { useLeaderboard } from "@hooks/prisoners-dilemma";
import { COLORS, SPACING } from "@theme";
import "./styles.css";

export default function LeaderBoard() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const roomId = location.state?.roomId;
  const testRoomId = location.state?.testRoomId;
  const roomName = location.state?.roomName;

  const {
    sessionName,
    scores,
    matrix,
    participants,
    loading,
    error,
    isFinished,
    progress,
    playerNames,
    refetch,
  } = useLeaderboard(sessionId);

  const handleBack = () =>
    navigate(testRoomId ? `/prisoners-dilemma-room/${testRoomId}` : `/playground/${roomId}`, {
      state: { roomName },
    });

  const getRankDisplay = (index) => {
    const medals = ["🥇", "🥈", "🥉"];
    return medals[index] || `${index + 1}`;
  };

  const personalityLabels = [
    t("tests.personality.traits.extraversion"),
    t("tests.personality.traits.agreeableness"),
    t("tests.personality.traits.conscientiousness"),
    t("tests.personality.traits.neuroticism"),
    t("tests.personality.traits.openness"),
  ];

  const getRadarDatasets = (p) => [
    {
      label: t("tests.prisonersDilemma.playgroundPage.personalityTraits"),
      data: [
        p.extroversion ?? 0,
        p.agreeableness ?? 0,
        p.conscientiousness ?? 0,
        p.negative_emotionality ?? 0,
        p.open_mindedness ?? 0,
      ],
    },
  ];

  const hasAllTraits = (p) =>
    [
      p.extroversion,
      p.agreeableness,
      p.conscientiousness,
      p.negative_emotionality,
      p.open_mindedness,
    ].every((v) => v !== null);

  if (loading) {
    return <PageLoading title={sessionName || t("common.loading")} onBack={handleBack} />;
  }

  if (!isFinished) {
    return (
      <PageLayout
        title={sessionName || t("tests.prisonersDilemma.leaderboardPage.gameInProgress")}
        showBackButton
        onBack={handleBack}
        headerProps={{
          children: (
            <Button onClick={handleBack} variant="contained">
              {t("tests.prisonersDilemma.leaderboardPage.backToPlayground")}
            </Button>
          ),
        }}
      >
        <Center sx={{ minHeight: "60vh" }}>
          <TrophyIcon sx={{ fontSize: 64, color: COLORS.primary, mb: 2, opacity: 0.6 }} />
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            {t("tests.prisonersDilemma.leaderboardPage.gameInProgress")}
          </Typography>
          <Box sx={{ width: "100%", maxWidth: 500, mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            {Math.round(progress)}% {t("common.completed")}
          </Typography>
        </Center>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${sessionName} - ${t("tests.results")}`}
      showBackButton
      onBack={handleBack}
      error={error}
      onRetry={refetch}
      headerProps={{
        children: (
          <Button onClick={handleBack} variant="contained">
            {t("tests.prisonersDilemma.leaderboardPage.backToPlayground")}
          </Button>
        ),
      }}
    >
      {/* Scores Table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          🏆 {t("tests.prisonersDilemma.leaderboardPage.scoreboardTitle")}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {t("tests.prisonersDilemma.leaderboardPage.scoreboardDescription")}
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead
              sx={{
                bgcolor: COLORS.primary,
                "& .MuiTableCell-head": { color: COLORS.white, fontWeight: 600 },
              }}
            >
              <TableRow>
                <TableCell width={60} align="center">
                  #
                </TableCell>
                <TableCell>{t("tests.prisonersDilemma.player")}</TableCell>
                <TableCell>{t("tests.prisonersDilemma.tactic")}</TableCell>
                <TableCell align="right">{t("tests.score")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.map((item, i) => (
                <TableRow
                  key={i}
                  sx={{
                    "&:hover": { bgcolor: COLORS.grey[50] },
                    ...(i === 0 && {
                      bgcolor: "rgba(255, 215, 0, 0.08)",
                    }),
                  }}
                >
                  <TableCell align="center" sx={{ fontSize: i < 3 ? "1.3rem" : "0.875rem" }}>
                    {getRankDisplay(i)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: i === 0 ? 700 : 500 }}>{item.player}</TableCell>
                  <TableCell>
                    <Chip label={item.short_tactic || "N/A"} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    {item.score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Results Matrix */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          📊 {t("tests.prisonersDilemma.leaderboardPage.resultsMatrix")}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {t("tests.prisonersDilemma.leaderboardPage.matrixDescription")}
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: "auto" }}>
          <Table size="small">
            <TableHead
              sx={{
                bgcolor: COLORS.primary,
                "& .MuiTableCell-head": {
                  color: COLORS.white,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                },
              }}
            >
              <TableRow>
                <TableCell>{t("tests.prisonersDilemma.player")}</TableCell>
                {playerNames.map((p) => (
                  <TableCell key={p} align="right">
                    {p}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {playerNames.map((p) => (
                <TableRow key={p}>
                  <TableCell sx={{ fontWeight: 500 }}>{p}</TableCell>
                  {playerNames.map((o) => (
                    <TableCell
                      key={o}
                      align="right"
                      sx={{
                        bgcolor: p === o ? COLORS.grey[100] : "transparent",
                        fontWeight: p === o ? 400 : 500,
                        color: p === o ? COLORS.grey[400] : "inherit",
                      }}
                    >
                      {p === o ? "—" : matrix[p]?.[o] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Participants */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          👥 {t("tests.participants")}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {t("tests.prisonersDilemma.leaderboardPage.participantsDescription")}
        </Typography>
        <GridContainer spacing="lg">
          {participants.map((p) => (
            <GridItem key={p.id} xs={12} md={6}>
              <Card title={p.player_name}>
                {hasAllTraits(p) && (
                  <RadarChart
                    labels={personalityLabels}
                    datasets={getRadarDatasets(p)}
                    showLegend
                    sx={{ mb: 2 }}
                  />
                )}
                <ParticipantDetailCard participant={p} isUserAuthenticated blurText={false} />
              </Card>
            </GridItem>
          ))}
        </GridContainer>
      </Box>
    </PageLayout>
  );
}
