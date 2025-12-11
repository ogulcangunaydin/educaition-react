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
  Tooltip,
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

        // Load from both folders and also load price data
        const [response1, response2, priceResponse] = await Promise.all([
          fetch("/assets/data/all_universities_combined_tercih_stats.csv"),
          fetch("/assets/data_2025/all_universities_combined_tercih_stats.csv"),
          fetch("/assets/data/all_programs_prices_processed.csv"),
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

        // Parse price data
        const priceMap = new Map();
        if (priceResponse.ok) {
          const priceText = await priceResponse.text();
          const priceLines = priceText.trim().split("\n");
          for (let i = 1; i < priceLines.length; i++) {
            const parts = priceLines[i].split(",");
            if (parts.length >= 9) {
              const yop_kodu = parts[0]?.trim();
              const scholarship_pct = parseFloat(parts[4]);
              // Use year-specific prices
              const price_2024 = parseFloat(parts[7]) || null; // discounted_price_2024
              const price_2025 = parseFloat(parts[8]) || null; // discounted_price_2025

              // Normalize yop_kodu
              let normalizedYopKodu = yop_kodu;
              if (normalizedYopKodu && normalizedYopKodu.includes(".")) {
                const numValue = parseFloat(normalizedYopKodu);
                if (!isNaN(numValue)) {
                  normalizedYopKodu = Math.round(numValue).toString();
                }
              }

              const key = `${normalizedYopKodu}_${scholarship_pct}`;
              const price =
                selectedYear === "2024"
                  ? price_2024
                  : selectedYear === "2025"
                  ? price_2025
                  : null;
              if (price !== null && !isNaN(price)) {
                priceMap.set(key, price);
              }
            }
          }
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

        // Find Haliç University programs for baseline price calculation
        let halicTotalPrice = 0;
        let halicPriceCount = 0;
        for (const program of selectedPrograms) {
          if (
            program.university === "Haliç Üniversitesi" ||
            program.university === "HALİÇ ÜNİVERSİTESİ"
          ) {
            const scholarship = program.scholarship || "";
            let scholarship_pct = 0;
            if (scholarship.includes("Burslu") || scholarship.includes("100")) {
              scholarship_pct = 100;
            } else if (scholarship.includes("75")) {
              scholarship_pct = 75;
            } else if (scholarship.includes("50")) {
              scholarship_pct = 50;
            } else if (scholarship.includes("25")) {
              scholarship_pct = 25;
            }

            let normalizedYopKodu = program.yop_kodu;
            if (normalizedYopKodu && normalizedYopKodu.includes(".")) {
              const numValue = parseFloat(normalizedYopKodu);
              if (!isNaN(numValue)) {
                normalizedYopKodu = Math.round(numValue).toString();
              }
            }

            const priceKey = `${normalizedYopKodu}_${scholarship_pct}`;
            const price = priceMap.get(priceKey);
            if (price) {
              halicTotalPrice += price;
              halicPriceCount++;
            }
          }
        }
        const halicAvgPrice =
          halicPriceCount > 0 ? halicTotalPrice / halicPriceCount : null;
        console.log("[ProgramRivalAnalysis] Haliç avg price:", halicAvgPrice);

        // Create a row for each selected program using yop_kodu as primary key
        const programData = [];
        for (const program of selectedPrograms) {
          const csvData = csvDataMap.get(program.yop_kodu);
          if (csvData) {
            // Get price for this program
            const scholarship = program.scholarship || "";
            let scholarship_pct = 0;
            if (scholarship.includes("Burslu") || scholarship.includes("100")) {
              scholarship_pct = 100;
            } else if (scholarship.includes("75")) {
              scholarship_pct = 75;
            } else if (scholarship.includes("50")) {
              scholarship_pct = 50;
            } else if (scholarship.includes("25")) {
              scholarship_pct = 25;
            }

            let normalizedYopKodu = program.yop_kodu;
            if (normalizedYopKodu && normalizedYopKodu.includes(".")) {
              const numValue = parseFloat(normalizedYopKodu);
              if (!isNaN(numValue)) {
                normalizedYopKodu = Math.round(numValue).toString();
              }
            }

            const priceKey = `${normalizedYopKodu}_${scholarship_pct}`;
            const programPrice = priceMap.get(priceKey) || null;

            // Get kontenjan and yerlesen for occupancy rate
            const kontenjan = program[`kontenjan_${selectedYear}`] || 0;
            const yerlesen = program[`yerlesen_${selectedYear}`] || 0;
            const occupancyRate =
              kontenjan > 0 ? (yerlesen / kontenjan) * 100 : null;

            // Calculate price_index
            const isHalic =
              program.university === "Haliç Üniversitesi" ||
              program.university === "HALİÇ ÜNİVERSİTESİ";
            let priceIndex = null;
            if (isHalic) {
              priceIndex = 1.0;
            } else if (
              programPrice !== null &&
              halicAvgPrice !== null &&
              halicAvgPrice > 0
            ) {
              priceIndex = programPrice / halicAvgPrice;
            }

            // Price evaluation: priceIndex * occupancyRate / 100
            let priceEvaluationScore = null;
            let priceEvaluation = "-";
            if (priceIndex !== null && occupancyRate !== null) {
              priceEvaluationScore = priceIndex * (occupancyRate / 100);
              if (priceEvaluationScore <= 1) {
                priceEvaluation = "Fiyat sorunu yok";
              } else {
                priceEvaluation =
                  "Fiyat çok yüksek veya marka yatırımı yetersiz";
              }
            }

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
              price: programPrice,
              occupancyRate,
              priceIndex,
              priceEvaluationScore,
              priceEvaluation,
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
        case "price_index":
          aValue = a.priceIndex || 0;
          bValue = b.priceIndex || 0;
          break;
        case "occupancy_rate":
          aValue = a.occupancyRate || 0;
          bValue = b.occupancyRate || 0;
          break;
        case "price_evaluation":
          aValue = a.priceEvaluationScore || 0;
          bValue = b.priceEvaluationScore || 0;
          break;
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
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

  // Check if prices are available for the selected year
  const showPrices = selectedYear === "2024" || selectedYear === "2025";

  // Download as CSV
  const handleDownload = () => {
    const baseHeaders = [
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

    const priceHeaders = showPrices
      ? [
          "Fiyat (₺)",
          "Fiyat Endeksi",
          "Doluluk Oranı (%)",
          "Fiyat Değerlendirme Skoru",
        ]
      : [];

    const headers = [...baseHeaders, ...priceHeaders];

    const rows = getSortedData().map((row) => {
      const baseData = [
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
      ];

      const priceData = showPrices
        ? [
            row.price !== null ? row.price.toLocaleString("tr-TR") : "-",
            row.priceIndex !== null ? row.priceIndex.toFixed(2) : "-",
            row.occupancyRate !== null ? row.occupancyRate.toFixed(1) : "-",
            row.priceEvaluationScore !== null
              ? row.priceEvaluationScore.toFixed(2)
              : "-",
          ]
        : [];

      return [...baseData, ...priceData];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
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
                {showPrices && (
                  <>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "price"}
                        direction={orderBy === "price" ? order : "asc"}
                        onClick={() => handleSort("price")}
                      >
                        Fiyat (₺)
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "price_index"}
                        direction={orderBy === "price_index" ? order : "asc"}
                        onClick={() => handleSort("price_index")}
                      >
                        Fiyat Endeksi
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "occupancy_rate"}
                        direction={orderBy === "occupancy_rate" ? order : "asc"}
                        onClick={() => handleSort("occupancy_rate")}
                      >
                        Doluluk Oranı (%)
                      </TableSortLabel>
                    </TableCell>
                    <Tooltip
                      title="Fiyat Endeksi × Doluluk Oranı. ≤1 ise fiyat sorunu yok, >1 ise fiyat yüksek veya marka yatırımı yetersiz"
                      arrow
                    >
                      <TableCell align="right">
                        <TableSortLabel
                          active={orderBy === "price_evaluation"}
                          direction={
                            orderBy === "price_evaluation" ? order : "asc"
                          }
                          onClick={() => handleSort("price_evaluation")}
                        >
                          Fiyat Değerlendirme
                        </TableSortLabel>
                      </TableCell>
                    </Tooltip>
                  </>
                )}
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
                  {showPrices && (
                    <>
                      <TableCell align="right">
                        {row.price !== null ? (
                          <Typography variant="body2">
                            {row.price.toLocaleString("tr-TR")} ₺
                          </Typography>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {row.priceIndex !== null ? (
                          <Chip
                            label={row.priceIndex.toFixed(2)}
                            size="small"
                            color={
                              row.priceIndex <= 1
                                ? "success"
                                : row.priceIndex <= 1.2
                                ? "warning"
                                : "error"
                            }
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {row.occupancyRate !== null ? (
                          <Chip
                            label={`${row.occupancyRate.toFixed(1)}%`}
                            size="small"
                            color={
                              row.occupancyRate >= 90
                                ? "success"
                                : row.occupancyRate >= 70
                                ? "primary"
                                : row.occupancyRate >= 50
                                ? "warning"
                                : "error"
                            }
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {row.priceEvaluationScore !== null ? (
                          <Tooltip
                            title={row.priceEvaluation}
                            arrow
                            placement="top"
                          >
                            <Chip
                              label={row.priceEvaluationScore.toFixed(2)}
                              size="small"
                              color={
                                row.priceEvaluationScore <= 1
                                  ? "success"
                                  : "error"
                              }
                            />
                          </Tooltip>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </>
                  )}
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
