import React, { useState, useEffect, useCallback } from "react";
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
  TablePagination,
  Chip,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import Header from "@organisms/Header";
import { useBasket } from "@contexts/BasketContext";
import { fetchPlacementsByPrograms } from "@services/liseService";

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

const PAGE_SIZE = 100;

const HighSchoolAnalysis = () => {
  const { selectedPrograms, selectedYear } = useBasket();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highSchoolData, setHighSchoolData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [downloading, setDownloading] = useState(false);

  // Program map for enriching data
  const programMap = useCallback(() => {
    const map = new Map();
    selectedPrograms.forEach((p) => {
      map.set(p.yop_kodu, p);
    });
    return map;
  }, [selectedPrograms]);

  // Enrich API items with program info
  const enrichItems = useCallback(
    (items) => {
      const map = programMap();
      return items.map((item) => {
        const program = map.get(item.yop_kodu);
        return {
          ...item,
          university: program?.university || "",
          program: program?.program || program?.department || "",
          city: program?.city || "",
          school_type_label: getSchoolTypeLabel(item.school_type),
        };
      });
    },
    [programMap]
  );

  // Load a page of high school data
  const loadPage = useCallback(
    async (pageNum, pageSize) => {
      if (selectedPrograms.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const yopKodlari = selectedPrograms.map((p) => p.yop_kodu);
        const year = selectedYear ? parseInt(selectedYear) : null;
        const skip = pageNum * pageSize;

        const response = await fetchPlacementsByPrograms(yopKodlari, year, {
          skip,
          limit: pageSize,
        });

        setHighSchoolData(enrichItems(response.items));
        setTotal(response.total);
      } catch (err) {
        console.error("Error loading high school data:", err);
        setError("Lise verileri yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    },
    [selectedPrograms, selectedYear, enrichItems]
  );

  // Initial load and page changes
  useEffect(() => {
    loadPage(page, rowsPerPage);
  }, [page, rowsPerPage, loadPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Download ALL data as CSV (fetches all pages)
  const handleDownload = async () => {
    try {
      setDownloading(true);
      const yopKodlari = selectedPrograms.map((p) => p.yop_kodu);
      const year = selectedYear ? parseInt(selectedYear) : null;

      // Fetch all data for export
      const response = await fetchPlacementsByPrograms(yopKodlari, year, {
        skip: 0,
        limit: 100000,
      });
      const allData = enrichItems(response.items);
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

      const rows = allData.map((row) => [
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
    } catch (err) {
      console.error("Error downloading CSV:", err);
    } finally {
      setDownloading(false);
    }
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
            {total > 0 && (
              <Chip label={`${total} toplam kayıt`} variant="outlined" sx={{ mr: 2 }} />
            )}
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownload}
              disabled={loading || downloading || total === 0}
            >
              {downloading ? "İndiriliyor..." : "CSV İndir"}
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
              Yerleşen Öğrencilerin Liseleri - {selectedYear} ({total} kayıt)
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

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[50, 100, 250, 500]}
              labelRowsPerPage="Sayfa başına:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} / ${count !== -1 ? count : `${to}+`}`
              }
            />
          </Paper>
        )}
      </Container>
    </>
  );
};

export default HighSchoolAnalysis;
