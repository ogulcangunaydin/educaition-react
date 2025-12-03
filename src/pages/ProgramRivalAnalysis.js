import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TableSortLabel,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import Header from "../components/Header";
import { useBasket } from "../contexts/BasketContext";
import fetchWithAuth from "../utils/fetchWithAuth";

const ProgramRivalAnalysis = () => {
  const { selectedPrograms, selectedYear } = useBasket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rivalData, setRivalData] = useState([]);
  const [orderBy, setOrderBy] = useState("marka_etkinlik_degeri");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/rooms`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {}
    };

    fetchRooms();
  }, []);

  // Load rival analysis data
  useEffect(() => {
    const loadRivalData = async () => {
      if (selectedPrograms.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load from both folders
        const [response1, response2] = await Promise.all([
          fetch("/assets/data/all_universities_combined_tercih_stats.csv"),
          fetch("/assets/data_2025/all_universities_combined_tercih_stats.csv"),
        ]);

        if (!response1.ok && !response2.ok)
          throw new Error("Failed to load rival data");

        const allLines = [];

        // Combine lines from both files
        if (response1.ok) {
          const text1 = await response1.text();
          const lines1 = text1.trim().split("\n");
          allLines.push(...lines1.slice(1)); // Skip header
        }

        if (response2.ok) {
          const text2 = await response2.text();
          const lines2 = text2.trim().split("\n");
          allLines.push(...lines2.slice(1)); // Skip header
        }

        const lines = allLines;

        console.log("[ProgramRivalAnalysis] Total CSV lines:", lines.length);
        console.log("[ProgramRivalAnalysis] Selected year:", selectedYear);
        console.log(
          "[ProgramRivalAnalysis] Selected programs:",
          selectedPrograms.length
        );
        console.log(
          "[ProgramRivalAnalysis] First selected program:",
          selectedPrograms[0]
        );

        // Parse CSV data into a map for quick lookup by yop_kodu
        const csvDataMap = new Map();
        for (let i = 0; i < lines.length; i++) {
          const parts = lines[i].split(",");
          if (parts.length >= 5) {
            const yop_kodu = parts[0];
            const year = parts[1];

            // Only include data for the selected year
            if (year === String(selectedYear)) {
              csvDataMap.set(yop_kodu, {
                ortalama_tercih_edilme: parseFloat(parts[2]),
                ortalama_yerlesen_tercih: parseFloat(parts[3]),
                marka_etkinlik: parseFloat(parts[4]),
              });
            }
          }
        }

        console.log(
          "[ProgramRivalAnalysis] CSV data map size:",
          csvDataMap.size
        );
        console.log(
          "[ProgramRivalAnalysis] First program yop_kodu:",
          selectedPrograms[0]?.yop_kodu
        );
        console.log(
          "[ProgramRivalAnalysis] CSV has this yop_kodu?",
          csvDataMap.has(selectedPrograms[0]?.yop_kodu)
        );

        // Create a row for each selected program using yop_kodu as primary key
        const programData = [];
        for (const program of selectedPrograms) {
          const csvData = csvDataMap.get(program.yop_kodu);
          if (csvData) {
            programData.push({
              yop_kodu: program.yop_kodu,
              university: program.university,
              city: program.city || "-",
              program: program.program || program.department,
              program_detail: program.program_detail || "",
              scholarship: program.scholarship || "",
              puan_type: program.puan_type,
              tercihEdilme: csvData.ortalama_tercih_edilme,
              yerlesenTercih: csvData.ortalama_yerlesen_tercih,
              markaEtkinlik: csvData.marka_etkinlik,
            });
          }
        }

        console.log(
          "[ProgramRivalAnalysis] Matched programs:",
          programData.length,
          "out of",
          selectedPrograms.length
        );

        setRivalData(programData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading rival data:", err);
        setError("Program rakip analizi verileri yüklenirken hata oluştu");
        setLoading(false);
      }
    };

    loadRivalData();
  }, [selectedPrograms, selectedYear]);

  // Handle sorting
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const getSortedData = () => {
    return [...rivalData].sort((a, b) => {
      let aValue, bValue;

      switch (orderBy) {
        case "university":
          aValue = a.university;
          bValue = b.university;
          break;
        case "city":
          aValue = a.city;
          bValue = b.city;
          break;
        case "program":
          aValue = a.program;
          bValue = b.program;
          break;
        case "tercih_edilme":
          aValue = a.tercihEdilme;
          bValue = b.tercihEdilme;
          break;
        case "yerlesen_tercih":
          aValue = a.yerlesenTercih;
          bValue = b.yerlesenTercih;
          break;
        case "marka_etkinlik_degeri":
          aValue = a.markaEtkinlik;
          bValue = b.markaEtkinlik;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue, "tr")
          : bValue.localeCompare(aValue, "tr");
      }

      return order === "asc" ? aValue - bValue : bValue - aValue;
    });
  };

  // Download as CSV
  const handleDownload = () => {
    const headers = [
      "YÖP Kodu",
      "Üniversite",
      "Şehir",
      "Program",
      "Detay",
      "Burs",
      "Puan Türü",
      "Ort. Tercih Edilme Sırası (A)",
      "Ort. Yerleşen Tercih Sırası (B)",
      "Marka Etkinlik Değeri (A/B)",
    ];

    const rows = getSortedData().map((row) => [
      row.yop_kodu,
      row.university,
      row.city,
      row.program,
      row.program_detail,
      row.scholarship,
      row.puan_type,
      row.tercihEdilme.toFixed(2),
      row.yerlesenTercih.toFixed(2),
      row.markaEtkinlik.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `program_rakip_analizi_${selectedYear}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <>
        <Header title="Program Rakip Analizi" />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (selectedPrograms.length === 0) {
    return (
      <>
        <Header title="Program Rakip Analizi" />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Program seçilmemiş. Lütfen önce Üniversite Karşılaştırma
              sayfasından program seçiniz.
            </Alert>
          </Paper>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Program Rakip Analizi" />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header title="Program Rakip Analizi" />
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, marginTop: "70px" }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h5" gutterBottom>
                Program Rakip Analizi - {selectedYear}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seçili {selectedPrograms.length} program için bireysel rakip
                analizi
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownload}
              >
                CSV İndir
              </Button>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Marka Etkinlik Değeri:</strong> Ortalama Tercih Edilme
              Sırası / Ortalama Yerleşen Tercih Sırası. Düşük değer, programın
              daha erken tercih edildiğini ve daha geç sırada yerleşenlerin
              bulunduğunu gösterir (daha güçlü marka).
            </Typography>
          </Alert>
        </Paper>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "university"}
                    direction={orderBy === "university" ? order : "asc"}
                    onClick={() => handleSort("university")}
                  >
                    Üniversite
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "city"}
                    direction={orderBy === "city" ? order : "asc"}
                    onClick={() => handleSort("city")}
                  >
                    Şehir
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "program"}
                    direction={orderBy === "program" ? order : "asc"}
                    onClick={() => handleSort("program")}
                  >
                    Program
                  </TableSortLabel>
                </TableCell>
                <TableCell>Detay</TableCell>
                <TableCell>Burs</TableCell>
                <TableCell>Tür</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "tercih_edilme"}
                    direction={orderBy === "tercih_edilme" ? order : "asc"}
                    onClick={() => handleSort("tercih_edilme")}
                  >
                    Ort. Tercih Edilme Sırası (A)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "yerlesen_tercih"}
                    direction={orderBy === "yerlesen_tercih" ? order : "asc"}
                    onClick={() => handleSort("yerlesen_tercih")}
                  >
                    Ort. Yerleşen Tercih Sırası (B)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "marka_etkinlik_degeri"}
                    direction={
                      orderBy === "marka_etkinlik_degeri" ? order : "asc"
                    }
                    onClick={() => handleSort("marka_etkinlik_degeri")}
                  >
                    Marka Etkinlik Değeri (A/B)
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getSortedData().map((row, index) => (
                <TableRow key={`${row.yop_kodu}-${index}`}>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight:
                          row.university === "HALİÇ ÜNİVERSİTESİ"
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {row.university}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.city}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.program}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {row.program_detail || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.scholarship || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.puan_type.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {row.tercihEdilme.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {row.yerlesenTercih.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {row.markaEtkinlik.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {rivalData.length === 0 && (
          <Paper sx={{ p: 3, mt: 2, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              Seçili programlar için rakip analizi verisi bulunamadı.
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default ProgramRivalAnalysis;
