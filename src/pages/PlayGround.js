import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Modal,
  Grid,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  styled,
  Chip,
} from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import { Radar } from "react-chartjs-2";
import QrCodeIcon from "@mui/icons-material/QrCode";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";

// Components
import { PageLayout } from "../components/templates";
import { Button, TextField, Typography } from "../components/atoms";
import { EmptyState } from "../components/molecules";
import ParticipantDetailCard from "../components/organisms/ParticipantDetailCard";
import fetchWithAuth from "../utils/fetchWithAuth";
import { COLORS, SPACING, SHADOWS } from "../theme";

/**
 * Styled Components
 */
const QRBackdrop = styled(Box)({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1300,
  cursor: "pointer",
});

const QRContainer = styled(Box)({
  backgroundColor: COLORS.white,
  padding: SPACING.xl,
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: SPACING.md,
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

const ParticipantHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: SPACING.md,
});

const ParticipantName = styled(Typography)({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: COLORS.primary,
  textTransform: "capitalize",
});

const RadarContainer = styled(Box)({
  marginLeft: "auto",
  marginRight: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  maxWidth: 500,
  height: "auto",
  marginBottom: SPACING.md,
});

const ModalContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  backgroundColor: COLORS.white,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: SHADOWS.xl,
  padding: SPACING.xl,
}));

const ModalTitle = styled("h2")({
  margin: 0,
  marginBottom: SPACING.lg,
  color: COLORS.text.primary,
  fontSize: "1.25rem",
  fontWeight: 600,
});

const HeaderActions = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: SPACING.sm,
  flexWrap: "wrap",
});

const ParticipantCount = styled(Chip)({
  marginRight: SPACING.sm,
  fontWeight: 600,
});

/**
 * Playground Page
 *
 * Displays participants in a game room and allows starting game sessions.
 * Features QR code display, session management, and participant details.
 */
const Playground = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const roomName = location.state?.roomName || "";

  // State
  const [participants, setParticipants] = useState([]);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [blurText, setBlurText] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sessions, setSessions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialogParticipantId, setOpenDialogParticipantId] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch participants
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/players/room/${roomId}`,
          { method: "GET" }
        );

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setParticipants(data);

        // Check authentication
        const authResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/auth`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (authResponse.ok) {
          setIsUserAuthenticated(true);

          // Fetch sessions
          const sessionsResponse = await fetchWithAuth(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/rooms/${roomId}/sessions`
          );

          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            setSessions(sessionsData);
          }
        }
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomId]);

  // Handlers
  const handleClickOpen = useCallback((participantId) => {
    setOpenDialogParticipantId(participantId);
  }, []);

  const handleClose = useCallback(() => {
    setOpenDialogParticipantId(null);
  }, []);

  const handleDelete = useCallback(async () => {
    handleClose();
    const participantId = openDialogParticipantId;

    try {
      const response = await fetchWithAuth(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/players/delete/${participantId}`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    } catch (error) {
      console.error("Failed to delete player:", error);
    }
  }, [handleClose, openDialogParticipantId]);

  const handleStartGame = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      try {
        const formBody = new FormData();
        formBody.append("name", sessionName);

        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/rooms/${roomId}/ready`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            method: "POST",
            body: formBody,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.detail === "All players are not ready") {
            setErrorMessage(errorData.detail);
            setShowErrorModal(true);
          } else {
            throw new Error(errorData.detail || "Failed to create session");
          }
        } else {
          const data = await response.json();
          setSessions((prev) => [...prev, data]);
          setShowModal(false);
          navigate(`/leaderboard/${data.id}`, {
            state: { roomId, roomName },
          });
        }
      } catch (error) {
        console.error("Error creating session:", error);
        alert(`An error occurred: ${error.message}`);
      }
    },
    [sessionName, roomId, roomName, navigate]
  );

  const handleDeleteNotReadyPlayers = useCallback(async () => {
    try {
      const notReadyPlayers = participants.filter((player) => !player.player_tactic);
      for (const player of notReadyPlayers) {
        await fetchWithAuth(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/players/delete/${player.id}`,
          { method: "POST" }
        );
      }
      setShowErrorModal(false);
      handleSubmit();
    } catch (error) {
      console.error("Error deleting not ready players:", error);
    }
  }, [participants, handleSubmit]);

  const handleSessionChange = useCallback(
    (sessionId) => {
      setAnchorEl(null);
      navigate(`/leaderboard/${sessionId}`, { state: { roomId, roomName } });
    },
    [navigate, roomId, roomName]
  );

  const toggleBlur = useCallback(() => setBlurText((prev) => !prev), []);

  const redirectToGameRoom = useCallback(() => navigate("/rooms"), [navigate]);

  // QR Code URL
  const qrUrl = `${process.env.REACT_APP_FRONTEND_BASE_URL}/personalitytest/room/${roomId}`;

  // Radar chart configuration generator
  const getRadarConfig = useCallback(
    (participant) => {
      const data = {
        labels: [
          "Extroversion",
          "Agreeableness",
          "Conscientiousness",
          "Negative Emotionality",
          "Open-mindedness",
        ],
        datasets: [
          {
            label: "Personality Traits",
            data: [
              participant.extroversion ?? 0,
              participant.agreeableness ?? 0,
              participant.conscientiousness ?? 0,
              participant.negative_emotionality ?? 0,
              participant.open_mindedness ?? 0,
            ],
            backgroundColor: "rgba(0, 27, 195, 0.2)",
            borderColor: COLORS.primary,
            borderWidth: 2,
          },
        ],
      };

      const options = {
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20, backdropColor: "transparent" },
            grid: { color: "rgba(0, 0, 0, 0.1)" },
            angleLines: { color: "rgba(0, 0, 0, 0.1)" },
            pointLabels: { font: { size: isSmallScreen ? 12 : 16 } },
          },
        },
        layout: { padding: { top: 20, bottom: 20 } },
        plugins: {
          legend: { display: true, position: "top" },
          tooltip: { enabled: true },
        },
      };

      return { data, options };
    },
    [isSmallScreen]
  );

  // Check if all personality values are present
  const hasAllValues = useCallback((participant) => {
    return [
      participant.extroversion,
      participant.agreeableness,
      participant.conscientiousness,
      participant.negative_emotionality,
      participant.open_mindedness,
    ].every((value) => value !== null);
  }, []);

  // Header actions
  const headerActions = useMemo(
    () => (
      <HeaderActions>
        <ParticipantCount
          label={`${participants.length} Participants`}
          color="primary"
          variant="outlined"
        />

        <Button
          variant="outlined"
          onClick={toggleBlur}
          disabled={!isUserAuthenticated}
          startIcon={blurText ? <VisibilityIcon /> : <VisibilityOffIcon />}
        >
          {blurText ? "Show" : "Hide"}
        </Button>

        <Button
          variant="outlined"
          onClick={redirectToGameRoom}
          disabled={!isUserAuthenticated}
          startIcon={<ArrowBackIcon />}
        >
          Game Rooms
        </Button>

        <Button variant="outlined" onClick={() => setShowQR(true)} startIcon={<QrCodeIcon />}>
          QR Code
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleStartGame}
          disabled={!isUserAuthenticated}
          startIcon={<PlayArrowIcon />}
        >
          Start Game
        </Button>

        {sessions.length > 0 && (
          <Button
            variant="outlined"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            startIcon={<HistoryIcon />}
          >
            Sessions
          </Button>
        )}
      </HeaderActions>
    ),
    [
      participants.length,
      blurText,
      isUserAuthenticated,
      sessions.length,
      toggleBlur,
      redirectToGameRoom,
      handleStartGame,
    ]
  );

  return (
    <PageLayout
      title={`Playground: ${roomName || `Room ${roomId}`}`}
      subtitle="Manage participants and start game sessions"
      loading={loading}
      headerActions={headerActions}
    >
      {/* QR Code Overlay */}
      {showQR && (
        <QRBackdrop onClick={() => setShowQR(false)}>
          <QRContainer onClick={(e) => e.stopPropagation()}>
            <QRCodeCanvas value={qrUrl} size={256} level="H" includeMargin />
            <Typography variant="body2" color="textSecondary">
              {qrUrl}
            </Typography>
            <Button variant="outlined" onClick={() => setShowQR(false)}>
              Close
            </Button>
          </QRContainer>
        </QRBackdrop>
      )}

      {/* Session Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {sessions.map((session) => (
          <MenuItem key={session.id} onClick={() => handleSessionChange(session.id)}>
            {session.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Participants Grid */}
      {participants.length === 0 ? (
        <EmptyState
          title="No Participants Yet"
          message="Share the QR code or link to invite participants to join this room."
          actionLabel="Show QR Code"
          onAction={() => setShowQR(true)}
        />
      ) : (
        <Grid container spacing={3}>
          {participants.map((participant) => {
            const { data: radarData, options: radarOptions } = getRadarConfig(participant);
            const showRadar = hasAllValues(participant) && !blurText;

            return (
              <Grid item xs={12} md={6} key={participant.id}>
                <ParticipantCard>
                  <CardContent>
                    <ParticipantHeader>
                      <ParticipantName>{participant.player_name}</ParticipantName>

                      {isUserAuthenticated && !showQR && (
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() => handleClickOpen(participant.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </ParticipantHeader>

                    {showRadar && (
                      <RadarContainer>
                        <Radar data={radarData} options={radarOptions} />
                      </RadarContainer>
                    )}

                    <ParticipantDetailCard
                      participant={participant}
                      isUserAuthenticated={isUserAuthenticated}
                      blurText={blurText}
                    />
                  </CardContent>
                </ParticipantCard>

                {/* Delete Confirmation Dialog */}
                <Dialog open={openDialogParticipantId === participant.id} onClose={handleClose}>
                  <DialogTitle>Confirm Delete</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to delete {participant.player_name}?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose} variant="text">
                      Cancel
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error">
                      Delete
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create Session Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <ModalTitle>Start New Session</ModalTitle>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Session Name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
              fullWidth
              sx={{ mb: SPACING.lg }}
            />
            <Box sx={{ display: "flex", gap: SPACING.sm, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={!sessionName.trim()}>
                Create Session
              </Button>
            </Box>
          </form>
        </ModalContent>
      </Modal>

      {/* Error Dialog */}
      <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowErrorModal(false)} variant="text">
            Cancel
          </Button>
          <Button onClick={handleDeleteNotReadyPlayers} variant="contained" color="warning">
            Delete Not Ready Players & Start
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default Playground;
