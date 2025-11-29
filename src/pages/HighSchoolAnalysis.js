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
} from "@mui/material";
import { Download } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useBasket } from "../contexts/BasketContext";

// School type decoder
const decodeSchoolType = (schoolType) => {
  const type = parseInt(schoolType);
  return {
    isOzel: (type & 1) > 0,
    isFen: (type & 2) > 0,
    isAnadolu: (type & 4) > 0,
    isAcikOgretim: (type & 8) > 0,
  };
};

const getSchoolTypeLabel = (schoolType) => {
  const decoded = decodeSchoolType(schoolType);
  const labels = [];

  if (decoded.isOzel) labels.push("Özel");
  if (decoded.isFen) labels.push("Fen");
  if (decoded.isAnadolu) labels.push("Anadolu");
  if (decoded.isAcikOgretim) labels.push("Açık Öğretim");

  return labels.length > 0 ? labels.join(" + ") : "Diğer";
};

const HighSchoolAnalysis = () => {
  const { selectedPrograms, selectedYear } = useBasket();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liseMapping, setLiseMapping] = useState({});
  const [universityMapping, setUniversityMapping] = useState({});
  const [highSchoolData, setHighSchoolData] = useState([]);

  // Load lise mapping
  useEffect(() => {
    const loadLiseMapping = async () => {
      try {
        // Load from both folders
        const [response1, response2] = await Promise.all([
          fetch("/assets/data/lise_mapping.csv"),
          fetch("/assets/data_2025/lise_mapping.csv"),
        ]);

        if (!response1.ok && !response2.ok)
          throw new Error("Failed to load lise mapping");

        const mapping = {};

        // Process first file if available
        if (response1.ok) {
          const text1 = await response1.text();
          const lines1 = text1.trim().split("\n");
          for (let i = 1; i < lines1.length; i++) {
            const parts = lines1[i].split(",");
            if (parts.length >= 3) {
              const lise_id = parts[2];
              const lise_adi = parts[0];
              const sehir = parts[1];
              mapping[lise_id] = { lise_adi, sehir };
            }
          }
        }

        // Process second file if available (2025 data may have additional schools)
        if (response2.ok) {
          const text2 = await response2.text();
          const lines2 = text2.trim().split("\n");
          for (let i = 1; i < lines2.length; i++) {
            const parts = lines2[i].split(",");
            if (parts.length >= 3) {
              const lise_id = parts[2];
              const lise_adi = parts[0];
              const sehir = parts[1];
              // Don't overwrite if already exists from first file
              if (!mapping[lise_id]) {
                mapping[lise_id] = { lise_adi, sehir };
              }
            }
          }
        }

        setLiseMapping(mapping);
      } catch (err) {
        console.error("Error loading lise mapping:", err);
        setError("Lise haritası yüklenemedi");
      }
    };

    loadLiseMapping();
  }, []);

  // Load university mapping
  useEffect(() => {
    const loadUniversityMapping = async () => {
      try {
        const dataFolder =
          selectedYear === "2025" ? "/assets/data_2025" : "/assets/data";
        const response = await fetch(
          `${dataFolder}/lise_by_university/_university_mapping.json`
        );

        if (response.ok) {
          const mapping = await response.json();
          setUniversityMapping(mapping);
        }
      } catch (err) {
        console.error("Error loading university mapping:", err);
      }
    };

    if (selectedYear) {
      loadUniversityMapping();
    }
  }, [selectedYear]);

  // Load high school data for selected programs
  useEffect(() => {
    const loadHighSchoolData = async () => {
      if (selectedPrograms.length === 0) {
        setLoading(false);
        return;
      }

      if (
        Object.keys(liseMapping).length === 0 ||
        Object.keys(universityMapping).length === 0
      ) {
        return; // Wait for mappings to load
      }

      try {
        setLoading(true);
        setError(null);

        const dataFolder =
          selectedYear === "2025" ? "/assets/data_2025" : "/assets/data";

        console.log("[HighSchoolAnalysis] Selected year:", selectedYear);
        console.log(
          "[HighSchoolAnalysis] Selected programs:",
          selectedPrograms.length
        );

        // Get unique universities from selected programs
        const universities = [
          ...new Set(selectedPrograms.map((p) => p.university)),
        ];
        console.log(
          "[HighSchoolAnalysis] Unique universities:",
          universities.length,
          universities
        );

        // Create program map
        const programMap = new Map();
        selectedPrograms.forEach((p) => {
          programMap.set(p.yop_kodu, p);
        });

        // Create Set for fast yop_kodu lookup
        const programSet = new Set(selectedPrograms.map((p) => p.yop_kodu));
        const selectedYearStr = String(selectedYear);

        const allData = [];
        let totalMatched = 0;

        // Load CSV file for each university
        for (const university of universities) {
          const sanitizedName = universityMapping[university];
          if (!sanitizedName) {
            console.warn(`No mapping found for university: ${university}`);
            continue;
          }

          const csvPath = `${dataFolder}/lise_by_university/${sanitizedName}.csv`;
          console.log(`Loading ${csvPath}...`);

          try {
            const response = await fetch(csvPath);
            if (!response.ok) {
              console.warn(`File not found: ${csvPath}`);
              continue;
            }

            const text = await response.text();
            const lines = text.trim().split("\n");

            console.log(`  ${sanitizedName}: ${lines.length} lines`);

            // Skip header
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i];
              if (!line) continue;

              const firstComma = line.indexOf(",");
              if (firstComma === -1) continue;

              const yop_kodu = line.substring(0, firstComma);

              // Fast rejection
              if (!programSet.has(yop_kodu)) continue;

              const parts = line.split(",");
              if (parts.length >= 5) {
                const year = parts[1];

                if (year === selectedYearStr) {
                  totalMatched++;
                  const lise_id = parts[2];
                  const yerlesen_sayisi = parseInt(parts[3]);
                  const school_type = parts[4];

                  const liseInfo = liseMapping[lise_id] || {
                    lise_adi: `Lise ID: ${lise_id}`,
                    sehir: "Bilinmiyor",
                  };

                  const program = programMap.get(yop_kodu);

                  allData.push({
                    yop_kodu,
                    university: program?.university || "",
                    program: program?.program || program?.department || "",
                    city: program?.city || "",
                    year,
                    lise_id,
                    lise_adi: liseInfo.lise_adi,
                    lise_sehir: liseInfo.sehir,
                    yerlesen_sayisi,
                    school_type,
                    school_type_label: getSchoolTypeLabel(school_type),
                  });
                }
              }
            }
          } catch (fileErr) {
            console.error(`Error loading ${csvPath}:`, fileErr);
          }
        }

        console.log(
          "[HighSchoolAnalysis] Total matched records:",
          totalMatched
        );
        console.log("[HighSchoolAnalysis] Data rows:", allData.length);

        setHighSchoolData(allData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading high school data:", err);
        setError("Lise verileri yüklenirken hata oluştu");
        setLoading(false);
      }
    };

    loadHighSchoolData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPrograms, selectedYear, liseMapping, universityMapping]);

  // Download as CSV
  const handleDownload = () => {
    const headers = [
      "Üniversite",
      "Program",
      "Şehir",
      "Yıl",
      "Lise Adı",
      "Lise Şehir",
      "Yerleşen Sayısı",
      "Lise Türü",
    ];

    const rows = highSchoolData.map((row) => [
      row.university,
      row.program,
      row.city,
      row.year,
      row.lise_adi,
      row.lise_sehir,
      row.yerlesen_sayisi,
      row.school_type_label,
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
    link.download = `lise_analizi_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  if (selectedPrograms.length === 0) {
    return (
      <>
        <Header title="Lise Analizi" />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="info">
            <Typography>
              Lise analizi için önce program seçmeniz gerekiyor.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate("/university-comparison")}
              sx={{ mt: 2 }}
            >
              Program Karşılaştırmaya Dön
            </Button>
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header title="Lise Analizi" />
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
            <Chip
              label={`${selectedPrograms.length} program`}
              color="primary"
              sx={{ mr: 2 }}
            />
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownload}
              disabled={loading || highSchoolData.length === 0}
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
                label={`${program.university} - ${
                  program.program || program.department
                }`}
                size="small"
              />
            ))}
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Lise verileri yükleniyor...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Yerleşen Öğrencilerin Liseleri - {selectedYear} (
              {highSchoolData.length} kayıt)
            </Typography>

            <TableContainer sx={{ maxHeight: 600, mt: 2 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Üniversite</TableCell>
                    <TableCell>Program</TableCell>
                    <TableCell>Şehir</TableCell>
                    <TableCell>Yıl</TableCell>
                    <TableCell>Lise Adı</TableCell>
                    <TableCell>Lise Şehir</TableCell>
                    <TableCell align="right">Yerleşen</TableCell>
                    <TableCell>Lise Türü</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {highSchoolData.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{row.university}</TableCell>
                      <TableCell>{row.program}</TableCell>
                      <TableCell>{row.city}</TableCell>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>{row.lise_adi}</TableCell>
                      <TableCell>{row.lise_sehir}</TableCell>
                      <TableCell align="right">{row.yerlesen_sayisi}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.school_type_label}
                          size="small"
                          variant="outlined"
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

export default HighSchoolAnalysis;
