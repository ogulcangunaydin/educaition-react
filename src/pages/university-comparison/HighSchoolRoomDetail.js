import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
import QRCode from "qrcode.react";
import highSchoolService from "@services/highSchoolService";
import programSuggestionService from "@services/programSuggestionService";
import Header from "@organisms/Header";
import jobTranslations from "@data/riasec/job_translations.json";

// Normalize string for comparison (handle dash/comma confusion, whitespace, etc.)
const normalizeForComparison = (str) => {
  return str
    .toLocaleLowerCase("en-US")
    .replace(/[,\-–—]/g, "") // Remove commas and all types of dashes
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

// Helper function to translate job name from English to Turkish
const translateJob = (englishName) => {
  const normalizedInput = normalizeForComparison(englishName);
  const translation = jobTranslations.find(
    (job) => normalizeForComparison(job.en) === normalizedInput
  );
  return translation ? translation.tr : englishName;
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function HighSchoolRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [room, setRoom] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [debugData, setDebugData] = useState(null);
  const [debugLoading, setDebugLoading] = useState(false);

  const highSchoolName = location.state?.highSchoolName || "Lise Odası";

  // Generate the test URL for QR code
  const testUrl = `${window.location.origin}/program-test/${roomId}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch room details
        try {
          const roomData = await highSchoolService.getRoom(roomId);
          setRoom(roomData);
        } catch (err) {
          console.error("Failed to fetch room:", err);
        }

        // Fetch students
        try {
          const studentsData = await highSchoolService.getStudents(roomId);
          setStudents(studentsData);
        } catch (err) {
          console.error("Failed to fetch students:", err);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [roomId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      started: { label: "Başladı", color: "default" },
      step1_completed: { label: "Adım 1", color: "info" },
      step2_completed: { label: "Adım 2", color: "info" },
      step3_completed: { label: "Adım 3", color: "info" },
      step4_completed: { label: "Adım 4", color: "warning" },
      riasec_completed: { label: "RIASEC Tamamlandı", color: "warning" },
      completed: { label: "Tamamlandı", color: "success" },
    };

    const config = statusConfig[status] || { label: status, color: "default" };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const handleViewResult = (studentId) => {
    navigate(`/program-test-result/${studentId}`);
  };

  const handleViewDebug = async (studentId) => {
    setDebugLoading(true);
    setDebugDialogOpen(true);
    try {
      const data = await programSuggestionService.getStudentDebug(studentId);
      setDebugData(data);
    } catch (error) {
      console.error("Failed to fetch debug data:", error);
    } finally {
      setDebugLoading(false);
    }
  };

  const handleCloseDebug = () => {
    setDebugDialogOpen(false);
    setDebugData(null);
  };

  const RIASEC_NAMES = {
    R: "Realistic (Gerçekçi)",
    I: "Investigative (Araştırmacı)",
    A: "Artistic (Sanatsal)",
    S: "Social (Sosyal)",
    E: "Enterprising (Girişimci)",
    C: "Conventional (Geleneksel)",
  };

  if (loading) {
    return (
      <>
        <Header title={highSchoolName} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Header title={room?.high_school_name || highSchoolName}>
        <Button variant="contained" color="primary" onClick={() => navigate("/high-school-rooms")}>
          Odalara Dön
        </Button>
      </Header>

      <Box
        sx={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: 3,
          paddingTop: "100px",
        }}
      >
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="QR Kod" />
          <Tab label={`Öğrenci Sonuçları (${students.length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Öğrencilerin Test'e Girmesi İçin QR Kod
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: "center", maxWidth: 500 }}
            >
              Öğrenciler bu QR kodu telefonlarıyla tarayarak program öneri testine başlayabilirler.
              Test anonim olarak yapılacak ve sonuçlar bu sayfada görüntülenecektir.
            </Typography>

            <Paper elevation={3} sx={{ padding: 4, backgroundColor: "white" }}>
              <QRCode value={testUrl} size={256} level="H" includeMargin={true} />
            </Paper>

            <Box
              sx={{
                backgroundColor: "#f5f5f5",
                padding: 2,
                borderRadius: 1,
                maxWidth: "100%",
                wordBreak: "break-all",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Test Linki:
              </Typography>
              <Typography variant="body2">
                <a href={testUrl} target="_blank" rel="noopener noreferrer">
                  {testUrl}
                </a>
              </Typography>
            </Box>

            <Button variant="outlined" onClick={() => navigator.clipboard.writeText(testUrl)}>
              Linki Kopyala
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {students.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: "center", color: "text.secondary" }}>
              Henüz test tamamlayan öğrenci yok.
            </Typography>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Test Sonuçları
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>İsim</TableCell>
                      <TableCell>Cinsiyet</TableCell>
                      <TableCell>Doğum Yılı</TableCell>
                      <TableCell>Alan</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Tarih</TableCell>
                      <TableCell>İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...students]
                      .sort((a, b) => {
                        // Handle date format DD/MM/YYYY HH:mm:ss
                        const parseDate = (dateStr) => {
                          if (!dateStr) return new Date(0);
                          // Parse format: DD/MM/YYYY HH:mm:ss
                          const match = dateStr.match(
                            /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/
                          );
                          if (match) {
                            const [, day, month, year, hour, min, sec] = match;
                            return new Date(year, month - 1, day, hour, min, sec);
                          }
                          return new Date(dateStr);
                        };
                        return parseDate(b.created_at) - parseDate(a.created_at);
                      })
                      .map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.name || "-"}</TableCell>
                          <TableCell>{student.gender || "-"}</TableCell>
                          <TableCell>{student.birth_year || "-"}</TableCell>
                          <TableCell>
                            {student.area?.toUpperCase() || "-"}
                            {student.alternative_area &&
                              ` / ${student.alternative_area.toUpperCase()}`}
                          </TableCell>
                          <TableCell>{getStatusChip(student.status)}</TableCell>
                          <TableCell>{student.created_at}</TableCell>
                          <TableCell>
                            {student.status === "completed" && (
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleViewResult(student.id)}
                                >
                                  Sonuçları Gör
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<BugReportIcon />}
                                  onClick={() => handleViewDebug(student.id)}
                                >
                                  Debug
                                </Button>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Summary Cards */}
              <Box sx={{ mt: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Card sx={{ minWidth: 150 }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Toplam Öğrenci
                    </Typography>
                    <Typography variant="h4">{students.length}</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ minWidth: 150 }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Tamamlanan
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {students.filter((s) => s.status === "completed").length}
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ minWidth: 150 }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Devam Eden
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {students.filter((s) => s.status !== "completed").length}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </>
          )}
        </TabPanel>
      </Box>

      {/* Debug Dialog */}
      <Dialog open={debugDialogOpen} onClose={handleCloseDebug} maxWidth="lg" fullWidth>
        <DialogTitle>
          🔍 Debug Info - Öğrenci #{debugData?.id} {debugData?.name && `(${debugData.name})`}
        </DialogTitle>
        <DialogContent dividers>
          {debugLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : debugData ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* RIASEC Scores */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  📊 RIASEC Puanları
                </Typography>
                {debugData.riasec_scores &&
                  Object.entries(debugData.riasec_scores)
                    .sort((a, b) => b[1] - a[1])
                    .map(([letter, score]) => (
                      <Box key={letter} sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2">
                            <strong>{letter}</strong> - {RIASEC_NAMES[letter]}
                          </Typography>
                          <Typography variant="body2">{score.toFixed(2)} / 7</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(score / 7) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
              </Box>

              {/* Suggested Jobs */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  💼 Eşleşen Meslekler
                </Typography>
                {debugData.suggested_jobs?.map((job, index) => (
                  <Chip
                    key={index}
                    label={`${translateJob(job.job)} (Mesafe: ${job.distance.toFixed(2)})`}
                    sx={{ mr: 1, mb: 1 }}
                    color={index === 0 ? "primary" : "default"}
                  />
                ))}
              </Box>

              {/* GPT Prompt */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  📝 GPT Prompt
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: "#f5f5f5",
                    maxHeight: 300,
                    overflow: "auto",
                  }}
                >
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
                  >
                    {debugData.gpt_prompt || "Prompt mevcut değil"}
                  </Typography>
                </Paper>
              </Box>

              {/* GPT Response */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  🤖 GPT Response
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: "#e8f5e9",
                    maxHeight: 300,
                    overflow: "auto",
                  }}
                >
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
                  >
                    {debugData.gpt_response || "Response mevcut değil"}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          ) : (
            <Typography>Veri yüklenemedi.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDebug}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default HighSchoolRoomDetail;
