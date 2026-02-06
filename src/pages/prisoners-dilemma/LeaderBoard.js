import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { Button, Typography, Card } from "@components/atoms";
import { Container, GridContainer, GridItem, Center } from "@components/atoms/Container";
import ParticipantDetailCard from "@organisms/ParticipantDetailCard";
import { useLeaderboard } from "@hooks/prisoners-dilemma";
import { COLORS, SPACING } from "@theme";
import "./styles.css";

const formatTrait = (v) => (v !== null ? v.toFixed(2) : "N/A");

export default function LeaderBoard() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const roomId = location.state?.roomId;
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
      onClick={() => navigate(`/playground/${roomId}`, { state: { roomName } })}
      variant="contained"
    >
      Back to Playground
    </Button>
  );

  if (!loading && !isFinished) {
    return (
      <PageLayout title={`${sessionName} Results`} headerActions={headerActions}>
        <Center sx={{ minHeight: 300 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ width: 400, height: 8, borderRadius: 4, mb: SPACING.lg }}
          />
          <Typography variant="h6" color="textSecondary">
            Game in progress. Please wait...
          </Typography>
        </Center>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${sessionName} Results`}
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
                <TableCell>Player</TableCell>
                <TableCell>Tactic</TableCell>
                <TableCell align="right">Score</TableCell>
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
          Results Matrix
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
                <TableCell>Player</TableCell>
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
          Participants
        </Typography>
        <GridContainer spacing="lg">
          {participants.map((p) => (
            <GridItem key={p.id} xs={12} md={6}>
              <Card title={p.player_name}>
                <div className="trait-row">
                  <span>Extroversion:</span>
                  <span>{formatTrait(p.extroversion)}</span>
                </div>
                <div className="trait-row">
                  <span>Agreeableness:</span>
                  <span>{formatTrait(p.agreeableness)}</span>
                </div>
                <div className="trait-row">
                  <span>Conscientiousness:</span>
                  <span>{formatTrait(p.conscientiousness)}</span>
                </div>
                <div className="trait-row">
                  <span>Negative Emotionality:</span>
                  <span>{formatTrait(p.negative_emotionality)}</span>
                </div>
                <div className="trait-row">
                  <span>Open-mindedness:</span>
                  <span>{formatTrait(p.open_mindedness)}</span>
                </div>
                <ParticipantDetailCard participant={p} isUserAuthenticated blurText={false} />
              </Card>
            </GridItem>
          ))}
        </GridContainer>
      </Container>
    </PageLayout>
  );
}
