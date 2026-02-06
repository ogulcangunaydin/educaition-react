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
import Header from "../components/organisms/Header";
import { useBasket } from "../contexts/BasketContext";
import { useUniversity } from "../contexts/UniversityContext";
import fetchWithAuth from "../utils/fetchWithAuth";
import {
  fetchAllTercihStatsCached,
  fetchAllPricesCached,
  fetchAllTercihIstatistikleriCached,
} from "../services/programService";

const ProgramRivalAnalysis = () => {
  const { selectedPrograms, selectedYear } = useBasket();
  const { isOwnUniversityName } = useUniversity();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rivalData, setRivalData] = useState([]);
  const [orderBy, setOrderBy] = useState("tercih_edilme");
  const [order, setOrder] = useState("asc");
  const [hiddenColumns, setHiddenColumns] = useState(new Set());

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

        // Load all data from API in parallel
        const [tercihStats, pricesData, tercihIstatistikleri] = await Promise.all([
          fetchAllTercihStatsCached(),
          fetchAllPricesCached(),
          fetchAllTercihIstatistikleriCached(),
        ]);

        // Build price map from API data
        const priceMap = new Map();
        for (const p of pricesData) {
          let normalizedYopKodu = p.yop_kodu;
          if (normalizedYopKodu && normalizedYopKodu.includes(".")) {
            const numValue = parseFloat(normalizedYopKodu);
            if (!isNaN(numValue)) {
              normalizedYopKodu = Math.round(numValue).toString();
            }
          }

          const key = `${normalizedYopKodu}_${p.scholarship_pct}`;
          const price =
            selectedYear === "2024"
              ? p.discounted_price_2024
              : selectedYear === "2025"
                ? p.discounted_price_2025
                : null;
          if (price !== null && !isNaN(price)) {
            priceMap.set(key, price);
          }
        }

        // Build tercih istatistikleri map from API data
        const tercihIstatMap = new Map();
        for (const istat of tercihIstatistikleri) {
          const yearSuffix = `_${selectedYear}`;
          tercihIstatMap.set(istat.yop_kodu, {
            birKontenjanaTalip: istat[`bir_kontenjana_talip_olan_aday_sayisi${yearSuffix}`],
            ilkUcSiradaTercihEdenSayisi: istat[`ilk_uc_sirada_tercih_eden_sayisi${yearSuffix}`],
            ilkUcSiradaTercihEdenOrani: istat[`ilk_uc_sirada_tercih_eden_orani${yearSuffix}`],
            ilkUcTercihOlarakYerlesenSayisi:
              istat[`ilk_uc_tercih_olarak_yerlesen_sayisi${yearSuffix}`],
            ilkUcTercihOlarakYerlesenOrani:
              istat[`ilk_uc_tercih_olarak_yerlesen_orani${yearSuffix}`],
          });
        }

        // Note: tercih_kullanma_oranlari is not in the current API - leaving as empty for now
        // This can be added in a future phase if needed
        const tercihKullanmaMap = new Map();

        console.log("[ProgramRivalAnalysis] Tercih stats count:", tercihStats.length);
        console.log("[ProgramRivalAnalysis] Selected year:", selectedYear);
        console.log("[ProgramRivalAnalysis] Selected programs:", selectedPrograms.length);
        console.log("[ProgramRivalAnalysis] First selected program:", selectedPrograms[0]);

        // Parse tercih stats into a map for quick lookup by yop_kodu
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

        console.log("[ProgramRivalAnalysis] CSV data map size:", csvDataMap.size);
        console.log(
          "[ProgramRivalAnalysis] First program yop_kodu:",
          selectedPrograms[0]?.yop_kodu
        );
        console.log(
          "[ProgramRivalAnalysis] CSV has this yop_kodu?",
          csvDataMap.has(selectedPrograms[0]?.yop_kodu)
        );

        // Find own university programs for baseline price calculation
        let ownUniversityTotalPrice = 0;
        let ownUniversityPriceCount = 0;
        for (const program of selectedPrograms) {
          if (isOwnUniversityName(program.university)) {
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
              ownUniversityTotalPrice += price;
              ownUniversityPriceCount++;
            }
          }
        }
        const ownUniversityAvgPrice =
          ownUniversityPriceCount > 0 ? ownUniversityTotalPrice / ownUniversityPriceCount : null;
        console.log("[ProgramRivalAnalysis] Own university avg price:", ownUniversityAvgPrice);

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
            const occupancyRate = kontenjan > 0 ? (yerlesen / kontenjan) * 100 : null;

            // Calculate price_index
            const isOwnUniversity = isOwnUniversityName(program.university);
            let priceIndex = null;
            if (isOwnUniversity) {
              priceIndex = 1.0;
            } else if (
              programPrice !== null &&
              ownUniversityAvgPrice !== null &&
              ownUniversityAvgPrice > 0
            ) {
              priceIndex = programPrice / ownUniversityAvgPrice;
            }

            // Price evaluation: priceIndex * occupancyRate / 100
            let priceEvaluationScore = null;
            let priceEvaluation = "-";
            if (priceIndex !== null && occupancyRate !== null) {
              priceEvaluationScore = Math.pow(priceIndex, 2) * (occupancyRate / 100);
              if (priceEvaluationScore <= 1) {
                priceEvaluation = "Fiyat sorunu yok";
              } else {
                priceEvaluation = "Fiyat çok yüksek veya marka yatırımı yetersiz";
              }
            }

            // Get tercih istatistikleri data
            const tercihIstat = tercihIstatMap.get(program.yop_kodu) || {};
            const tercihKullanma = tercihKullanmaMap.get(program.yop_kodu) || {};

            // Calculate Üst Üç Çekim Farkı = ilk_uc_tercih_olarak_yerlesen_orani - ilk_uc_sirada_tercih_eden_orani
            let ustUcCekimFarki = null;
            if (
              tercihIstat.ilkUcTercihOlarakYerlesenOrani !== null &&
              tercihIstat.ilkUcSiradaTercihEdenOrani !== null
            ) {
              ustUcCekimFarki =
                tercihIstat.ilkUcTercihOlarakYerlesenOrani - tercihIstat.ilkUcSiradaTercihEdenOrani;
            }

            programData.push({
              yop_kodu: program.yop_kodu,
              university: program.university,
              city: program.city || "-",
              program: program.program || program.department,
              program_detail: program.program_detail || "",
              scholarship: program.scholarship || "",
              puan_type: program.puan_type,
              kontenjan: kontenjan,
              tercihEdilme: csvData.ortalama_tercih_edilme,
              yerlesenTercih: csvData.ortalama_yerlesen_tercih,
              markaEtkinlik: csvData.marka_etkinlik,
              price: programPrice,
              occupancyRate,
              priceIndex,
              priceEvaluationScore,
              priceEvaluation,
              // New tercih istatistikleri fields
              birKontenjanaTalip: tercihIstat.birKontenjanaTalip,
              ilkUcSiradaTercihEdenSayisi: tercihIstat.ilkUcSiradaTercihEdenSayisi,
              ilkUcSiradaTercihEdenOrani: tercihIstat.ilkUcSiradaTercihEdenOrani,
              ilkUcTercihOlarakYerlesenSayisi: tercihIstat.ilkUcTercihOlarakYerlesenSayisi,
              ilkUcTercihOlarakYerlesenOrani: tercihIstat.ilkUcTercihOlarakYerlesenOrani,
              // Calculated field
              ustUcCekimFarki,
              // Tercih kullanma fields
              kullanilanTercih: tercihKullanma.kullanilanTercih,
              bosBirakilanTercih: tercihKullanma.bosBirakilanTercih,
              ortalamaKullanilanTercih: tercihKullanma.ortalamaKullanilanTercih,
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
  }, [selectedPrograms, selectedYear, isOwnUniversityName]);

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
        case "kontenjan":
          aValue = a.kontenjan || 0;
          bValue = b.kontenjan || 0;
          break;
        case "yerlesen_tercih":
          aValue = a.yerlesenTercih;
          bValue = b.yerlesenTercih;
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
        case "bir_kontenjana_talip":
          aValue = a.birKontenjanaTalip || 0;
          bValue = b.birKontenjanaTalip || 0;
          break;
        case "ilk_uc_sirada_tercih_eden_sayisi":
          aValue = a.ilkUcSiradaTercihEdenSayisi || 0;
          bValue = b.ilkUcSiradaTercihEdenSayisi || 0;
          break;
        case "ilk_uc_sirada_tercih_eden_orani":
          aValue = a.ilkUcSiradaTercihEdenOrani || 0;
          bValue = b.ilkUcSiradaTercihEdenOrani || 0;
          break;
        case "ilk_uc_tercih_olarak_yerlesen_sayisi":
          aValue = a.ilkUcTercihOlarakYerlesenSayisi || 0;
          bValue = b.ilkUcTercihOlarakYerlesenSayisi || 0;
          break;
        case "ilk_uc_tercih_olarak_yerlesen_orani":
          aValue = a.ilkUcTercihOlarakYerlesenOrani || 0;
          bValue = b.ilkUcTercihOlarakYerlesenOrani || 0;
          break;
        case "ust_uc_cekim_farki":
          aValue = a.ustUcCekimFarki || 0;
          bValue = b.ustUcCekimFarki || 0;
          break;
        case "kullanilan_tercih":
          aValue = a.kullanilanTercih || 0;
          bValue = b.kullanilanTercih || 0;
          break;
        case "bos_birakilan_tercih":
          aValue = a.bosBirakilanTercih || 0;
          bValue = b.bosBirakilanTercih || 0;
          break;
        case "ortalama_kullanilan_tercih":
          aValue = a.ortalamaKullanilanTercih || 0;
          bValue = b.ortalamaKullanilanTercih || 0;
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

  // Column definitions for visibility toggle
  const allColumns = [
    { id: "university", label: "Üniversite", alwaysVisible: true },
    { id: "city", label: "Şehir" },
    { id: "program", label: "Program", alwaysVisible: true },
    { id: "detail", label: "Detay" },
    { id: "scholarship", label: "Burs" },
    { id: "puan_type", label: "Tür" },
    { id: "kontenjan", label: "Kontenjan" },
    { id: "tercih_edilme", label: "Ort. Tercih Edilme Sırası" },
    { id: "yerlesen_tercih", label: "Ort. Yerleşen Tercih Sırası" },
    { id: "bir_kontenjana_talip", label: "Bir Kont. Talip" },
    { id: "ilk_uc_sirada_tercih_eden_sayisi", label: "İlk 3 Tercih Eden" },
    { id: "ilk_uc_sirada_tercih_eden_orani", label: "İlk 3 Tercih Oranı (%)" },
    { id: "ilk_uc_tercih_olarak_yerlesen_sayisi", label: "İlk 3 Yerleşen" },
    {
      id: "ilk_uc_tercih_olarak_yerlesen_orani",
      label: "İlk 3 Yerleşen Oranı (%)",
    },
    { id: "ust_uc_cekim_farki", label: "Üst Üç Çekim Farkı" },
    { id: "kullanilan_tercih", label: "Kullanılan Tercih" },
    { id: "bos_birakilan_tercih", label: "Boş Bırakılan Tercih" },
    { id: "ortalama_kullanilan_tercih", label: "Ort. Kullanılan Tercih" },
    { id: "price", label: "Fiyat (₺)", priceOnly: true },
    { id: "price_index", label: "Fiyat Endeksi", priceOnly: true },
    { id: "occupancy_rate", label: "Doluluk Oranı (%)", priceOnly: true },
    { id: "price_evaluation", label: "Fiyat Değerlendirme", priceOnly: true },
  ];

  // Get visible columns based on hiddenColumns and showPrices
  const visibleColumns = allColumns.filter((col) => {
    if (col.priceOnly && !showPrices) return false;
    return true;
  });

  // Toggle column visibility
  const toggleColumn = (columnId) => {
    const column = allColumns.find((c) => c.id === columnId);
    if (column?.alwaysVisible) return; // Don't allow hiding always-visible columns

    setHiddenColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  // Check if column is visible
  const isColumnVisible = (columnId) => !hiddenColumns.has(columnId);

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
      "Kontenjan",
      "Ort. Tercih Edilme Sırası",
      "Ort. Yerleşen Tercih Sırası",
      // Tercih İstatistikleri
      "Bir Kontenjana Talip Olan Aday Sayısı",
      "İlk Üç Sırada Tercih Eden Sayısı",
      "İlk Üç Sırada Tercih Eden Oranı (%)",
      "İlk Üç Tercih Olarak Yerleşen Sayısı",
      "İlk Üç Tercih Olarak Yerleşen Oranı (%)",
      "Üst Üç Çekim Farkı",
      // Tercih Kullanma
      "Kullanılan Tercih",
      "Boş Bırakılan Tercih",
      "Ortalama Kullanılan Tercih",
    ];

    const priceHeaders = showPrices
      ? ["Fiyat (₺)", "Fiyat Endeksi", "Doluluk Oranı (%)", "Fiyat Değerlendirme Skoru"]
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
        row.kontenjan || "-",
        row.tercihEdilme.toFixed(2),
        row.yerlesenTercih.toFixed(2),
        // Tercih İstatistikleri
        row.birKontenjanaTalip !== null && row.birKontenjanaTalip !== undefined
          ? row.birKontenjanaTalip.toFixed(1)
          : "-",
        row.ilkUcSiradaTercihEdenSayisi !== null && row.ilkUcSiradaTercihEdenSayisi !== undefined
          ? row.ilkUcSiradaTercihEdenSayisi
          : "-",
        row.ilkUcSiradaTercihEdenOrani !== null && row.ilkUcSiradaTercihEdenOrani !== undefined
          ? row.ilkUcSiradaTercihEdenOrani.toFixed(1)
          : "-",
        row.ilkUcTercihOlarakYerlesenSayisi !== null &&
        row.ilkUcTercihOlarakYerlesenSayisi !== undefined
          ? row.ilkUcTercihOlarakYerlesenSayisi
          : "-",
        row.ilkUcTercihOlarakYerlesenOrani !== null &&
        row.ilkUcTercihOlarakYerlesenOrani !== undefined
          ? row.ilkUcTercihOlarakYerlesenOrani.toFixed(1)
          : "-",
        row.ustUcCekimFarki !== null && row.ustUcCekimFarki !== undefined
          ? row.ustUcCekimFarki.toFixed(1)
          : "-",
        // Tercih Kullanma
        row.kullanilanTercih !== null && row.kullanilanTercih !== undefined
          ? row.kullanilanTercih
          : "-",
        row.bosBirakilanTercih !== null && row.bosBirakilanTercih !== undefined
          ? row.bosBirakilanTercih
          : "-",
        row.ortalamaKullanilanTercih !== null && row.ortalamaKullanilanTercih !== undefined
          ? row.ortalamaKullanilanTercih
          : "-",
      ];

      const priceData = showPrices
        ? [
            row.price !== null ? row.price.toLocaleString("tr-TR") : "-",
            row.priceIndex !== null ? row.priceIndex.toFixed(2) : "-",
            row.occupancyRate !== null ? row.occupancyRate.toFixed(1) : "-",
            row.priceEvaluationScore !== null ? row.priceEvaluationScore.toFixed(2) : "-",
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
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
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
              Program seçilmemiş. Lütfen önce Üniversite Karşılaştırma sayfasından program seçiniz.
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
                Seçili {selectedPrograms.length} program için bireysel rakip analizi
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" startIcon={<Download />} onClick={handleDownload}>
                CSV İndir
              </Button>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Üst Üç Çekim Farkı:</strong> İlk Üç Tercih Olarak Yerleşen Oranı - İlk Üç
              Sırada Tercih Eden Oranı. Pozitif değer programın çekim gücünün yüksek olduğunu
              gösterir.
            </Typography>
            {showPrices && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Fiyat Değerlendirme:</strong> Fiyat Endeksi x Doluluk Oranı. ≤1 ise fiyat
                sorunu yok, &gt;1 ise fiyat yüksek veya marka yatırımı yetersiz.
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: "italic" }}>
              💡 Kısaltılmış sütun adlarının üzerine geldiğinizde tam adlarını görebilirsiniz.
            </Typography>
          </Alert>

          {/* Column visibility toggles */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Görünür Sütunlar:</strong>{" "}
              <Typography variant="caption" color="text.secondary">
                (Gizlemek/göstermek için tıklayın)
              </Typography>
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
              }}
            >
              {visibleColumns.map((col) => (
                <Box
                  key={col.id}
                  onClick={() => toggleColumn(col.id)}
                  sx={{
                    cursor: col.alwaysVisible ? "default" : "pointer",
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: hiddenColumns.has(col.id)
                      ? "error.light"
                      : col.alwaysVisible
                        ? "primary.light"
                        : "grey.200",
                    textDecoration: hiddenColumns.has(col.id) ? "line-through" : "none",
                    opacity: hiddenColumns.has(col.id) ? 0.6 : 1,
                    fontSize: "0.75rem",
                    "&:hover": col.alwaysVisible
                      ? {}
                      : {
                          bgcolor: hiddenColumns.has(col.id) ? "error.main" : "grey.300",
                        },
                  }}
                >
                  {col.label}
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {isColumnVisible("university") && (
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "university"}
                      direction={orderBy === "university" ? order : "asc"}
                      onClick={() => handleSort("university")}
                    >
                      Üniversite
                    </TableSortLabel>
                  </TableCell>
                )}
                {isColumnVisible("city") && (
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "city"}
                      direction={orderBy === "city" ? order : "asc"}
                      onClick={() => handleSort("city")}
                    >
                      Şehir
                    </TableSortLabel>
                  </TableCell>
                )}
                {isColumnVisible("program") && (
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "program"}
                      direction={orderBy === "program" ? order : "asc"}
                      onClick={() => handleSort("program")}
                    >
                      Program
                    </TableSortLabel>
                  </TableCell>
                )}
                {isColumnVisible("detail") && <TableCell>Detay</TableCell>}
                {isColumnVisible("scholarship") && <TableCell>Burs</TableCell>}
                {isColumnVisible("puan_type") && <TableCell>Tür</TableCell>}
                {isColumnVisible("kontenjan") && (
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "kontenjan"}
                      direction={orderBy === "kontenjan" ? order : "asc"}
                      onClick={() => handleSort("kontenjan")}
                    >
                      Kontenjan
                    </TableSortLabel>
                  </TableCell>
                )}
                {isColumnVisible("tercih_edilme") && (
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "tercih_edilme"}
                      direction={orderBy === "tercih_edilme" ? order : "asc"}
                      onClick={() => handleSort("tercih_edilme")}
                    >
                      Ort. Tercih Edilme Sırası
                    </TableSortLabel>
                  </TableCell>
                )}
                {isColumnVisible("yerlesen_tercih") && (
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "yerlesen_tercih"}
                      direction={orderBy === "yerlesen_tercih" ? order : "asc"}
                      onClick={() => handleSort("yerlesen_tercih")}
                    >
                      Ort. Yerleşen Tercih Sırası
                    </TableSortLabel>
                  </TableCell>
                )}
                {/* Tercih İstatistikleri Columns */}
                {isColumnVisible("bir_kontenjana_talip") && (
                  <Tooltip title="Bir Kontenjana Talip Olan Aday Sayısı" arrow>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "bir_kontenjana_talip"}
                        direction={orderBy === "bir_kontenjana_talip" ? order : "asc"}
                        onClick={() => handleSort("bir_kontenjana_talip")}
                      >
                        Bir Kont. Talip
                      </TableSortLabel>
                    </TableCell>
                  </Tooltip>
                )}
                {isColumnVisible("ilk_uc_sirada_tercih_eden_sayisi") && (
                  <Tooltip title="İlk Üç Sırada Tercih Eden Sayısı" arrow>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "ilk_uc_sirada_tercih_eden_sayisi"}
                        direction={orderBy === "ilk_uc_sirada_tercih_eden_sayisi" ? order : "asc"}
                        onClick={() => handleSort("ilk_uc_sirada_tercih_eden_sayisi")}
                      >
                        İlk 3 Tercih Eden
                      </TableSortLabel>
                    </TableCell>
                  </Tooltip>
                )}
                {isColumnVisible("ilk_uc_sirada_tercih_eden_orani") && (
                  <Tooltip title="İlk Üç Sırada Tercih Eden Oranı (%)" arrow>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "ilk_uc_sirada_tercih_eden_orani"}
                        direction={orderBy === "ilk_uc_sirada_tercih_eden_orani" ? order : "asc"}
                        onClick={() => handleSort("ilk_uc_sirada_tercih_eden_orani")}
                      >
                        İlk 3 Tercih Oranı (%)
                      </TableSortLabel>
                    </TableCell>
                  </Tooltip>
                )}
                {isColumnVisible("ilk_uc_tercih_olarak_yerlesen_sayisi") && (
                  <Tooltip title="İlk Üç Tercih Olarak Yerleşen Sayısı" arrow>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "ilk_uc_tercih_olarak_yerlesen_sayisi"}
                        direction={
                          orderBy === "ilk_uc_tercih_olarak_yerlesen_sayisi" ? order : "asc"
                        }
                        onClick={() => handleSort("ilk_uc_tercih_olarak_yerlesen_sayisi")}
                      >
                        İlk 3 Yerleşen
                      </TableSortLabel>
                    </TableCell>
                  </Tooltip>
                )}
                {isColumnVisible("ilk_uc_tercih_olarak_yerlesen_orani") && (
                  <Tooltip title="İlk Üç Tercih Olarak Yerleşen Oranı (%)" arrow>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "ilk_uc_tercih_olarak_yerlesen_orani"}
                        direction={
                          orderBy === "ilk_uc_tercih_olarak_yerlesen_orani" ? order : "asc"
                        }
                        onClick={() => handleSort("ilk_uc_tercih_olarak_yerlesen_orani")}
                      >
                        İlk 3 Yerleşen Oranı (%)
                      </TableSortLabel>
                    </TableCell>
                  </Tooltip>
                )}
                {isColumnVisible("ust_uc_cekim_farki") && (
                  <Tooltip
                    title="İlk Üç Tercih Olarak Yerleşen Oranı - İlk Üç Sırada Tercih Eden Oranı. Pozitif değer programın çekim gücünün yüksek olduğunu gösterir."
                    arrow
                  >
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "ust_uc_cekim_farki"}
                        direction={orderBy === "ust_uc_cekim_farki" ? order : "asc"}
                        onClick={() => handleSort("ust_uc_cekim_farki")}
                      >
                        Üst Üç Çekim Farkı
                      </TableSortLabel>
                    </TableCell>
                  </Tooltip>
                )}
                {/* Tercih Kullanma Columns */}
                {isColumnVisible("kullanilan_tercih") && (
                  <Tooltip title="Kullanılan Tercih Sayısı" arrow>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "kullanilan_tercih"}
                        direction={orderBy === "kullanilan_tercih" ? order : "asc"}
                        onClick={() => handleSort("kullanilan_tercih")}
                      >
                        Kullanılan Tercih
                      </TableSortLabel>
                    </TableCell>
                  </Tooltip>
                )}
                {isColumnVisible("bos_birakilan_tercih") && (
                  <Tooltip title="Boş Bırakılan Tercih Sayısı" arrow>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "bos_birakilan_tercih"}
                        direction={orderBy === "bos_birakilan_tercih" ? order : "asc"}
                        onClick={() => handleSort("bos_birakilan_tercih")}
                      >
                        Boş Bırakılan Tercih
                      </TableSortLabel>
                    </TableCell>
                  </Tooltip>
                )}
                {isColumnVisible("ortalama_kullanilan_tercih") && (
                  <Tooltip title="Ortalama Kullanılan Tercih Sayısı" arrow>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "ortalama_kullanilan_tercih"}
                        direction={orderBy === "ortalama_kullanilan_tercih" ? order : "asc"}
                        onClick={() => handleSort("ortalama_kullanilan_tercih")}
                      >
                        Ort. Kullanılan Tercih
                      </TableSortLabel>
                    </TableCell>
                  </Tooltip>
                )}
                {showPrices && isColumnVisible("price") && (
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "price"}
                      direction={orderBy === "price" ? order : "asc"}
                      onClick={() => handleSort("price")}
                    >
                      Fiyat (₺)
                    </TableSortLabel>
                  </TableCell>
                )}
                {showPrices && isColumnVisible("price_index") && (
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "price_index"}
                      direction={orderBy === "price_index" ? order : "asc"}
                      onClick={() => handleSort("price_index")}
                    >
                      Fiyat Endeksi
                    </TableSortLabel>
                  </TableCell>
                )}
                {showPrices && isColumnVisible("occupancy_rate") && (
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "occupancy_rate"}
                      direction={orderBy === "occupancy_rate" ? order : "asc"}
                      onClick={() => handleSort("occupancy_rate")}
                    >
                      Doluluk Oranı (%)
                    </TableSortLabel>
                  </TableCell>
                )}
                {showPrices && isColumnVisible("price_evaluation") && (
                  <Tooltip
                    title="Fiyat Endeksi × Doluluk Oranı. ≤1 ise fiyat sorunu yok, >1 ise fiyat yüksek veya marka yatırımı yetersiz"
                    arrow
                  >
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === "price_evaluation"}
                        direction={orderBy === "price_evaluation" ? order : "asc"}
                        onClick={() => handleSort("price_evaluation")}
                      >
                        Fiyat Değerlendirme
                      </TableSortLabel>
                    </TableCell>
                  </Tooltip>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {getSortedData().map((row, index) => (
                <TableRow key={`${row.yop_kodu}-${index}`}>
                  {isColumnVisible("university") && (
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isOwnUniversityName(row.university) ? "bold" : "normal",
                        }}
                      >
                        {row.university}
                      </Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("city") && (
                    <TableCell>
                      <Typography variant="body2">{row.city}</Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("program") && (
                    <TableCell>
                      <Typography variant="body2">{row.program}</Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("detail") && (
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.program_detail || "-"}
                      </Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("scholarship") && (
                    <TableCell>
                      <Typography variant="body2">{row.scholarship || "-"}</Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("puan_type") && (
                    <TableCell>
                      <Chip label={row.puan_type.toUpperCase()} size="small" variant="outlined" />
                    </TableCell>
                  )}
                  {isColumnVisible("kontenjan") && (
                    <TableCell align="right">
                      <Typography variant="body2">{row.kontenjan || "-"}</Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("tercih_edilme") && (
                    <TableCell align="right">
                      <Typography variant="body2">{row.tercihEdilme.toFixed(2)}</Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("yerlesen_tercih") && (
                    <TableCell align="right">
                      <Typography variant="body2">{row.yerlesenTercih.toFixed(2)}</Typography>
                    </TableCell>
                  )}
                  {/* Tercih İstatistikleri Data */}
                  {isColumnVisible("bir_kontenjana_talip") && (
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.birKontenjanaTalip !== null && row.birKontenjanaTalip !== undefined
                          ? row.birKontenjanaTalip.toFixed(1)
                          : "-"}
                      </Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("ilk_uc_sirada_tercih_eden_sayisi") && (
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.ilkUcSiradaTercihEdenSayisi !== null &&
                        row.ilkUcSiradaTercihEdenSayisi !== undefined
                          ? row.ilkUcSiradaTercihEdenSayisi
                          : "-"}
                      </Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("ilk_uc_sirada_tercih_eden_orani") && (
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.ilkUcSiradaTercihEdenOrani !== null &&
                        row.ilkUcSiradaTercihEdenOrani !== undefined
                          ? `${row.ilkUcSiradaTercihEdenOrani.toFixed(1)}%`
                          : "-"}
                      </Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("ilk_uc_tercih_olarak_yerlesen_sayisi") && (
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.ilkUcTercihOlarakYerlesenSayisi !== null &&
                        row.ilkUcTercihOlarakYerlesenSayisi !== undefined
                          ? row.ilkUcTercihOlarakYerlesenSayisi
                          : "-"}
                      </Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("ilk_uc_tercih_olarak_yerlesen_orani") && (
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.ilkUcTercihOlarakYerlesenOrani !== null &&
                        row.ilkUcTercihOlarakYerlesenOrani !== undefined
                          ? `${row.ilkUcTercihOlarakYerlesenOrani.toFixed(1)}%`
                          : "-"}
                      </Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("ust_uc_cekim_farki") && (
                    <TableCell align="right">
                      {row.ustUcCekimFarki !== null && row.ustUcCekimFarki !== undefined ? (
                        <Chip
                          label={`${row.ustUcCekimFarki.toFixed(1)}%`}
                          size="small"
                          color={row.ustUcCekimFarki >= 0 ? "success" : "error"}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  )}
                  {/* Tercih Kullanma Data */}
                  {isColumnVisible("kullanilan_tercih") && (
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.kullanilanTercih !== null && row.kullanilanTercih !== undefined
                          ? row.kullanilanTercih
                          : "-"}
                      </Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("bos_birakilan_tercih") && (
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.bosBirakilanTercih !== null && row.bosBirakilanTercih !== undefined
                          ? row.bosBirakilanTercih
                          : "-"}
                      </Typography>
                    </TableCell>
                  )}
                  {isColumnVisible("ortalama_kullanilan_tercih") && (
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.ortalamaKullanilanTercih !== null &&
                        row.ortalamaKullanilanTercih !== undefined
                          ? row.ortalamaKullanilanTercih
                          : "-"}
                      </Typography>
                    </TableCell>
                  )}
                  {showPrices && isColumnVisible("price") && (
                    <TableCell align="right">
                      {row.price !== null ? (
                        <Typography variant="body2">
                          {row.price.toLocaleString("tr-TR")} ₺
                        </Typography>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  )}
                  {showPrices && isColumnVisible("price_index") && (
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
                  )}
                  {showPrices && isColumnVisible("occupancy_rate") && (
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
                  )}
                  {showPrices && isColumnVisible("price_evaluation") && (
                    <TableCell align="right">
                      {row.priceEvaluationScore !== null ? (
                        <Tooltip title={row.priceEvaluation} arrow placement="top">
                          <Chip
                            label={row.priceEvaluationScore.toFixed(2)}
                            size="small"
                            color={row.priceEvaluationScore <= 1 ? "success" : "error"}
                          />
                        </Tooltip>
                      ) : (
                        "-"
                      )}
                    </TableCell>
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
