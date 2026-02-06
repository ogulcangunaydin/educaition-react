/**
 * PersonalityTestRoomDetail Page
 *
 * Shows detailed view of a personality test room including:
 * - Room information and QR code
 * - Participant list with completion status
 * - Statistics and trait summaries
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
  Tabs,
  Tab,
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
  LinearProgress,
} from "@mui/material";
import {
  QrCode2 as QRIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Assessment as StatsIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { PageLayout } from "@components/templates";
import { Typography, Button } from "@components/atoms";
import { QRCodeOverlay, EmptyState } from "@components/molecules";
import fetchWithAuth from "../utils/fetchWithAuth";
import {
  getTestRoom,
  generateRoomUrl,
  TEST_TYPE_CONFIG,
  TestType,
} from "../services/testRoomService";

const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

// Tab panels
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Personality trait bar component
function TraitBar({ label, value, color = "primary" }) {
  const percentage = value ? Math.round(value * 100) : 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {percentage}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
}

function PersonalityTestRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const config = TEST_TYPE_CONFIG[TestType.PERSONALITY_TEST];

  const fetchRoomData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch room info
      const roomData = await getTestRoom(roomId);
      setRoom(roomData);

      // Fetch participants
      const participantsResponse = await fetchWithAuth(
        `${BASE_URL}/personality-test/rooms/${roomId}/participants`
      );
      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        setParticipants(participantsData.items || []);
      }

      // Fetch statistics
      const statsResponse = await fetchWithAuth(
        `${BASE_URL}/personality-test/rooms/${roomId}/statistics`
      );
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData);
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
      p.is_completed ? "Evet" : "Hayır",
      p.extroversion ? (p.extroversion * 100).toFixed(1) + "%" : "",
      p.agreeableness ? (p.agreeableness * 100).toFixed(1) + "%" : "",
      p.conscientiousness ? (p.conscientiousness * 100).toFixed(1) + "%" : "",
      p.negative_emotionality ? (p.negative_emotionality * 100).toFixed(1) + "%" : "",
      p.open_mindedness ? (p.open_mindedness * 100).toFixed(1) + "%" : "",
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
  const completedCount = participants.filter((p) => p.is_completed).length;

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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab icon={<PersonIcon />} iconPosition="start" label="Katılımcılar" />
          <Tab icon={<StatsIcon />} iconPosition="start" label="İstatistikler" />
        </Tabs>
      </Box>

      {/* Participants Tab */}
      <TabPanel value={tabValue} index={0}>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>{participant.email || "-"}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={participant.is_completed ? "Tamamlandı" : "Devam Ediyor"}
                        color={participant.is_completed ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {participant.extroversion
                        ? (participant.extroversion * 100).toFixed(0) + "%"
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {participant.agreeableness
                        ? (participant.agreeableness * 100).toFixed(0) + "%"
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {participant.conscientiousness
                        ? (participant.conscientiousness * 100).toFixed(0) + "%"
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {participant.negative_emotionality
                        ? (participant.negative_emotionality * 100).toFixed(0) + "%"
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {participant.open_mindedness
                        ? (participant.open_mindedness * 100).toFixed(0) + "%"
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {participant.created_at
                        ? new Date(participant.created_at).toLocaleDateString("tr-TR")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Statistics Tab */}
      <TabPanel value={tabValue} index={1}>
        {statistics ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ortalama Kişilik Özellikleri
                  </Typography>
                  <TraitBar
                    label="Dışa Dönüklük (Extroversion)"
                    value={statistics.averages?.extroversion}
                    color="primary"
                  />
                  <TraitBar
                    label="Uyumluluk (Agreeableness)"
                    value={statistics.averages?.agreeableness}
                    color="success"
                  />
                  <TraitBar
                    label="Sorumluluk (Conscientiousness)"
                    value={statistics.averages?.conscientiousness}
                    color="warning"
                  />
                  <TraitBar
                    label="Duygusal Denge (Negative Emotionality)"
                    value={statistics.averages?.negative_emotionality}
                    color="error"
                  />
                  <TraitBar
                    label="Deneyime Açıklık (Open Mindedness)"
                    value={statistics.averages?.open_mindedness}
                    color="info"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    İş Önerileri Dağılımı
                  </Typography>
                  {statistics.job_recommendations &&
                  Object.keys(statistics.job_recommendations).length > 0 ? (
                    <Box>
                      {Object.entries(statistics.job_recommendations).map(([job, count]) => (
                        <Box
                          key={job}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="body2">{job}</Typography>
                          <Chip label={count} size="small" variant="outlined" />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Henüz iş önerisi verisi yok.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <EmptyState
            title="İstatistik verisi yok"
            description="Katılımcılar testi tamamladıkça istatistikler burada görünecek."
          />
        )}
      </TabPanel>

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
