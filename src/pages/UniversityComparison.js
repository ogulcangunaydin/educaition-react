import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import Header from "../components/Header";
import YearSelector from "../components/UniversityComparison/YearSelector";
import ProgramSelector from "../components/UniversityComparison/ProgramSelector";
import MetricSelector from "../components/UniversityComparison/MetricSelector";
import BufferSlider from "../components/UniversityComparison/BufferSlider";
import ComparisonChart from "../components/UniversityComparison/ComparisonChart";
import DepartmentList from "../components/UniversityComparison/DepartmentList";
import { parseCSV } from "../utils/csvParser";
import {
  getHalicProgramsForYear,
  findSimilarPrograms,
  prepareChartData,
} from "../utils/dataFilters";

const UniversityComparison = () => {
  // State for CSV data
  const [halicData, setHalicData] = useState([]);
  const [allUniversitiesData, setAllUniversitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for selections
  const [year, setYear] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [metric, setMetric] = useState("ranking");
  const [buffer, setBuffer] = useState(10);

  // State for computed data
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [similarPrograms, setSimilarPrograms] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Load CSV data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load both CSV files
        const [halicResponse, allUniversitiesResponse] = await Promise.all([
          fetch("/assets/data/halic_programs.csv"),
          fetch("/assets/data/all_universities_programs_master.csv"),
        ]);

        if (!halicResponse.ok || !allUniversitiesResponse.ok) {
          throw new Error("Failed to load CSV files");
        }

        const [halicText, allUniversitiesText] = await Promise.all([
          halicResponse.text(),
          allUniversitiesResponse.text(),
        ]);

        const halicParsed = parseCSV(halicText);
        const allUniversitiesParsed = parseCSV(allUniversitiesText);

        setHalicData(halicParsed);
        setAllUniversitiesData(allUniversitiesParsed);
        setLoading(false);
      } catch (err) {
        console.error("Error loading CSV files:", err);
        setError(
          "CSV dosyaları yüklenirken hata oluştu. Lütfen sayfayı yenileyin."
        );
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update available programs when year changes
  useEffect(() => {
    if (year && halicData.length > 0) {
      const programs = getHalicProgramsForYear(halicData, year);
      setAvailablePrograms(programs);
      setSelectedProgram(null); // Reset program selection
    } else {
      setAvailablePrograms([]);
    }
  }, [year, halicData]);

  // Update similar programs when selections change
  useEffect(() => {
    if (selectedProgram && year && metric && allUniversitiesData.length > 0) {
      const similar = findSimilarPrograms(
        allUniversitiesData,
        selectedProgram,
        year,
        metric,
        buffer
      );
      setSimilarPrograms(similar);

      // Prepare chart data
      const chart = prepareChartData(similar, year, metric);
      setChartData(chart);
    } else {
      setSimilarPrograms([]);
      setChartData(null);
    }
  }, [selectedProgram, year, metric, buffer, allUniversitiesData]);

  // Handle year change
  const handleYearChange = (newYear) => {
    setYear(newYear);
  };

  // Handle program change
  const handleProgramChange = (program) => {
    setSelectedProgram(program);
  };

  // Handle metric change
  const handleMetricChange = (newMetric) => {
    setMetric(newMetric);
  };

  // Handle buffer change
  const handleBufferChange = (newBuffer) => {
    setBuffer(newBuffer);
  };

  if (loading) {
    return (
      <>
        <Header title="Üniversite Karşılaştırma" />
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

  if (error) {
    return (
      <>
        <Header title="Üniversite Karşılaştırma" />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header title="Üniversite Karşılaştırma" />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, marginTop: "70px" }}>
        {/* Instructions */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            bgcolor: "primary.light",
            color: "primary.contrastText",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Nasıl Kullanılır?
          </Typography>
          <Typography variant="body2" paragraph>
            1. Önce bir yıl seçin (2022, 2023 veya 2024)
          </Typography>
          <Typography variant="body2" paragraph>
            2. Haliç Üniversitesi'nden karşılaştırmak istediğiniz programı seçin
          </Typography>
          <Typography variant="body2" paragraph>
            3. Karşılaştırma kriterini seçin (Başarı Sıralaması veya Puan)
          </Typography>
          <Typography variant="body2">
            4. Buffer (tolerans) değerini ayarlayın - Bu değer, karşılaştırma
            aralığını ne kadar genişleteceğinizi belirler
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {/* Left Panel - Selectors */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Filtreler
              </Typography>

              <YearSelector value={year} onChange={handleYearChange} />

              <ProgramSelector
                programs={availablePrograms}
                value={selectedProgram?.yop_kodu || ""}
                onChange={handleProgramChange}
                disabled={!year}
              />

              <MetricSelector
                value={metric}
                onChange={handleMetricChange}
                disabled={!selectedProgram}
              />

              <BufferSlider
                value={buffer}
                onChange={handleBufferChange}
                disabled={!selectedProgram}
              />

              {selectedProgram && (
                <Box
                  sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Seçilen Program Bilgileri:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fakülte:</strong> {selectedProgram.faculty}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Puan Türü:</strong>{" "}
                    {selectedProgram.puan_type.toUpperCase()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Min Puan:</strong>{" "}
                    {selectedProgram[`taban_${year}`]?.toFixed(2) || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Max Puan:</strong>{" "}
                    {selectedProgram[`tavan_${year}`]?.toFixed(2) || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Min Sıralama:</strong>{" "}
                    {selectedProgram[`tbs_${year}`]?.toFixed(0) || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Max Sıralama:</strong>{" "}
                    {selectedProgram[`tavan_bs_${year}`]?.toFixed(0) || "-"}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Panel - Results */}
          <Grid item xs={12} md={8}>
            <ComparisonChart
              chartData={chartData}
              selectedProgram={selectedProgram}
              year={year}
              metric={metric}
            />

            <DepartmentList
              programs={similarPrograms}
              year={year}
              metric={metric}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default UniversityComparison;
