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
import {
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Visibility as ViewIcon, Close as CloseIcon } from "@mui/icons-material";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import ReactMarkdown from "react-markdown";
import { PageLayout } from "@components/templates";
import { Typography, Button } from "@components/atoms";
import { QRCodeOverlay, RoomParticipantEmptyState } from "@components/molecules";
import { RoomInfoHeader, DataTable } from "@components/organisms";
import personalityTestService from "@services/personalityTestService";
import { getTestRoom, generateRoomUrl, TestType } from "../../services/testRoomService";

// Register Chart.js components for Radar chart
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, ChartTooltip, Legend);

function PersonalityTestRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  const handleExportCSV = () => {
    if (participants.length === 0) return;

    const headers = [
      "Ad Soyad",
      "Öğrenci No",
      "Tamamlandı",
      "Dışa Dönüklük",
      "Uyumluluk",
      "Sorumluluk",
      "Duygusal Denge",
      "Açıklık",
      "İş Önerisi",
      "Tarih",
    ];

    const rows = participants.map((p) => [
      p.full_name || "",
      p.student_number || "",
      p.has_completed ? "Evet" : "Hayır",
      p.extroversion != null ? p.extroversion.toFixed(1) + "%" : "",
      p.agreeableness != null ? p.agreeableness.toFixed(1) + "%" : "",
      p.conscientiousness != null ? p.conscientiousness.toFixed(1) + "%" : "",
      p.negative_emotionality != null ? p.negative_emotionality.toFixed(1) + "%" : "",
      p.open_mindedness != null ? p.open_mindedness.toFixed(1) + "%" : "",
      p.job_recommendation || "",
      p.created_at ? new Date(p.created_at).toLocaleDateString("tr-TR") : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `personality_test_${room?.name || roomId}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
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

  // Radar chart config for the selected participant
  const getRadarConfig = (participant) => {
    const data = {
      labels: ["Dışadönüklük", "Uyumluluk", "Sorumluluk", "Olumsuz Duygusallık", "Açık Fikirlilik"],
      datasets: [
        {
          label: "Kişilik Özellikleri",
          data: [
            participant.extroversion ?? 0,
            participant.agreeableness ?? 0,
            participant.conscientiousness ?? 0,
            participant.negative_emotionality ?? 0,
            participant.open_mindedness ?? 0,
          ],
          backgroundColor: "rgba(34, 202, 236, 0.2)",
          borderColor: "rgba(34, 202, 236, 1)",
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
          pointLabels: { font: { size: isSmallScreen ? 10 : 14 } },
        },
      },
      layout: { padding: { top: 10, bottom: 10 } },
      plugins: {
        legend: { display: true, position: "top" },
        tooltip: { enabled: true },
      },
      maintainAspectRatio: true,
    };

    return { data, options };
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
        onExportCSV={handleExportCSV}
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
          emptyMessage="Henüz katılımcı yok"
        />
      )}

      {/* Result Detail Dialog */}
      <Dialog
        open={!!selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        maxWidth="md"
        fullWidth
        fullScreen={isSmallScreen}
      >
        {selectedParticipant && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pb: 1,
              }}
            >
              <Typography variant="h6">
                Kişilik Testi Sonuçları
                {selectedParticipant.full_name && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    — {selectedParticipant.full_name}
                    {selectedParticipant.student_number &&
                      ` (${selectedParticipant.student_number})`}
                  </Typography>
                )}
              </Typography>
              <IconButton onClick={() => setSelectedParticipant(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {/* Radar Chart */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 3,
                  maxWidth: 500,
                  mx: "auto",
                }}
              >
                <Radar {...getRadarConfig(selectedParticipant)} />
              </Box>

              {/* Job Recommendation */}
              {selectedParticipant.job_recommendation && (
                <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Meslek Tavsiyeleri
                  </Typography>
                  <Box sx={{ "& p": { mt: 0, mb: 1 }, "& ul": { pl: 2 } }}>
                    <ReactMarkdown>{selectedParticipant.job_recommendation}</ReactMarkdown>
                  </Box>
                </Box>
              )}

              {/* Compatibility Analysis */}
              {selectedParticipant.compatibility_analysis && (
                <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Burç Uyumluluk Analizi
                  </Typography>
                  <Box sx={{ "& p": { mt: 0, mb: 1 }, "& ul": { pl: 2 } }}>
                    <ReactMarkdown>{selectedParticipant.compatibility_analysis}</ReactMarkdown>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedParticipant(null)}>Kapat</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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
