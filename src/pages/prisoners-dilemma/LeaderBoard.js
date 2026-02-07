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
} from "@mui/material";

import { PageLayout } from "@components/templates";
import {
  Button,
  Typography,
  Card,
  Container,
  GridContainer,
  GridItem,
  Center,
} from "@components/atoms";
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

  const headerActions = (
    <Button
      onClick={() =>
        navigate(testRoomId ? `/prisoners-dilemma-room/${testRoomId}` : `/playground/${roomId}`, {
          state: { roomName },
        })
      }
      variant="contained"
    >
      {t("tests.prisonersDilemma.leaderboardPage.backToPlayground")}
    </Button>
  );

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

  if (!loading && !isFinished) {
    return (
      <PageLayout title={`${sessionName} ${t("tests.results")}`} headerActions={headerActions}>
        <Center sx={{ minHeight: 300 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ width: 400, height: 8, borderRadius: 4, mb: SPACING.lg }}
          />
          <Typography variant="h6" color="textSecondary">
            {t("tests.prisonersDilemma.leaderboardPage.gameInProgress")}
          </Typography>
        </Center>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${sessionName} ${t("tests.results")}`}
      loading={loading}
      error={error}
      onRetry={refetch}
      headerActions={headerActions}
    >
      <Container>
        <TableContainer component={Paper} sx={{ mb: SPACING.xl, borderRadius: 2 }}>
          <Table>
            <TableHead
              sx={{
                bgcolor: COLORS.primary,
                "& .MuiTableCell-head": { color: COLORS.white, fontWeight: 600 },
              }}
            >
              <TableRow>
                <TableCell>{t("tests.prisonersDilemma.player")}</TableCell>
                <TableCell>{t("tests.prisonersDilemma.tactic")}</TableCell>
                <TableCell align="right">{t("tests.score")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.map((item, i) => (
                <TableRow key={i} sx={{ "&:hover": { bgcolor: COLORS.grey[50] } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{item.player}</TableCell>
                  <TableCell>{item.short_tactic || "N/A"}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {item.score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" sx={{ mb: SPACING.md }}>
          {t("tests.prisonersDilemma.leaderboardPage.resultsMatrix")}
        </Typography>
        <TableContainer component={Paper} sx={{ mb: SPACING.xl, borderRadius: 2 }}>
          <Table>
            <TableHead
              sx={{
                bgcolor: COLORS.primary,
                "& .MuiTableCell-head": { color: COLORS.white, fontWeight: 600 },
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
                    <TableCell key={o} align="right">
                      {matrix[p]?.[o] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" sx={{ mb: SPACING.md }}>
          {t("tests.participants")}
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
      </Container>
    </PageLayout>
  );
}
