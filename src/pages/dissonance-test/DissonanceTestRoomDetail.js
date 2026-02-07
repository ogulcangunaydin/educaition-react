/**
 * DissonanceTestRoomDetail Page
 *
 * Shows detailed view of a dissonance test room including:
 * - Room information and QR code
 * - Participant list with first/second round answers
 * - Result detail dialog with dissonance comparison
 *
 * Follows the same structure as PersonalityTestRoomDetail.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconButton, Tooltip, Chip } from "@mui/material";
import { Visibility as ViewIcon } from "@mui/icons-material";
import { PageLayout, PageLoading, PageError } from "@components/templates";
import { QRCodeOverlay, RoomParticipantEmptyState } from "@components/molecules";
import { RoomInfoHeader, DataTable, ResultDetailDialog } from "@components/organisms";
import dissonanceTestService from "@services/dissonanceTestService";
import { getTestRoom, generateRoomUrl, TestType } from "@services/testRoomService";
import DissonanceResultContent from "./DissonanceResultContent";

function DissonanceTestRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Result detail dialog
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const fetchRoomData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const roomData = await getTestRoom(roomId);
      setRoom(roomData);

      try {
        const participantsData = await dissonanceTestService.getRoomParticipants(roomId);
        setParticipants(participantsData.items || []);
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

  if (loading) return <PageLoading onBack={() => navigate(-1)} />;
  if (error) return <PageError message={error} onBack={() => navigate(-1)} />;

  const roomUrl = generateRoomUrl(roomId, TestType.DISSONANCE_TEST);
  const completedCount = participants.filter(
    (p) => p.comfort_question_second_answer !== null
  ).length;

  return (
    <PageLayout
      title={room?.name || t("tests.dissonance.roomDetail.pageTitle")}
      maxWidth="lg"
      showBackButton
      onBack={() => navigate("/dissonance-test-rooms")}
    >
      {/* Room Info Header */}
      <RoomInfoHeader
        room={room}
        roomId={roomId}
        testType={TestType.DISSONANCE_TEST}
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
            { id: "full_name", label: t("tests.participantInfo.name"), type: "string" },
            {
              id: "student_number",
              label: t("tests.participantInfo.studentNumber"),
              type: "string",
            },
            {
              id: "sentiment",
              label: t("tests.dissonance.roomDetail.sentiment"),
              align: "center",
              type: "number",
            },
            {
              id: "comfort_question_first_answer",
              label: t("tests.dissonance.roomDetail.comfortFirst"),
              align: "center",
              type: "number",
            },
            {
              id: "fare_question_first_answer",
              label: t("tests.dissonance.roomDetail.fareFirst"),
              align: "center",
              type: "number",
            },
            {
              id: "comfort_question_second_answer",
              label: t("tests.dissonance.roomDetail.comfortSecond"),
              align: "center",
              type: "number",
              render: (value) => (value !== null ? value : "-"),
            },
            {
              id: "fare_question_second_answer",
              label: t("tests.dissonance.roomDetail.fareSecond"),
              align: "center",
              type: "number",
              render: (value) => (value !== null ? value : "-"),
            },
            {
              id: "has_completed_display",
              label: t("common.status"),
              align: "center",
              sortable: false,
              render: (_value, row) => {
                const completed = row.comfort_question_second_answer !== null;
                return (
                  <Chip
                    label={completed ? t("tests.status.completed") : t("tests.status.inProgress")}
                    color={completed ? "success" : "warning"}
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
              render: (_value, row) =>
                row.comfort_question_second_answer !== null ? (
                  <Tooltip title={t("tests.viewResults")}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => setSelectedParticipant(row)}
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
          exportFileName={`dissonance_test_${room?.name || roomId}_${new Date().toISOString().split("T")[0]}`}
          emptyMessage={t("tests.noParticipantsYet")}
          deletable
          onDeleteRow={async (row) => {
            await dissonanceTestService.deleteParticipant(row.id);
            setParticipants((prev) => prev.filter((p) => p.id !== row.id));
          }}
        />
      )}

      {/* Result Detail Dialog */}
      <ResultDetailDialog
        open={!!selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        title={t("tests.dissonance.roomDetail.resultsTitle")}
        participant={selectedParticipant}
        exportable
      >
        {selectedParticipant && <DissonanceResultContent participant={selectedParticipant} />}
      </ResultDetailDialog>

      {/* QR Code Overlay */}
      {showQR && (
        <QRCodeOverlay
          url={roomUrl}
          onClose={() => setShowQR(false)}
          title={`${room?.name} - ${t("tests.dissonance.title")}`}
        />
      )}
    </PageLayout>
  );
}

export default DissonanceTestRoomDetail;
