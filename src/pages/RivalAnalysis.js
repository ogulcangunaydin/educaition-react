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
import Header from "../components/organisms/Header";
import { useBasket } from "../contexts/BasketContext";
import fetchWithAuth from "../utils/fetchWithAuth";
import { fetchAllTercihStatsCached } from "../services/programService";

const RivalAnalysis = () => {
  const { selectedPrograms, selectedYear } = useBasket();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rivalData, setRivalData] = useState([]);
  const [orderBy, setOrderBy] = useState("marka_etkinlik_degeri");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetchWithAuth(`${process.env.REACT_APP_BACKEND_BASE_URL}/rooms`, {
          method: "GET",
        });

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

        // Load tercih stats from API
        const tercihStats = await fetchAllTercihStatsCached();

        console.log("[RivalAnalysis] Tercih stats count:", tercihStats.length);
        console.log("[RivalAnalysis] Selected year:", selectedYear);
        console.log("[RivalAnalysis] Selected programs:", selectedPrograms.length);
        console.log("[RivalAnalysis] First selected program:", selectedPrograms[0]);

        // Parse data into a map for quick lookup by yop_kodu
        const csvDataMap = new Map();
        for (const stat of tercihStats) {
          // Only include data for the selected year
          if (stat.year === Number(selectedYear)) {
            csvDataMap.set(stat.yop_kodu, {
              ortalama_tercih_edilme: stat.ortalama_tercih_edilme_sirasi,
              ortalama_yerlesen_tercih: stat.ortalama_yerlesen_tercih_sirasi,
              marka_etkinlik: stat.marka_etkinlik_degeri,
            });
          }
        }

        console.log("[RivalAnalysis] CSV data map size:", csvDataMap.size);
        console.log("[RivalAnalysis] First program yop_kodu:", selectedPrograms[0]?.yop_kodu);
        console.log(
          "[RivalAnalysis] CSV has this yop_kodu?",
          csvDataMap.has(selectedPrograms[0]?.yop_kodu)
        );

        // Aggregate data by university for all selected programs
        const universityData = {};
        let matchedCount = 0;
        for (const program of selectedPrograms) {
          const csvData = csvDataMap.get(program.yop_kodu);

          if (csvData) {
            matchedCount++;
            const university = program.university;
            const city = program.city;

            if (!universityData[university]) {
              universityData[university] = {
                university,
                city,
                programCount: 0,
                totalTercihEdilme: 0,
                totalYerlesenTercih: 0,
                totalMarkaEtkinlik: 0,
                programs: [],
              };
            }

            universityData[university].programCount += 1;
            universityData[university].totalTercihEdilme += csvData.ortalama_tercih_edilme;
            universityData[university].totalYerlesenTercih += csvData.ortalama_yerlesen_tercih;
            universityData[university].totalMarkaEtkinlik += csvData.marka_etkinlik;
            universityData[university].programs.push({
              program: program.program || program.department,
              yop_kodu: program.yop_kodu,
              program_detail: program.program_detail || "",
              scholarship: program.scholarship || "",
            });
          }
        }

        console.log(
          "[RivalAnalysis] Matched programs:",
          matchedCount,
          "out of",
          selectedPrograms.length
        );
        console.log("[RivalAnalysis] Universities found:", Object.keys(universityData));

        // Calculate averages
        const data = Object.values(universityData).map((uni) => ({
          university: uni.university,
          city: uni.city,
          programCount: uni.programCount,
          avgTercihEdilme: uni.totalTercihEdilme / uni.programCount,
          avgYerlesenTercih: uni.totalYerlesenTercih / uni.programCount,
          avgMarkaEtkinlik: uni.totalMarkaEtkinlik / uni.programCount,
          programs: uni.programs,
        }));

        setRivalData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading rival data:", err);
        setError("Rakip analizi verileri yüklenirken hata oluştu");
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
        case "programCount":
          aValue = a.programCount;
          bValue = b.programCount;
          break;
        case "tercih_edilme":
          aValue = a.avgTercihEdilme;
          bValue = b.avgTercihEdilme;
          break;
        case "yerlesen_tercih":
          aValue = a.avgYerlesenTercih;
          bValue = b.avgYerlesenTercih;
          break;
        case "marka_etkinlik_degeri":
          aValue = a.avgMarkaEtkinlik;
          bValue = b.avgMarkaEtkinlik;
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
      "Üniversite",
      "Şehir",
      "Program Sayısı",
      "Ort. Tercih Edilme Sırası (A)",
      "Ort. Yerleşen Tercih Sırası (B)",
      "Marka Etkinlik Değeri (A/B)",
      "Programlar",
    ];

    const rows = getSortedData().map((row) => [
      row.university,
      row.city,
      row.programCount,
      row.avgTercihEdilme.toFixed(2),
      row.avgYerlesenTercih.toFixed(2),
      row.avgMarkaEtkinlik.toFixed(2),
      row.programs.map((p) => p.program).join("; "),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rakip_analizi_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (selectedPrograms.length === 0) {
    return (
      <>
        <Header title="Rakip Analizi" />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="info">
            <Typography>Rakip analizi için önce program seçmeniz gerekiyor.</Typography>
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header title="Rakip Analizi" />
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Chip label={`${selectedPrograms.length} program`} color="primary" sx={{ mr: 2 }} />
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownload}
              disabled={loading || rivalData.length === 0}
            >
              CSV İndir
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Seçilen Programlar {selectedYear && `(${selectedYear})`}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedPrograms.map((program) => (
              <Chip
                key={program.yop_kodu}
                label={`${program.university} - ${program.program || program.department}${
                  program.scholarship ? ` (Burs: ${program.scholarship})` : ""
                }`}
                size="small"
              />
            ))}
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Rakip analizi verileri yükleniyor...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Üniversite Bazında Rakip Analizi - {selectedYear} ({rivalData.length} üniversite)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Açıklama:</strong> Ortalama Tercih Edilme Sırası (A): Öğrencilerin programı
              kaçıncı sırada tercih ettiği. Ortalama Yerleşen Tercih Sırası (B): Yerleşen
              öğrencilerin kaçıncı tercihte yerleştiği. Marka Etkinlik Değeri (A/B): Yüksek değer,
              programın daha erken sıralarda tercih edildiğini gösterir.
            </Typography>

            <TableContainer sx={{ maxHeight: 600, mt: 2 }}>
              <Table stickyHeader size="small">
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
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "programCount"}
                        direction={orderBy === "programCount" ? order : "asc"}
                        onClick={() => handleSort("programCount")}
                      >
                        Program Sayısı
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "tercih_edilme"}
                        direction={orderBy === "tercih_edilme" ? order : "asc"}
                        onClick={() => handleSort("tercih_edilme")}
                      >
                        Ort. Tercih Edilme (A)
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "yerlesen_tercih"}
                        direction={orderBy === "yerlesen_tercih" ? order : "asc"}
                        onClick={() => handleSort("yerlesen_tercih")}
                      >
                        Ort. Yerleşen Tercih (B)
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "marka_etkinlik_degeri"}
                        direction={orderBy === "marka_etkinlik_degeri" ? order : "asc"}
                        onClick={() => handleSort("marka_etkinlik_degeri")}
                      >
                        Marka Etkinlik (A/B)
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getSortedData().map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{row.university}</TableCell>
                      <TableCell>{row.city}</TableCell>
                      <TableCell align="right">{row.programCount}</TableCell>
                      <TableCell align="right">{row.avgTercihEdilme.toFixed(2)}</TableCell>
                      <TableCell align="right">{row.avgYerlesenTercih.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={row.avgMarkaEtkinlik.toFixed(2)}
                          size="small"
                          color={
                            row.avgMarkaEtkinlik > 1.5
                              ? "success"
                              : row.avgMarkaEtkinlik > 1
                                ? "primary"
                                : "default"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default RivalAnalysis;
