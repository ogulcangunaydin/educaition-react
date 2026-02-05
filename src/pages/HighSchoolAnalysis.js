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
import Header from "../components/Header";
import { useBasket } from "../contexts/BasketContext";
import { fetchPlacementsByPrograms } from "../services/liseService";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highSchoolData, setHighSchoolData] = useState([]);

  // Load high school data for selected programs from API
  useEffect(() => {
    const loadHighSchoolData = async () => {
      if (selectedPrograms.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("[HighSchoolAnalysis] Selected year:", selectedYear);
        console.log("[HighSchoolAnalysis] Selected programs:", selectedPrograms.length);

        // Get YOP codes from selected programs
        const yopKodlari = selectedPrograms.map((p) => p.yop_kodu);

        // Create program map for enriching data
        const programMap = new Map();
        selectedPrograms.forEach((p) => {
          programMap.set(p.yop_kodu, p);
        });

        // Fetch placements from API
        const year = selectedYear ? parseInt(selectedYear) : null;
        const response = await fetchPlacementsByPrograms(yopKodlari, year, { limit: 100000 });

        console.log("[HighSchoolAnalysis] API response:", response.total, "total records");

        // Enrich with program info and add school type labels
        const enrichedData = response.items.map((item) => {
          const program = programMap.get(item.yop_kodu);
          return {
            ...item,
            university: program?.university || "",
            program: program?.program || program?.department || "",
            city: program?.city || "",
            school_type_label: getSchoolTypeLabel(item.school_type),
          };
        });

        console.log("[HighSchoolAnalysis] Enriched data rows:", enrichedData.length);

        setHighSchoolData(enrichedData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading high school data:", err);
        setError("Lise verileri yüklenirken hata oluştu");
        setLoading(false);
      }
    };

    loadHighSchoolData();
  }, [selectedPrograms, selectedYear]);

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
    link.download = `lise_analizi_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (selectedPrograms.length === 0) {
    return (
      <>
        <Header title="Lise Analizi" />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="info">
            <Typography>Lise analizi için önce program seçmeniz gerekiyor.</Typography>
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
            <Chip label={`${selectedPrograms.length} program`} color="primary" sx={{ mr: 2 }} />
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
            <Typography sx={{ ml: 2 }}>Lise verileri yükleniyor...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Yerleşen Öğrencilerin Liseleri - {selectedYear} ({highSchoolData.length} kayıt)
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
                        <Chip label={row.school_type_label} size="small" variant="outlined" />
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
