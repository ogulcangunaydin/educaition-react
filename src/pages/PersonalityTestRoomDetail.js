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
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  QrCode2 as QRIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
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
import { QRCodeOverlay, EmptyState } from "@components/molecules";
import personalityTestService from "@services/personalityTestService";
import {
  getTestRoom,
  generateRoomUrl,
  TEST_TYPE_CONFIG,
  TestType,
} from "../services/testRoomService";

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

  const config = TEST_TYPE_CONFIG[TestType.PERSONALITY_TEST];

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
      "Email",
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
      p.email || "",
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
      <Card sx={{ mb: 3, borderLeft: 4, borderColor: config.color }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <Typography variant="h5">{room?.name}</Typography>
                <Chip
                  label={room?.is_active ? "Aktif" : "Pasif"}
                  color={room?.is_active ? "success" : "default"}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Oluşturulma: {new Date(room?.created_at).toLocaleDateString("tr-TR")}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                }}
              >
                <Tooltip title="QR Kod Göster">
                  <IconButton color="primary" onClick={() => setShowQR(true)}>
                    <QRIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={copySuccess ? "Kopyalandı!" : "URL Kopyala"}>
                  <IconButton color={copySuccess ? "success" : "primary"} onClick={handleCopyUrl}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Yenile">
                  <IconButton color="primary" onClick={fetchRoomData}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                  disabled={participants.length === 0}
                >
                  CSV İndir
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="h4" color="primary.main">
                  {participants.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam Katılımcı
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="h4" color="success.main">
                  {completedCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tamamlayan
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="h4" color="warning.main">
                  {participants.length - completedCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Devam Eden
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="h4" color="info.main">
                  {participants.length > 0
                    ? Math.round((completedCount / participants.length) * 100)
                    : 0}
                  %
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tamamlama Oranı
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Participants Table */}
      {participants.length === 0 ? (
        <EmptyState
          title="Henüz katılımcı yok"
          description="QR kodu paylaşarak öğrencilerinizin teste katılmasını sağlayın."
          action={
            <Button variant="contained" startIcon={<QRIcon />} onClick={() => setShowQR(true)}>
              QR Kodu Göster
            </Button>
          }
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell align="center">Durum</TableCell>
                <TableCell align="center">Dışa Dönüklük</TableCell>
                <TableCell align="center">Uyumluluk</TableCell>
                <TableCell align="center">Sorumluluk</TableCell>
                <TableCell align="center">Duygusal Denge</TableCell>
                <TableCell align="center">Açıklık</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell align="center">Sonuç</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.email || "-"}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={participant.has_completed ? "Tamamlandı" : "Devam Ediyor"}
                      color={participant.has_completed ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {participant.extroversion != null
                      ? Math.round(participant.extroversion) + "%"
                      : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {participant.agreeableness != null
                      ? Math.round(participant.agreeableness) + "%"
                      : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {participant.conscientiousness != null
                      ? Math.round(participant.conscientiousness) + "%"
                      : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {participant.negative_emotionality != null
                      ? Math.round(participant.negative_emotionality) + "%"
                      : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {participant.open_mindedness != null
                      ? Math.round(participant.open_mindedness) + "%"
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {participant.created_at
                      ? new Date(participant.created_at).toLocaleDateString("tr-TR")
                      : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {participant.has_completed ? (
                      <Tooltip title="Sonuçları Görüntüle">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => setSelectedParticipant(participant)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
                {selectedParticipant.email && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    — {selectedParticipant.email}
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
