/**
 * PrisonersDilemmaRoomDetail Page
 *
 * Shows detailed view of a Prisoner's Dilemma game room including:
 * - Room information and QR code
 * - Participant list with tactic/personality status
 * - Result detail dialog with radar chart and tactic info
 * - Session management (start session, view past sessions)
 *
 * Follows the same structure as PersonalityTestRoomDetail / DissonanceTestRoomDetail.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  PlayArrow as PlayArrowIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { PageLayout, PageLoading, PageError } from "@components/templates";
import { Button, TextField } from "@components/atoms";
import {
  QRCodeOverlay,
  RoomParticipantEmptyState,
  ConfirmDialog,
  MarkdownSection,
} from "@components/molecules";
import { RoomInfoHeader, DataTable, RadarChart, ResultDetailDialog } from "@components/organisms";
import ParticipantDetailCard from "@organisms/ParticipantDetailCard";
import { getPlayersByRoom, deletePlayer } from "@services/playerService";
import { getRoomSessions, startSessionWithName } from "@services/roomService";
import { getTestRoom, generateRoomUrl, TestType } from "@services/testRoomService";

function PrisonersDilemmaRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Result detail dialog
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // Session management
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sessionAnchor, setSessionAnchor] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRoomData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const roomData = await getTestRoom(roomId);
      setRoom(roomData);

      // Players and sessions use the legacy room_id (from the "rooms" table)
      const legacyRoomId = roomData.legacy_room_id;

      if (legacyRoomId) {
        try {
          const playersData = await getPlayersByRoom(legacyRoomId);
          setParticipants(playersData || []);
        } catch (err) {
          console.error("Error fetching participants:", err);
        }

        try {
          const sessionsData = await getRoomSessions(legacyRoomId);
          setSessions(sessionsData || []);
        } catch (err) {
          console.error("Error fetching sessions:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching room data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  const handleCreateSession = useCallback(async () => {
    const legacyRoomId = room?.legacy_room_id;
    if (!legacyRoomId) {
      setErrorMessage("Legacy room not linked. Please recreate the room.");
      setShowErrorDialog(true);
      return;
    }

    try {
      const result = await startSessionWithName(legacyRoomId, sessionName);

      // startSessionWithName returns { ok, data } or { ok: false, error }
      if (result.ok === false) {
        setErrorMessage(result.error || "Failed to start session");
        setShowErrorDialog(true);
        return;
      }

      const session = result.data || result;
      setShowSessionModal(false);
      setSessionName("");
      navigate(`/leaderboard/${session.id}`, {
        state: { roomId: legacyRoomId, testRoomId: roomId, roomName: room?.name },
      });
    } catch (err) {
      const detail = err.message || "";
      setErrorMessage(detail);
      setShowErrorDialog(true);
    }
  }, [room, sessionName, navigate, roomId]);

  const handleDeleteNotReadyAndStart = useCallback(async () => {
    const notReady = participants.filter((p) => !p.player_tactic);
    for (const player of notReady) {
      await deletePlayer(player.id);
    }
    setParticipants((prev) => prev.filter((p) => p.player_tactic));
    setShowErrorDialog(false);
    handleCreateSession();
  }, [participants, handleCreateSession]);

  if (loading) return <PageLoading onBack={() => navigate(-1)} />;
  if (error) return <PageError message={error} onBack={() => navigate(-1)} />;

  const roomUrl = generateRoomUrl(roomId, TestType.PRISONERS_DILEMMA);
  const readyCount = participants.filter((p) => !!p.player_tactic).length;

  // Radar chart labels for Big Five personality traits
  const personalityLabels = [
    t("tests.personality.traits.extraversion"),
    t("tests.personality.traits.agreeableness"),
    t("tests.personality.traits.conscientiousness"),
    t("tests.personality.traits.neuroticism"),
    t("tests.personality.traits.openness"),
  ];

  const getRadarDatasets = (participant) => [
    {
      label: t("tests.prisonersDilemma.playgroundPage.personalityTraits"),
      data: [
        participant.extroversion ?? 0,
        participant.agreeableness ?? 0,
        participant.conscientiousness ?? 0,
        participant.negative_emotionality ?? 0,
        participant.open_mindedness ?? 0,
      ],
    },
  ];

  const hasPersonalityTraits = (p) =>
    [
      p.extroversion,
      p.agreeableness,
      p.conscientiousness,
      p.negative_emotionality,
      p.open_mindedness,
    ].some((v) => v !== null && v !== undefined);

  return (
    <PageLayout
      title={room?.name || t("tests.prisonersDilemma.roomDetail.pageTitle")}
      maxWidth="lg"
      showBackButton
      onBack={() => navigate("/prisoners-dilemma-rooms")}
      headerProps={{
        children: (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => setShowSessionModal(true)}
              disabled={participants.length === 0}
            >
              {t("tests.prisonersDilemma.playgroundPage.start")}
            </Button>
            {sessions.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={(e) => setSessionAnchor(e.currentTarget)}
              >
                {t("tests.prisonersDilemma.playgroundPage.sessions")}
              </Button>
            )}
          </Box>
        ),
      }}
    >
      {/* Sessions Menu */}
      <Menu
        anchorEl={sessionAnchor}
        open={Boolean(sessionAnchor)}
        onClose={() => setSessionAnchor(null)}
      >
        {sessions.map((s) => (
          <MenuItem
            key={s.id}
            onClick={() => {
              setSessionAnchor(null);
              navigate(`/leaderboard/${s.id}`, {
                state: {
                  roomId: room?.legacy_room_id || roomId,
                  testRoomId: roomId,
                  roomName: room?.name,
                },
              });
            }}
          >
            {s.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Room Info Header */}
      <RoomInfoHeader
        room={room}
        roomId={roomId}
        testType={TestType.PRISONERS_DILEMMA}
        participantCount={participants.length}
        completedCount={readyCount}
        onShowQR={() => setShowQR(true)}
        onRefresh={fetchRoomData}
      />

      {/* Participants Table */}
      {participants.length === 0 ? (
        <RoomParticipantEmptyState onShowQR={() => setShowQR(true)} />
      ) : (
        <DataTable
          columns={[
            {
              id: "player_name",
              label: t("tests.prisonersDilemma.player"),
              type: "string",
            },
            {
              id: "player_function_name",
              label: t("tests.prisonersDilemma.roomDetail.functionName"),
              type: "string",
            },
            {
              id: "short_tactic",
              label: t("tests.prisonersDilemma.roomDetail.shortTactic"),
              type: "string",
            },
            {
              id: "tactic_status",
              label: t("common.status"),
              align: "center",
              sortable: false,
              render: (_value, row) => {
                const ready = !!row.player_tactic;
                return (
                  <Chip
                    label={
                      ready
                        ? t("tests.prisonersDilemma.roomDetail.ready")
                        : t("tests.prisonersDilemma.roomDetail.notReady")
                    }
                    color={ready ? "success" : "warning"}
                    size="small"
                  />
                );
              },
            },
            { id: "created_at", label: t("common.date"), type: "date" },
            {
              id: "actions",
              label: t("tests.result"),
              align: "center",
              sortable: false,
              render: (_value, row) => (
                <Tooltip title={t("tests.viewResults")}>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => setSelectedParticipant(row)}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
              ),
            },
          ]}
          data={participants}
          pagination={participants.length > 10}
          defaultSortBy="created_at"
          defaultSortOrder="desc"
          exportable
          exportFileName={`prisoners_dilemma_${room?.name || roomId}_${new Date().toISOString().split("T")[0]}`}
          emptyMessage={t("tests.noParticipantsYet")}
          deletable
          onDeleteRow={async (row) => {
            await deletePlayer(row.id);
            setParticipants((prev) => prev.filter((p) => p.id !== row.id));
          }}
        />
      )}

      {/* Result Detail Dialog */}
      <ResultDetailDialog
        open={!!selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        title={t("tests.prisonersDilemma.roomDetail.resultsTitle")}
        participant={{
          ...selectedParticipant,
          full_name: selectedParticipant?.player_name,
        }}
        exportable
      >
        {selectedParticipant && (
          <>
            {hasPersonalityTraits(selectedParticipant) && (
              <RadarChart
                labels={personalityLabels}
                datasets={getRadarDatasets(selectedParticipant)}
                sx={{ mb: 3 }}
              />
            )}
            <ParticipantDetailCard
              participant={selectedParticipant}
              isUserAuthenticated
              blurText={false}
            />
            {selectedParticipant.tactic_reason && (
              <Box sx={{ mt: 3 }}>
                <MarkdownSection
                  title={t("tests.prisonersDilemma.roomDetail.tacticReason")}
                  content={selectedParticipant.tactic_reason}
                />
              </Box>
            )}
            {selectedParticipant.job_recommendation && (
              <Box sx={{ mt: 3 }}>
                <MarkdownSection
                  title={t("tests.prisonersDilemma.roomDetail.jobRecommendation")}
                  content={selectedParticipant.job_recommendation}
                />
              </Box>
            )}
          </>
        )}
      </ResultDetailDialog>

      {/* Start Session Dialog */}
      <Dialog
        open={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("tests.prisonersDilemma.playgroundPage.startNewSession")}</DialogTitle>
        <DialogContent>
          <TextField
            label={t("tests.prisonersDilemma.playgroundPage.sessionName")}
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            fullWidth
            required
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setShowSessionModal(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="contained" disabled={!sessionName.trim()} onClick={handleCreateSession}>
            {t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error / Not-ready Dialog */}
      <ConfirmDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        onConfirm={handleDeleteNotReadyAndStart}
        title={t("common.error")}
        message={errorMessage}
        confirmLabel={t("tests.prisonersDilemma.playgroundPage.deleteNotReadyAndStart")}
        confirmColor="warning"
      />

      {/* QR Code Overlay */}
      {showQR && (
        <QRCodeOverlay
          url={roomUrl}
          onClose={() => setShowQR(false)}
          title={`${room?.name} - ${t("tests.prisonersDilemma.title")}`}
        />
      )}
    </PageLayout>
  );
}

export default PrisonersDilemmaRoomDetail;
