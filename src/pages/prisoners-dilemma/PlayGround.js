import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, MenuItem, Chip } from "@mui/material";
import QrCodeIcon from "@mui/icons-material/QrCode";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";

import { PageLayout } from "@components/templates";
import { Button, TextField, Modal, Card, GridContainer, GridItem, Flex } from "@components/atoms";
import { EmptyState, ConfirmDialog, QRCodeOverlay } from "@components/molecules";
import { RadarChart } from "@components/organisms";
import ParticipantDetailCard from "@organisms/ParticipantDetailCard";
import { usePlayground } from "@hooks/prisoners-dilemma";
import "./styles.css";

export default function PlayGround() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
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
      labels: [
        t("tests.personality.traits.extraversion"),
        t("tests.personality.traits.agreeableness"),
        t("tests.personality.traits.conscientiousness"),
        t("tests.personality.traits.neuroticism"),
        t("tests.personality.traits.openness"),
      ],
      datasets: [
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
      ],
    }),
    [t]
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
        <Chip
          label={`${participants.length} ${t("tests.participants")}`}
          color="primary"
          variant="outlined"
        />
        <Button
          variant="outlined"
          onClick={toggleBlur}
          disabled={!isAuthenticated}
          startIcon={blurText ? <VisibilityIcon /> : <VisibilityOffIcon />}
        >
          {blurText
            ? t("tests.prisonersDilemma.playgroundPage.show")
            : t("tests.prisonersDilemma.playgroundPage.hide")}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate("/rooms")}
          disabled={!isAuthenticated}
          startIcon={<ArrowBackIcon />}
        >
          {t("tests.rooms")}
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
          {t("tests.prisonersDilemma.playgroundPage.start")}
        </Button>
        {sessions.length > 0 && (
          <Button
            variant="outlined"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            startIcon={<HistoryIcon />}
          >
            {t("tests.prisonersDilemma.playgroundPage.sessions")}
          </Button>
        )}
      </Flex>
    ),
    [
      participants.length,
      blurText,
      isAuthenticated,
      sessions.length,
      navigate,
      toggleBlur,
      openQR,
      t,
    ]
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
          title={t("tests.noParticipantsYet")}
          message={t("tests.shareQRDescription")}
          actionLabel={t("tests.prisonersDilemma.playgroundPage.showQRCode")}
          onAction={openQR}
        />
      ) : (
        <GridContainer spacing="lg">
          {participants.map((p) => {
            const { labels, datasets } = getRadarConfig(p);
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
                        {t("common.delete")}
                      </Button>
                    )
                  }
                >
                  {hasAllTraits(p) && !blurText && (
                    <RadarChart labels={labels} datasets={datasets} showLegend sx={{ mb: 2 }} />
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
        title={t("tests.prisonersDilemma.playgroundPage.startNewSession")}
        actions={
          <>
            <Button variant="outlined" onClick={() => setShowSessionModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={!sessionName.trim()}
              onClick={handleCreateSession}
            >
              {t("common.create")}
            </Button>
          </>
        }
      >
        <TextField
          label={t("tests.prisonersDilemma.playgroundPage.sessionName")}
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          fullWidth
          required
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteParticipant}
        title={t("tests.prisonersDilemma.playgroundPage.deleteParticipant")}
        message={t("tests.prisonersDilemma.playgroundPage.deleteConfirm")}
        confirmLabel={t("common.delete")}
        confirmColor="error"
      />

      <ConfirmDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        onConfirm={handleDeleteNotReady}
        title={t("common.error")}
        message={errorMessage}
        confirmLabel={t("tests.prisonersDilemma.playgroundPage.deleteNotReadyAndStart")}
        confirmColor="warning"
      />
    </PageLayout>
  );
}
