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
import { Download, ArrowBack } from "@mui/icons-material";
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
  const [highSchoolData, setHighSchoolData] = useState([]);

  // Load lise mapping
  useEffect(() => {
    const loadLiseMapping = async () => {
      try {
        const response = await fetch("/assets/data/lise_mapping.csv");
        if (!response.ok) throw new Error("Failed to load lise mapping");

        const text = await response.text();
        const lines = text.trim().split("\n");
        const mapping = {};

        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(",");
          if (parts.length >= 3) {
            const lise_id = parts[2];
            const lise_adi = parts[0];
            const sehir = parts[1];
            mapping[lise_id] = { lise_adi, sehir };
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

  // Load high school data for selected programs
  useEffect(() => {
    const loadHighSchoolData = async () => {
      if (selectedPrograms.length === 0) {
        setLoading(false);
        return;
      }

      if (Object.keys(liseMapping).length === 0) {
        return; // Wait for mapping to load
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/assets/data/all_universities_lise_bazinda_yerlesen.csv"
        );
        if (!response.ok) throw new Error("Failed to load high school data");

        const text = await response.text();
        const lines = text.trim().split("\n");

        // Get program codes
        const programCodes = new Set(selectedPrograms.map((p) => p.yop_kodu));

        // Parse and filter data
        const data = [];

        // Process in chunks to avoid blocking
        const chunkSize = 10000;
        for (let i = 1; i < lines.length; i += chunkSize) {
          const chunk = lines.slice(i, Math.min(i + chunkSize, lines.length));

          for (const line of chunk) {
            const parts = line.split(",");
            if (parts.length >= 5) {
              const yop_kodu = parts[0];
              const year = parts[1];

              // Filter by selected year
              if (programCodes.has(yop_kodu) && year === String(selectedYear)) {
                const lise_id = parts[2];
                const yerlesen_sayisi = parseInt(parts[3]);
                const school_type = parts[4];

                const liseInfo = liseMapping[lise_id] || {
                  lise_adi: `Lise ID: ${lise_id}`,
                  sehir: "Bilinmiyor",
                };

                const program = selectedPrograms.find(
                  (p) => p.yop_kodu === yop_kodu
                );

                data.push({
                  yop_kodu,
                  university: program?.university || "",
                  program: program?.program || program?.department || "",
                  city: program?.city || "",
                  year: parts[1],
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

          // Allow UI to update
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        setHighSchoolData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading high school data:", err);
        setError("Lise verileri yüklenirken hata oluştu");
        setLoading(false);
      }
    };

    loadHighSchoolData();
  }, [selectedPrograms, liseMapping, selectedYear]);

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
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/university-comparison")}
          >
            Geri Dön
          </Button>
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
