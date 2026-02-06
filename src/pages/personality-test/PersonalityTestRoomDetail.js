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
import { Box, CircularProgress, Alert, IconButton, Tooltip } from "@mui/material";
import { Visibility as ViewIcon } from "@mui/icons-material";
import { PageLayout } from "@components/templates";
import { QRCodeOverlay, RoomParticipantEmptyState, MarkdownSection } from "@components/molecules";
import { RoomInfoHeader, DataTable, RadarChart, ResultDetailDialog } from "@components/organisms";
import personalityTestService from "@services/personalityTestService";
import { getTestRoom, generateRoomUrl, TestType } from "@services/testRoomService";

function PersonalityTestRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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

  const handleCopyUrl = async () => {
    const url = generateRoomUrl(roomId, TestType.PERSONALITY_TEST);
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Yükleniyor..." showBackButton onBack={() => navigate(-1)}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Hata" showBackButton onBack={() => navigate(-1)}>
        <Alert severity="error">{error}</Alert>
      </PageLayout>
    );
  }

  const roomUrl = generateRoomUrl(roomId, TestType.PERSONALITY_TEST);
  const completedCount = participants.filter((p) => p.has_completed).length;

  // Radar chart labels for Big Five personality traits
  const personalityLabels = [
    "Dışadönüklük",
    "Uyumluluk",
    "Sorumluluk",
    "Olumsuz Duygusallık",
    "Açık Fikirlilik",
  ];

  const getRadarDatasets = (participant) => [
    {
      label: "Kişilik Özellikleri",
      data: [
        participant.extroversion ?? 0,
        participant.agreeableness ?? 0,
        participant.conscientiousness ?? 0,
        participant.negative_emotionality ?? 0,
        participant.open_mindedness ?? 0,
      ],
    },
  ];

  const getParticipantSubtitle = (p) => {
    if (!p) return undefined;
    const parts = [p.full_name, p.student_number && `(${p.student_number})`];
    return parts.filter(Boolean).join(" ") || undefined;
  };

  return (
    <PageLayout
      title={room?.name || "Kişilik Testi Odası"}
      maxWidth="lg"
      showBackButton
      onBack={() => navigate("/personality-test-rooms")}
    >
      {/* Room Info Header */}
      <RoomInfoHeader
        room={room}
        testType={TestType.PERSONALITY_TEST}
        participantCount={participants.length}
        completedCount={completedCount}
        onShowQR={() => setShowQR(true)}
        onCopyUrl={handleCopyUrl}
        copySuccess={copySuccess}
        onRefresh={fetchRoomData}
      />

      {/* Participants Table */}
      {participants.length === 0 ? (
        <RoomParticipantEmptyState onShowQR={() => setShowQR(true)} />
      ) : (
        <DataTable
          columns={[
            { id: "full_name", label: "Ad Soyad", type: "string" },
            { id: "student_number", label: "Öğrenci No", type: "string" },
            {
              id: "has_completed",
              label: "Durum",
              align: "center",
              type: "chip",
              chipConfig: (value) => ({
                label: value ? "Tamamlandı" : "Devam Ediyor",
                color: value ? "success" : "warning",
              }),
            },
            { id: "extroversion", label: "Dışa Dönüklük", align: "center", type: "percentage" },
            { id: "agreeableness", label: "Uyumluluk", align: "center", type: "percentage" },
            { id: "conscientiousness", label: "Sorumluluk", align: "center", type: "percentage" },
            {
              id: "negative_emotionality",
              label: "Duygusal Denge",
              align: "center",
              type: "percentage",
            },
            { id: "open_mindedness", label: "Açıklık", align: "center", type: "percentage" },
            { id: "created_at", label: "Tarih", type: "date" },
            {
              id: "actions",
              label: "Sonuç",
              align: "center",
              sortable: false,
              render: (_value, row) =>
                row.has_completed ? (
                  <Tooltip title="Sonuçları Görüntüle">
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
          emptyMessage="Henüz katılımcı yok"
        />
      )}

      {/* Result Detail Dialog */}
      <ResultDetailDialog
        open={!!selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        title="Kişilik Testi Sonuçları"
        subtitle={getParticipantSubtitle(selectedParticipant)}
      >
        {selectedParticipant && (
          <>
            <RadarChart
              labels={personalityLabels}
              datasets={getRadarDatasets(selectedParticipant)}
              sx={{ mb: 3 }}
            />
            <MarkdownSection
              title="Meslek Tavsiyeleri"
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
          title={`${room?.name} - Kişilik Testi`}
        />
      )}
    </PageLayout>
  );
}

export default PersonalityTestRoomDetail;
