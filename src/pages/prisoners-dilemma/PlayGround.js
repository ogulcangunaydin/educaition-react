import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTheme, useMediaQuery, Menu, MenuItem, Chip } from "@mui/material";
import { Radar } from "react-chartjs-2";
import QrCodeIcon from "@mui/icons-material/QrCode";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";

import { PageLayout } from "@components/templates";
import { Button, TextField, Modal, Card, GridContainer, GridItem, Flex } from "@components/atoms";
import { EmptyState, ConfirmDialog, QRCodeOverlay } from "@components/molecules";
import ParticipantDetailCard from "@organisms/ParticipantDetailCard";
import { usePlayground } from "@hooks/prisoners-dilemma";
import { COLORS, SPACING } from "@theme";
import "./styles.css";

export default function PlayGround() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const roomName = location.state?.roomName || "";

  const {
    participants,
    sessions,
    isAuthenticated,
    loading,
    showQR,
    blurText,
    qrUrl,
    deleteParticipant,
    deleteNotReadyPlayers,
    createSession,
    toggleBlur,
    openQR,
    closeQR,
  } = usePlayground(roomId);

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDeleteParticipant = useCallback(async () => {
    await deleteParticipant(deleteId);
    setDeleteId(null);
  }, [deleteId, deleteParticipant]);

  const handleCreateSession = useCallback(
    async (e) => {
      e?.preventDefault();
      const result = await createSession(sessionName);

      if (result.success) {
        setShowSessionModal(false);
        navigate(`/leaderboard/${result.session.id}`, { state: { roomId, roomName } });
      } else if (result.notReady) {
        setErrorMessage(result.error);
        setShowErrorDialog(true);
      }
    },
    [sessionName, createSession, roomId, roomName, navigate]
  );

  const handleDeleteNotReady = useCallback(async () => {
    await deleteNotReadyPlayers();
    setShowErrorDialog(false);
    handleCreateSession();
  }, [deleteNotReadyPlayers, handleCreateSession]);

  const getRadarConfig = useCallback(
    (p) => ({
      data: {
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
              p.extroversion ?? 0,
              p.agreeableness ?? 0,
              p.conscientiousness ?? 0,
              p.negative_emotionality ?? 0,
              p.open_mindedness ?? 0,
            ],
            backgroundColor: "rgba(0, 27, 195, 0.2)",
            borderColor: COLORS.primary,
            borderWidth: 2,
          },
        ],
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            pointLabels: { font: { size: isSmallScreen ? 12 : 16 } },
          },
        },
        plugins: { legend: { display: true, position: "top" } },
      },
    }),
    [isSmallScreen]
  );

  const hasAllTraits = (p) =>
    [
      p.extroversion,
      p.agreeableness,
      p.conscientiousness,
      p.negative_emotionality,
      p.open_mindedness,
    ].every((v) => v !== null);

  const headerActions = useMemo(
    () => (
      <Flex gap="sm" wrap>
        <Chip label={`${participants.length} Participants`} color="primary" variant="outlined" />
        <Button
          variant="outlined"
          onClick={toggleBlur}
          disabled={!isAuthenticated}
          startIcon={blurText ? <VisibilityIcon /> : <VisibilityOffIcon />}
        >
          {blurText ? "Show" : "Hide"}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate("/rooms")}
          disabled={!isAuthenticated}
          startIcon={<ArrowBackIcon />}
        >
          Rooms
        </Button>
        <Button variant="outlined" onClick={openQR} startIcon={<QrCodeIcon />}>
          QR
        </Button>
        <Button
          variant="contained"
          onClick={() => setShowSessionModal(true)}
          disabled={!isAuthenticated}
          startIcon={<PlayArrowIcon />}
        >
          Start
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
      </Flex>
    ),
    [participants.length, blurText, isAuthenticated, sessions.length, navigate, toggleBlur, openQR]
  );

  return (
    <PageLayout
      title={`Playground: ${roomName || roomId}`}
      loading={loading}
      headerActions={headerActions}
    >
      {showQR && <QRCodeOverlay url={qrUrl} onClose={closeQR} />}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {sessions.map((s) => (
          <MenuItem
            key={s.id}
            onClick={() => {
              setAnchorEl(null);
              navigate(`/leaderboard/${s.id}`, { state: { roomId, roomName } });
            }}
          >
            {s.name}
          </MenuItem>
        ))}
      </Menu>

      {participants.length === 0 ? (
        <EmptyState
          title="No Participants Yet"
          message="Share the QR code to invite participants."
          actionLabel="Show QR Code"
          onAction={openQR}
        />
      ) : (
        <GridContainer spacing="lg">
          {participants.map((p) => {
            const { data, options } = getRadarConfig(p);
            return (
              <GridItem key={p.id} xs={12} md={6}>
                <Card
                  title={p.player_name}
                  headerAction={
                    isAuthenticated && (
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => setDeleteId(p.id)}
                      >
                        Delete
                      </Button>
                    )
                  }
                >
                  {hasAllTraits(p) && !blurText && (
                    <div className="radar-container">
                      <Radar data={data} options={options} />
                    </div>
                  )}
                  <ParticipantDetailCard
                    participant={p}
                    isUserAuthenticated={isAuthenticated}
                    blurText={blurText}
                  />
                </Card>
              </GridItem>
            );
          })}
        </GridContainer>
      )}

      <Modal
        open={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title="Start New Session"
        actions={
          <>
            <Button variant="outlined" onClick={() => setShowSessionModal(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!sessionName.trim()}
              onClick={handleCreateSession}
            >
              Create
            </Button>
          </>
        }
      >
        <TextField
          label="Session Name"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          fullWidth
          required
          sx={{ mb: SPACING.md }}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteParticipant}
        title="Delete Participant"
        message="Are you sure you want to delete this participant?"
        confirmLabel="Delete"
        confirmColor="error"
      />

      <ConfirmDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        onConfirm={handleDeleteNotReady}
        title="Error"
        message={errorMessage}
        confirmLabel="Delete Not Ready & Start"
        confirmColor="warning"
      />
    </PageLayout>
  );
}
