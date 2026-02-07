/**
 * PersonalityTestRoomDetail Page
 *
 * Shows detailed view of a personality test room including:
 * - Room information and QR code
 * - Participant list with completion status
 * - Result detail dialog with radar chart and GPT recommendations
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconButton, Tooltip } from "@mui/material";
import { Visibility as ViewIcon } from "@mui/icons-material";
import { PageLayout, PageLoading, PageError } from "@components/templates";
import { QRCodeOverlay, RoomParticipantEmptyState, MarkdownSection } from "@components/molecules";
import { RoomInfoHeader, DataTable, RadarChart, ResultDetailDialog } from "@components/organisms";
import personalityTestService from "@services/personalityTestService";
import { getTestRoom, generateRoomUrl, TestType } from "@services/testRoomService";

function PersonalityTestRoomDetail() {
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
        const participantsData = await personalityTestService.getParticipants(roomId);
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

  const roomUrl = generateRoomUrl(roomId, TestType.PERSONALITY_TEST);
  const completedCount = participants.filter((p) => p.has_completed).length;

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
      label: t("tests.personality.roomDetail.traitsLabel"),
      data: [
        participant.extroversion ?? 0,
        participant.agreeableness ?? 0,
        participant.conscientiousness ?? 0,
        participant.negative_emotionality ?? 0,
        participant.open_mindedness ?? 0,
      ],
    },
  ];

  return (
    <PageLayout
      title={room?.name || t("tests.personality.roomDetail.pageTitle")}
      maxWidth="lg"
      showBackButton
      onBack={() => navigate("/personality-test-rooms")}
    >
      {/* Room Info Header */}
      <RoomInfoHeader
        room={room}
        roomId={roomId}
        testType={TestType.PERSONALITY_TEST}
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
              id: "has_completed",
              label: t("common.status"),
              align: "center",
              type: "chip",
              chipConfig: (value) => ({
                label: value ? t("tests.status.completed") : t("tests.status.inProgress"),
                color: value ? "success" : "warning",
              }),
            },
            {
              id: "extroversion",
              label: t("tests.personality.traits.extraversion"),
              align: "center",
              type: "percentage",
            },
            {
              id: "agreeableness",
              label: t("tests.personality.traits.agreeableness"),
              align: "center",
              type: "percentage",
            },
            {
              id: "conscientiousness",
              label: t("tests.personality.traits.conscientiousness"),
              align: "center",
              type: "percentage",
            },
            {
              id: "negative_emotionality",
              label: t("tests.personality.traits.neuroticism"),
              align: "center",
              type: "percentage",
            },
            {
              id: "open_mindedness",
              label: t("tests.personality.traits.openness"),
              align: "center",
              type: "percentage",
            },
            { id: "created_at", label: t("common.date"), type: "date" },
            {
              id: "actions",
              label: t("tests.result"),
              align: "center",
              sortable: false,
              render: (_value, row) =>
                row.has_completed ? (
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
          exportFileName={`personality_test_${room?.name || roomId}_${new Date().toISOString().split("T")[0]}`}
          emptyMessage={t("tests.noParticipantsYet")}
          deletable
          onDeleteRow={async (row) => {
            await personalityTestService.deleteParticipant(row.id);
            setParticipants((prev) => prev.filter((p) => p.id !== row.id));
          }}
        />
      )}

      {/* Result Detail Dialog */}
      <ResultDetailDialog
        open={!!selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        title={t("tests.personality.roomDetail.resultsTitle")}
        participant={selectedParticipant}
        exportable
      >
        {selectedParticipant && (
          <>
            <RadarChart
              labels={personalityLabels}
              datasets={getRadarDatasets(selectedParticipant)}
              sx={{ mb: 3 }}
            />
            <MarkdownSection
              title={t("tests.personality.roomDetail.jobRecommendations")}
              content={selectedParticipant.job_recommendation}
            />
          </>
        )}
      </ResultDetailDialog>

      {/* QR Code Overlay */}
      {showQR && (
        <QRCodeOverlay
          url={roomUrl}
          onClose={() => setShowQR(false)}
          title={`${room?.name} - ${t("tests.personality.title")}`}
        />
      )}
    </PageLayout>
  );
}

export default PersonalityTestRoomDetail;
