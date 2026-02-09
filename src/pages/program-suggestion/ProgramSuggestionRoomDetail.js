/**
 * ProgramSuggestionRoomDetail Page
 *
 * Shows detailed view of a program suggestion room including:
 * - Room information and QR code
 * - Participant list with completion status
 * - RIASEC scores and job recommendations
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconButton, Tooltip, Chip, Box, Typography } from "@mui/material";
import { Visibility as ViewIcon } from "@mui/icons-material";
import { PageLayout, PageLoading, PageError } from "@components/templates";
import { QRCodeOverlay, RoomParticipantEmptyState } from "@components/molecules";
import { RoomInfoHeader, DataTable } from "@components/organisms";
import programSuggestionService from "@services/programSuggestionService";
import { getTestRoom, generateRoomUrl, TestType } from "@services/testRoomService";

// Status configuration for chips
const getStatusConfig = (status) => {
  const statusConfig = {
    started: { label: "Başladı", color: "default" },
    step1_completed: { label: "Adım 1", color: "info" },
    step2_completed: { label: "Adım 2", color: "info" },
    step3_completed: { label: "Adım 3", color: "info" },
    step4_completed: { label: "Adım 4", color: "warning" },
    riasec_completed: { label: "RIASEC Tamamlandı", color: "warning" },
    completed: { label: "Tamamlandı", color: "success" },
  };
  return statusConfig[status] || { label: status, color: "default" };
};

function ProgramSuggestionRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const fetchRoomData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const roomData = await getTestRoom(roomId);
      setRoom(roomData);

      try {
        // Use test room API to get participants
        const participantsData = await programSuggestionService.getParticipants(roomId);
        setParticipants(participantsData || []);
      } catch (err) {
        console.error("Error fetching participants:", err);
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

  const handleViewResult = (studentId) => {
    navigate(`/program-test-result/${studentId}`);
  };

  const handleDeleteParticipant = async (participant) => {
    await programSuggestionService.deleteStudent(participant.id);
    setParticipants((prev) => prev.filter((p) => p.id !== participant.id));
  };

  if (loading) return <PageLoading onBack={() => navigate(-1)} />;
  if (error) return <PageError message={error} onBack={() => navigate(-1)} />;

  const roomUrl = generateRoomUrl(roomId, TestType.PROGRAM_SUGGESTION);
  const completedCount = participants.filter((p) => p.status === "completed").length;

  return (
    <PageLayout
      title={room?.name || t("tests.programSuggestion.roomDetail.pageTitle", "Program Öneri Odası")}
      maxWidth="lg"
      showBackButton
      onBack={() => navigate("/program-suggestion-rooms")}
    >
      {/* Room Info Header */}
      <RoomInfoHeader
        room={room}
        roomId={roomId}
        testType={TestType.PROGRAM_SUGGESTION}
        participantCount={participants.length}
        completedCount={completedCount}
        onShowQR={() => setShowQR(true)}
        onRefresh={fetchRoomData}
      />

      {/* Participants Table */}
      {participants.length === 0 ? (
        <RoomParticipantEmptyState onShowQR={() => setShowQR(true)} />
      ) : (
        <DataTable
          columns={[
            { id: "id", label: "ID", type: "string", width: 60 },
            { id: "name", label: t("tests.participantInfo.name", "İsim"), type: "string" },
            { id: "gender", label: t("tests.participantInfo.gender", "Cinsiyet"), type: "string" },
            {
              id: "birth_year",
              label: t("tests.participantInfo.birthYear", "Doğum Yılı"),
              type: "string",
            },
            {
              id: "area",
              label: t("tests.programSuggestion.area", "Alan"),
              render: (value, row) => (
                <Box>
                  {value?.toUpperCase() || "-"}
                  {row.alternative_area && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      / {row.alternative_area.toUpperCase()}
                    </Typography>
                  )}
                </Box>
              ),
            },
            {
              id: "status",
              label: t("common.status", "Durum"),
              align: "center",
              render: (value) => {
                const config = getStatusConfig(value);
                return <Chip label={config.label} color={config.color} size="small" />;
              },
            },
            { id: "created_at", label: t("common.date", "Tarih"), type: "date" },
            {
              id: "actions",
              label: t("tests.result", "Sonuç"),
              align: "center",
              sortable: false,
              render: (_value, row) =>
                row.status === "completed" ? (
                  <Tooltip title={t("tests.viewResults", "Sonuçları Gör")}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleViewResult(row.id)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  "-"
                ),
            },
          ]}
          data={participants}
          pagination={participants.length > 10}
          defaultSortBy="created_at"
          defaultSortOrder="desc"
          exportable
          exportFileName={`program_suggestion_${room?.name || roomId}_${new Date().toISOString().split("T")[0]}`}
          emptyMessage={t("tests.noParticipantsYet", "Henüz katılımcı yok")}
          deletable
          onDeleteRow={handleDeleteParticipant}
        />
      )}

      {/* QR Code Overlay */}
      {showQR && (
        <QRCodeOverlay
          url={roomUrl}
          onClose={() => setShowQR(false)}
          title={`${room?.name} - ${t("tests.programSuggestion.title", "Program Öneri Testi")}`}
        />
      )}
    </PageLayout>
  );
}

export default ProgramSuggestionRoomDetail;
