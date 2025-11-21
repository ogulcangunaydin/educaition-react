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
import RecordLimitSlider from "../components/UniversityComparison/RecordLimitSlider";
import UniversityTypeSelector from "../components/UniversityComparison/UniversityTypeSelector";
import TopCitiesSlider from "../components/UniversityComparison/TopCitiesSlider";
import MinUniversityCountSlider from "../components/UniversityComparison/MinUniversityCountSlider";
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
  const [cityPreferencesData, setCityPreferencesData] = useState([]);
  const [universityPreferencesData, setUniversityPreferencesData] = useState(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for selections
  const [year, setYear] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [metric, setMetric] = useState("ranking");
  const [buffer, setBuffer] = useState(0);
  const [recordLimit, setRecordLimit] = useState(10);
  const [universityType, setUniversityType] = useState("Vakıf");
  const [topCitiesLimit, setTopCitiesLimit] = useState(3);
  const [minUniversityCount, setMinUniversityCount] = useState(3);

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

        // Load CSV files
        const [
          halicResponse,
          allUniversitiesResponse,
          cityPrefsResponse,
          uniPrefsResponse,
        ] = await Promise.all([
          fetch("/assets/data/halic_programs.csv"),
          fetch("/assets/data/all_universities_programs_master.csv"),
          fetch("/assets/data/halic_tercih_edilen_iller.csv"),
          fetch("/assets/data/halic_tercih_edilen_universiteler.csv"),
        ]);

        if (
          !halicResponse.ok ||
          !allUniversitiesResponse.ok ||
          !cityPrefsResponse.ok ||
          !uniPrefsResponse.ok
        ) {
          throw new Error("Failed to load CSV files");
        }

        const [halicText, allUniversitiesText, cityPrefsText, uniPrefsText] =
          await Promise.all([
            halicResponse.text(),
            allUniversitiesResponse.text(),
            cityPrefsResponse.text(),
            uniPrefsResponse.text(),
          ]);

        const halicParsed = parseCSV(halicText);
        const allUniversitiesParsed = parseCSV(allUniversitiesText);

        // Parse city preferences CSV (simple format, not using parseCSV)
        const cityPrefsLines = cityPrefsText.trim().split("\n");
        const cityPrefsData = [];
        for (let i = 1; i < cityPrefsLines.length; i++) {
          const [yop_kodu, year, il, tercih_sayisi] =
            cityPrefsLines[i].split(",");
          cityPrefsData.push({
            yop_kodu,
            year,
            il,
            tercih_sayisi: parseInt(tercih_sayisi),
          });
        }

        // Parse university preferences CSV
        const uniPrefsLines = uniPrefsText.trim().split("\n");
        const uniPrefsData = [];
        for (let i = 1; i < uniPrefsLines.length; i++) {
          const [yop_kodu, year, universite, tercih_sayisi, university_type] =
            uniPrefsLines[i].split(",");
          uniPrefsData.push({
            yop_kodu,
            year,
            universite,
            tercih_sayisi: parseInt(tercih_sayisi),
            university_type,
          });
        }

        setHalicData(halicParsed);
        setAllUniversitiesData(allUniversitiesParsed);
        setCityPreferencesData(cityPrefsData);
        setUniversityPreferencesData(uniPrefsData);
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

      // Filter by university type
      const filteredByType = similar.filter(
        (p) => universityType === "all" || p.university_type === universityType
      );

      // Filter by top cities if limit is set
      let filteredByCity = filteredByType;
      if (topCitiesLimit > 0 && cityPreferencesData.length > 0) {
        // Calculate total preferences per city
        const cityTotals = {};
        cityPreferencesData.forEach((row) => {
          const city = row.il;
          cityTotals[city] = (cityTotals[city] || 0) + row.tercih_sayisi;
        });

        // Get top N cities
        const topCities = Object.entries(cityTotals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, topCitiesLimit)
          .map(([city]) => city);

        // Filter programs by top cities (always include Haliç program)
        filteredByCity = filteredByType.filter(
          (p) =>
            p.yop_kodu === selectedProgram.yop_kodu ||
            topCities.includes(p.city)
        );
      }

      // Filter by minimum university count (exclude HALİÇ from count check)
      let filteredByUniversityCount = filteredByCity;
      if (minUniversityCount > 0 && universityPreferencesData.length > 0) {
        // Calculate total preferences per university for THIS specific Haliç program only
        const universityTotals = {};
        universityPreferencesData.forEach((row) => {
          // Only count preferences for the selected Haliç program
          if (row.yop_kodu === selectedProgram.yop_kodu) {
            const uni = row.universite;
            if (uni !== "HALİÇ ÜNİVERSİTESİ") {
              universityTotals[uni] =
                (universityTotals[uni] || 0) + row.tercih_sayisi;
            }
          }
        });

        // Filter programs by university count (always include selected Haliç program)
        filteredByUniversityCount = filteredByCity.filter(
          (p) =>
            p.yop_kodu === selectedProgram.yop_kodu ||
            (universityTotals[p.university] || 0) >= minUniversityCount
        );
      }

      // Ensure selected program is always included and first
      const similarWithoutSelected = filteredByUniversityCount.filter(
        (p) => p.yop_kodu !== selectedProgram.yop_kodu
      );
      const allPrograms = [selectedProgram, ...similarWithoutSelected];

      setSimilarPrograms(allPrograms);

      // Limit programs for chart based on recordLimit
      // Always include the selected program as first, then limit the rest
      const limitedForChart =
        recordLimit >= 200
          ? allPrograms
          : [
              selectedProgram,
              ...similarWithoutSelected.slice(0, recordLimit - 1),
            ];

      // Prepare chart data
      const chart = prepareChartData(limitedForChart, year, metric);
      setChartData(chart);
    } else {
      setSimilarPrograms([]);
      setChartData(null);
    }
  }, [
    selectedProgram,
    year,
    metric,
    buffer,
    recordLimit,
    universityType,
    topCitiesLimit,
    minUniversityCount,
    allUniversitiesData,
    cityPreferencesData,
    universityPreferencesData,
  ]);

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

  // Handle record limit change
  const handleRecordLimitChange = (newLimit) => {
    setRecordLimit(newLimit);
  };

  // Handle university type change
  const handleUniversityTypeChange = (newType) => {
    setUniversityType(newType);
  };

  // Handle top cities limit change
  const handleTopCitiesChange = (newLimit) => {
    setTopCitiesLimit(newLimit);
  };

  // Handle minimum university count change
  const handleMinUniversityCountChange = (newCount) => {
    setMinUniversityCount(newCount);
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
          <Typography variant="body2" paragraph>
            4. Buffer (tolerans) değerini ayarlayın - Bu değer, karşılaştırma
            aralığını ne kadar genişleteceğinizi belirler
          </Typography>
          <Typography variant="body2">
            5. Grafikte gösterilecek departman sayısını ayarlayın (liste tüm
            sonuçları gösterir)
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

              <UniversityTypeSelector
                universityType={universityType}
                onChange={handleUniversityTypeChange}
                disabled={!selectedProgram}
              />

              <TopCitiesSlider
                value={topCitiesLimit}
                onChange={handleTopCitiesChange}
                disabled={!selectedProgram}
              />

              <MinUniversityCountSlider
                value={minUniversityCount}
                onChange={handleMinUniversityCountChange}
                disabled={!selectedProgram}
              />

              <BufferSlider
                value={buffer}
                onChange={handleBufferChange}
                disabled={!selectedProgram}
              />

              <RecordLimitSlider
                value={recordLimit}
                onChange={handleRecordLimitChange}
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
                  {topCitiesLimit > 0 && cityPreferencesData.length > 0 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Dahil Edilen Şehirler:</strong>{" "}
                      {(() => {
                        const cityTotals = {};
                        cityPreferencesData.forEach((row) => {
                          const city = row.il;
                          cityTotals[city] =
                            (cityTotals[city] || 0) + row.tercih_sayisi;
                        });
                        const topCities = Object.entries(cityTotals)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, topCitiesLimit)
                          .map(([city]) => city);
                        return topCities.join(", ");
                      })()}
                    </Typography>
                  )}
                  {minUniversityCount > 0 &&
                    universityPreferencesData.length > 0 && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>
                          Bu Programa Başvuranların Tercih Ettiği Üniversiteler
                          (Min {minUniversityCount} tercih):
                        </strong>{" "}
                        {(() => {
                          const universityTotals = {};
                          // Only count preferences for THIS specific program
                          universityPreferencesData.forEach((row) => {
                            if (row.yop_kodu === selectedProgram.yop_kodu) {
                              const uni = row.universite;
                              if (uni !== "HALİÇ ÜNİVERSİTESİ") {
                                universityTotals[uni] =
                                  (universityTotals[uni] || 0) +
                                  row.tercih_sayisi;
                              }
                            }
                          });
                          const filteredUniversities = Object.entries(
                            universityTotals
                          )
                            .filter(([_, count]) => count >= minUniversityCount)
                            .sort((a, b) => b[1] - a[1])
                            .map(([uni, count]) => `${uni} (${count})`);
                          return filteredUniversities.length > 0
                            ? filteredUniversities.join(", ")
                            : "Hiçbiri";
                        })()}
                      </Typography>
                    )}
                  {metric === "score" ? (
                    <>
                      <Typography variant="body2">
                        <strong>Min Puan:</strong>{" "}
                        {selectedProgram[`taban_${year}`]
                          ? selectedProgram[`taban_${year}`].toLocaleString(
                              "tr-TR",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Max Puan:</strong>{" "}
                        {selectedProgram[`tavan_${year}`]
                          ? selectedProgram[`tavan_${year}`].toLocaleString(
                              "tr-TR",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2">
                        <strong>Min Sıralama:</strong>{" "}
                        {selectedProgram[`tbs_${year}`]
                          ? Math.round(
                              selectedProgram[`tbs_${year}`]
                            ).toLocaleString("tr-TR")
                          : "-"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Max Sıralama:</strong>{" "}
                        {selectedProgram[`tavan_bs_${year}`]
                          ? Math.round(
                              selectedProgram[`tavan_bs_${year}`]
                            ).toLocaleString("tr-TR")
                          : "-"}
                      </Typography>
                    </>
                  )}
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
              totalPrograms={similarPrograms.length}
            />

            <DepartmentList
              programs={chartData?.sortedPrograms || similarPrograms}
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
