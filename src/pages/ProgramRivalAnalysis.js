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

        // Load from both folders and also load price data and tercih statistics
        const [
          response1,
          response2,
          priceResponse,
          tercihIstatResponse1,
          tercihIstatResponse2,
          tercihKullanmaResponse1,
          tercihKullanmaResponse2,
        ] = await Promise.all([
          fetch("/assets/data/all_universities_combined_tercih_stats.csv"),
          fetch("/assets/data_2025/all_universities_combined_tercih_stats.csv"),
          fetch("/assets/data/all_programs_prices_processed.csv"),
          fetch("/assets/data/all_universities_tercih_istatistikleri.csv"),
          fetch("/assets/data_2025/all_universities_tercih_istatistikleri.csv"),
          fetch("/assets/data/all_universities_tercih_kullanma_oranlari.csv"),
          fetch(
            "/assets/data_2025/all_universities_tercih_kullanma_oranlari.csv"
          ),
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

        // Parse tercih istatistikleri data (bir_kontenjana_talip, ilk_uc_sirada_tercih_eden, ilk_uc_tercih_olarak_yerlesen)
        const tercihIstatMap = new Map();

        // Helper to parse Turkish decimal format
        const parseTurkishDecimal = (value) => {
          if (!value || value === "") return null;
          // Remove quotes if present
          const cleaned = value.toString().replace(/"/g, "").replace(",", ".");
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? null : parsed;
        };

        // Helper to parse CSV line with quoted fields containing commas
        const parseCSVLine = (line) => {
          const result = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              result.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        // Parse 2022-2024 data from data folder
        if (tercihIstatResponse1.ok) {
          const text = await tercihIstatResponse1.text();
          const lines = text.trim().split("\n");
          for (let i = 1; i < lines.length; i++) {
            const parts = parseCSVLine(lines[i]);
            if (parts.length >= 16) {
              const yop_kodu = parts[0]?.trim();
              // Year columns: 2022=index 1,4,7,10,13 | 2023=index 2,5,8,11,14 | 2024=index 3,6,9,12,15
              const yearIndex =
                selectedYear === "2022"
                  ? 0
                  : selectedYear === "2023"
                  ? 1
                  : selectedYear === "2024"
                  ? 2
                  : -1;
              if (yearIndex >= 0) {
                tercihIstatMap.set(yop_kodu, {
                  birKontenjanaTalip: parseTurkishDecimal(parts[1 + yearIndex]),
                  ilkUcSiradaTercihEdenSayisi: parseTurkishDecimal(
                    parts[4 + yearIndex]
                  ),
                  ilkUcSiradaTercihEdenOrani: parseTurkishDecimal(
                    parts[7 + yearIndex]
                  ),
                  ilkUcTercihOlarakYerlesenSayisi: parseTurkishDecimal(
                    parts[10 + yearIndex]
                  ),
                  ilkUcTercihOlarakYerlesenOrani: parseTurkishDecimal(
                    parts[13 + yearIndex]
                  ),
                });
              }
            }
          }
        }

        // Parse 2025 data from data_2025 folder (overwrites if year is 2025)
        if (selectedYear === "2025" && tercihIstatResponse2.ok) {
          const text = await tercihIstatResponse2.text();
          const lines = text.trim().split("\n");
          for (let i = 1; i < lines.length; i++) {
            const parts = parseCSVLine(lines[i]);
            if (parts.length >= 6) {
              const yop_kodu = parts[0]?.trim();
              tercihIstatMap.set(yop_kodu, {
                birKontenjanaTalip: parseTurkishDecimal(parts[1]),
                ilkUcSiradaTercihEdenSayisi: parseTurkishDecimal(parts[2]),
                ilkUcSiradaTercihEdenOrani: parseTurkishDecimal(parts[3]),
                ilkUcTercihOlarakYerlesenSayisi: parseTurkishDecimal(parts[4]),
                ilkUcTercihOlarakYerlesenOrani: parseTurkishDecimal(parts[5]),
              });
            }
          }
        }

        // Parse tercih kullanma oranlari data
        const tercihKullanmaMap = new Map();

        // Parse 2022-2024 data from data folder
        if (tercihKullanmaResponse1.ok) {
          const text = await tercihKullanmaResponse1.text();
          const lines = text.trim().split("\n");
          for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(",");
            if (parts.length >= 10) {
              const yop_kodu = parts[0]?.trim();
              // Year columns: 2022=index 0 | 2023=index 1 | 2024=index 2
              const yearIndex =
                selectedYear === "2022"
                  ? 0
                  : selectedYear === "2023"
                  ? 1
                  : selectedYear === "2024"
                  ? 2
                  : -1;
              if (yearIndex >= 0) {
                tercihKullanmaMap.set(yop_kodu, {
                  kullanilanTercih: parseTurkishDecimal(parts[1 + yearIndex]),
                  bosBirakilanTercih: parseTurkishDecimal(parts[4 + yearIndex]),
                  ortalamaKullanilanTercih: parseTurkishDecimal(
                    parts[7 + yearIndex]
                  ),
                });
              }
            }
          }
        }

        // Parse 2025 data from data_2025 folder
        if (selectedYear === "2025" && tercihKullanmaResponse2.ok) {
          const text = await tercihKullanmaResponse2.text();
          const lines = text.trim().split("\n");
          for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(",");
            if (parts.length >= 4) {
              const yop_kodu = parts[0]?.trim();
              tercihKullanmaMap.set(yop_kodu, {
                kullanilanTercih: parseTurkishDecimal(parts[1]),
                bosBirakilanTercih: parseTurkishDecimal(parts[2]),
                ortalamaKullanilanTercih: parseTurkishDecimal(parts[3]),
              });
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

            // Get tercih istatistikleri data
            const tercihIstat = tercihIstatMap.get(program.yop_kodu) || {};
            const tercihKullanma =
              tercihKullanmaMap.get(program.yop_kodu) || {};

            // Calculate Üst Üç Çekim Farkı = ilk_uc_tercih_olarak_yerlesen_orani - ilk_uc_sirada_tercih_eden_orani
            let ustUcCekimFarki = null;
            if (
              tercihIstat.ilkUcTercihOlarakYerlesenOrani !== null &&
              tercihIstat.ilkUcSiradaTercihEdenOrani !== null
            ) {
              ustUcCekimFarki =
                tercihIstat.ilkUcTercihOlarakYerlesenOrani -
                tercihIstat.ilkUcSiradaTercihEdenOrani;
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
              // New tercih istatistikleri fields
              birKontenjanaTalip: tercihIstat.birKontenjanaTalip,
              ilkUcSiradaTercihEdenSayisi:
                tercihIstat.ilkUcSiradaTercihEdenSayisi,
              ilkUcSiradaTercihEdenOrani:
                tercihIstat.ilkUcSiradaTercihEdenOrani,
              ilkUcTercihOlarakYerlesenSayisi:
                tercihIstat.ilkUcTercihOlarakYerlesenSayisi,
              ilkUcTercihOlarakYerlesenOrani:
                tercihIstat.ilkUcTercihOlarakYerlesenOrani,
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
        // Tercih İstatistikleri
        row.birKontenjanaTalip !== null && row.birKontenjanaTalip !== undefined
          ? row.birKontenjanaTalip.toFixed(1)
          : "-",
        row.ilkUcSiradaTercihEdenSayisi !== null &&
        row.ilkUcSiradaTercihEdenSayisi !== undefined
          ? row.ilkUcSiradaTercihEdenSayisi
          : "-",
        row.ilkUcSiradaTercihEdenOrani !== null &&
        row.ilkUcSiradaTercihEdenOrani !== undefined
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
        row.ortalamaKullanilanTercih !== null &&
        row.ortalamaKullanilanTercih !== undefined
          ? row.ortalamaKullanilanTercih
          : "-",
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
                {/* Tercih İstatistikleri Columns */}
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "bir_kontenjana_talip"}
                    direction={
                      orderBy === "bir_kontenjana_talip" ? order : "asc"
                    }
                    onClick={() => handleSort("bir_kontenjana_talip")}
                  >
                    Bir Kont. Talip
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "ilk_uc_sirada_tercih_eden_sayisi"}
                    direction={
                      orderBy === "ilk_uc_sirada_tercih_eden_sayisi"
                        ? order
                        : "asc"
                    }
                    onClick={() =>
                      handleSort("ilk_uc_sirada_tercih_eden_sayisi")
                    }
                  >
                    İlk 3 Tercih Eden
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "ilk_uc_sirada_tercih_eden_orani"}
                    direction={
                      orderBy === "ilk_uc_sirada_tercih_eden_orani"
                        ? order
                        : "asc"
                    }
                    onClick={() =>
                      handleSort("ilk_uc_sirada_tercih_eden_orani")
                    }
                  >
                    İlk 3 Tercih Oranı (%)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "ilk_uc_tercih_olarak_yerlesen_sayisi"}
                    direction={
                      orderBy === "ilk_uc_tercih_olarak_yerlesen_sayisi"
                        ? order
                        : "asc"
                    }
                    onClick={() =>
                      handleSort("ilk_uc_tercih_olarak_yerlesen_sayisi")
                    }
                  >
                    İlk 3 Yerleşen
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "ilk_uc_tercih_olarak_yerlesen_orani"}
                    direction={
                      orderBy === "ilk_uc_tercih_olarak_yerlesen_orani"
                        ? order
                        : "asc"
                    }
                    onClick={() =>
                      handleSort("ilk_uc_tercih_olarak_yerlesen_orani")
                    }
                  >
                    İlk 3 Yerleşen Oranı (%)
                  </TableSortLabel>
                </TableCell>
                <Tooltip
                  title="İlk Üç Tercih Olarak Yerleşen Oranı - İlk Üç Sırada Tercih Eden Oranı"
                  arrow
                >
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "ust_uc_cekim_farki"}
                      direction={
                        orderBy === "ust_uc_cekim_farki" ? order : "asc"
                      }
                      onClick={() => handleSort("ust_uc_cekim_farki")}
                    >
                      Üst Üç Çekim Farkı
                    </TableSortLabel>
                  </TableCell>
                </Tooltip>
                {/* Tercih Kullanma Columns */}
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "kullanilan_tercih"}
                    direction={orderBy === "kullanilan_tercih" ? order : "asc"}
                    onClick={() => handleSort("kullanilan_tercih")}
                  >
                    Kullanılan Tercih
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "bos_birakilan_tercih"}
                    direction={
                      orderBy === "bos_birakilan_tercih" ? order : "asc"
                    }
                    onClick={() => handleSort("bos_birakilan_tercih")}
                  >
                    Boş Bırakılan Tercih
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "ortalama_kullanilan_tercih"}
                    direction={
                      orderBy === "ortalama_kullanilan_tercih" ? order : "asc"
                    }
                    onClick={() => handleSort("ortalama_kullanilan_tercih")}
                  >
                    Ort. Kullanılan Tercih
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
                  {/* Tercih İstatistikleri Data */}
                  <TableCell align="right">
                    <Typography variant="body2">
                      {row.birKontenjanaTalip !== null &&
                      row.birKontenjanaTalip !== undefined
                        ? row.birKontenjanaTalip.toFixed(1)
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {row.ilkUcSiradaTercihEdenSayisi !== null &&
                      row.ilkUcSiradaTercihEdenSayisi !== undefined
                        ? row.ilkUcSiradaTercihEdenSayisi
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {row.ilkUcSiradaTercihEdenOrani !== null &&
                      row.ilkUcSiradaTercihEdenOrani !== undefined
                        ? `${row.ilkUcSiradaTercihEdenOrani.toFixed(1)}%`
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {row.ilkUcTercihOlarakYerlesenSayisi !== null &&
                      row.ilkUcTercihOlarakYerlesenSayisi !== undefined
                        ? row.ilkUcTercihOlarakYerlesenSayisi
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {row.ilkUcTercihOlarakYerlesenOrani !== null &&
                      row.ilkUcTercihOlarakYerlesenOrani !== undefined
                        ? `${row.ilkUcTercihOlarakYerlesenOrani.toFixed(1)}%`
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {row.ustUcCekimFarki !== null &&
                    row.ustUcCekimFarki !== undefined ? (
                      <Chip
                        label={`${row.ustUcCekimFarki.toFixed(1)}%`}
                        size="small"
                        color={row.ustUcCekimFarki >= 0 ? "success" : "error"}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  {/* Tercih Kullanma Data */}
                  <TableCell align="right">
                    <Typography variant="body2">
                      {row.kullanilanTercih !== null &&
                      row.kullanilanTercih !== undefined
                        ? row.kullanilanTercih
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {row.bosBirakilanTercih !== null &&
                      row.bosBirakilanTercih !== undefined
                        ? row.bosBirakilanTercih
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {row.ortalamaKullanilanTercih !== null &&
                      row.ortalamaKullanilanTercih !== undefined
                        ? row.ortalamaKullanilanTercih
                        : "-"}
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
