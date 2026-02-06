import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  styled,
  Box,
} from "@mui/material";
import fetchWithAuth from "../utils/fetchWithAuth";
import ParticipantDetailCard from "../components/organisms/ParticipantDetailCard";

// Components
import { PageLayout } from "../components/templates";
import { Button, Typography } from "../components/atoms";
import { COLORS, SPACING, SHADOWS } from "../theme";

/**
 * Styled Components
 */
const ContentContainer = styled(Container)(({ theme }) => ({
  paddingTop: SPACING.xl,
  paddingBottom: SPACING.xl,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  boxShadow: SHADOWS.md,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  marginBottom: SPACING.xl,
}));

const StyledTableHead = styled(TableHead)({
  backgroundColor: COLORS.primary,
  "& .MuiTableCell-head": {
    color: COLORS.white,
    fontWeight: 600,
  },
});

const WaitingContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 300,
  textAlign: "center",
  gap: SPACING.lg,
});

const ProgressContainer = styled(Box)({
  width: "100%",
  maxWidth: 400,
});

const ParticipantCard = styled(Card)(({ theme }) => ({
  height: "100%",
  boxShadow: SHADOWS.md,
  borderRadius: theme.shape.borderRadius * 2,
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: SHADOWS.lg,
    transform: "translateY(-4px)",
  },
}));

const ParticipantName = styled(Box)({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: COLORS.primary,
  marginBottom: SPACING.md,
  textTransform: "capitalize",
});

const TraitRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: SPACING.xs,
  fontSize: "0.875rem",
  color: COLORS.text.secondary,
});

/**
 * Helper function to safely parse JSON
 */
const isJsonString = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Format trait value
 */
const formatTrait = (value) => (value !== null ? value.toFixed(2) : "N/A");

/**
 * Leaderboard Page
 *
 * Displays game session results including leaderboard,
 * results matrix, and participant details.
 */
const Leaderboard = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const roomId = location.state?.roomId;
  const roomName = location.state?.roomName;
  const navigate = useNavigate();

  const [scores, setScores] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [participants, setParticipants] = useState([]);
  const [sessionName, setSessionName] = useState("");
  const [sessionStatus, setSessionStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessionData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/sessions/${sessionId}`
      );

      if (!response.ok) {
        throw new Error("Session data could not be fetched");
      }

      const data = await response.json();
      setSessionName(data.name);
      setSessionStatus(data.status);

      if (data.status === "finished") {
        const parsedResults =
          typeof data.results === "string" && isJsonString(data.results)
            ? JSON.parse(data.results)
            : data.results;

        const leaderboardArray = Object.entries(parsedResults.leaderboard).map(
          ([player, { score, short_tactic }]) => ({
            player,
            score,
            short_tactic,
          })
        );

        setScores(leaderboardArray);
        setMatrix(parsedResults.matrix);

        const participantsResponse = await fetchWithAuth(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/players/${data.player_ids}`
        );

        if (!participantsResponse.ok) {
          throw new Error("Failed to fetch participants");
        }

        const participantsData = await participantsResponse.json();
        setParticipants(participantsData);
      }
    } catch (err) {
      console.error("Failed to fetch session data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  const playerNames = Object.keys(matrix);

  const handleBackToPlayground = useCallback(() => {
    navigate(`/playground/${roomId}`, { state: { roomName } });
  }, [navigate, roomId, roomName]);

  // Header actions
  const headerActions = (
    <Button onClick={handleBackToPlayground} variant="contained">
      Back to Playground
    </Button>
  );

  // Waiting state - game not finished
  if (!loading && sessionStatus !== "finished") {
    return (
      <PageLayout title={`${sessionName} Session Results`} headerActions={headerActions}>
        <ContentContainer>
          <WaitingContainer>
            <ProgressContainer>
              <LinearProgress
                variant="determinate"
                value={Number(sessionStatus) || 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </ProgressContainer>
            <Typography variant="h5" color="textSecondary">
              Game is not finished yet, please wait and check this page regularly.
            </Typography>
          </WaitingContainer>
        </ContentContainer>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${sessionName} Session Results`}
      loading={loading}
      error={error}
      onRetry={fetchSessionData}
      headerActions={headerActions}
    >
      <ContentContainer>
        {/* Leaderboard Table */}
        <StyledTableContainer component={Paper}>
          <Table aria-label="leaderboard table">
            <StyledTableHead>
              <TableRow>
                <TableCell>Player Name</TableCell>
                <TableCell>Player Tactic Summary</TableCell>
                <TableCell align="right">Score</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {scores.map((item, index) => (
                <TableRow key={index} sx={{ "&:hover": { backgroundColor: COLORS.grey[50] } }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                    {item.player}
                  </TableCell>
                  <TableCell>{item.short_tactic || "N/A"}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {item.score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>

        {/* Results Matrix */}
        <Typography variant="h6" sx={{ mb: SPACING.md }}>
          Game Results Matrix
        </Typography>
        <StyledTableContainer component={Paper}>
          <Table aria-label="game results matrix">
            <StyledTableHead>
              <TableRow>
                <TableCell>Player \ Player</TableCell>
                {playerNames.map((player) => (
                  <TableCell key={player} align="right">
                    {player}
                  </TableCell>
                ))}
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {playerNames.map((player) => (
                <TableRow key={player}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                    {player}
                  </TableCell>
                  {playerNames.map((opponent) => (
                    <TableCell key={opponent} align="right">
                      {matrix[player]?.[opponent] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>

        {/* Participants Grid */}
        <Typography variant="h6" sx={{ mb: SPACING.md }}>
          Participant Details
        </Typography>
        <Grid container spacing={3}>
          {participants.map((participant) => (
            <Grid item xs={12} md={6} key={participant.id}>
              <ParticipantCard>
                <CardContent>
                  <ParticipantName>{participant.player_name}</ParticipantName>

                  <Box sx={{ mb: SPACING.md }}>
                    <TraitRow>
                      <span>Extroversion:</span>
                      <span>{formatTrait(participant.extroversion)}</span>
                    </TraitRow>
                    <TraitRow>
                      <span>Agreeableness:</span>
                      <span>{formatTrait(participant.agreeableness)}</span>
                    </TraitRow>
                    <TraitRow>
                      <span>Conscientiousness:</span>
                      <span>{formatTrait(participant.conscientiousness)}</span>
                    </TraitRow>
                    <TraitRow>
                      <span>Negative Emotionality:</span>
                      <span>{formatTrait(participant.negative_emotionality)}</span>
                    </TraitRow>
                    <TraitRow>
                      <span>Open-mindedness:</span>
                      <span>{formatTrait(participant.open_mindedness)}</span>
                    </TraitRow>
                  </Box>

                  <ParticipantDetailCard
                    participant={participant}
                    isUserAuthenticated={true}
                    blurText={false}
                  />
                </CardContent>
              </ParticipantCard>
            </Grid>
          ))}
        </Grid>
      </ContentContainer>
    </PageLayout>
  );
};

export default Leaderboard;
