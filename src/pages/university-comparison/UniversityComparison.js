import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  styled,
} from "@mui/material";
import Header from "@organisms/Header";
import YearSelector from "./components/YearSelector";
import ProgramSelector from "./components/ProgramSelector";
import MetricSelector from "./components/MetricSelector";
import UniversityTypeSelector from "./components/UniversityTypeSelector";
import FilterSlider from "./components/FilterSlider";
import ComparisonChart from "./components/ComparisonChart";
import DepartmentList from "./components/DepartmentList";
import InstructionsPanel from "./components/InstructionsPanel";
import { fetchOwnPrograms, comparePrograms } from "@services/universityComparisonService";
import { useBasket } from "@contexts/BasketContext";
import { useUniversity } from "@contexts/UniversityContext";
import { prepareChartData } from "@utils/dataFilters";

// ─── Styled wrappers ────────────────────────────────────────────

const PageContainer = styled(Box)(({ logourl }) => ({
  position: "relative",
  minHeight: "100vh",
  "&::before": {
    content: '""',
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "600px",
    backgroundImage: `url(${logourl || "/halic_universitesi_logo.svg"})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
    opacity: 0.03,
    zIndex: 0,
    pointerEvents: "none",
  },
}));

const ContentWrapper = styled(Box)({
  position: "relative",
  zIndex: 1,
});

// ─── Debounce delay (ms) for the compare call ──────────────────

const COMPARE_DEBOUNCE = 300;

// ─── Component ──────────────────────────────────────────────────

const UniversityComparison = () => {
  const { clearBasket } = useBasket();
  const { university } = useUniversity();
  const previousProgramRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // ── Selection state ─────────────────────────────────────────
  const [year, setYear] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [metric, setMetric] = useState("ranking");
  const [recordLimit, setRecordLimit] = useState(10);
  const [universityType, setUniversityType] = useState("Vakıf");
  const [chartSortBy, setChartSortBy] = useState("spread");
  const [customRangeMin, setCustomRangeMin] = useState(null);
  const [customRangeMax, setCustomRangeMax] = useState(null);

  // Preference-based filter sliders
  const [topCitiesLimit, setTopCitiesLimit] = useState(0);
  const [topCitiesReversed, setTopCitiesReversed] = useState(false);
  const [minUniversityCount, setMinUniversityCount] = useState(0);
  const [universityCountReversed, setUniversityCountReversed] = useState(false);
  const [minProgramCount, setMinProgramCount] = useState(0);
  const [programCountReversed, setProgramCountReversed] = useState(false);
  const [minFulfillmentRate, setMinFulfillmentRate] = useState(0);
  const [fulfillmentRateReversed, setFulfillmentRateReversed] = useState(false);

  // Manual exclusion sets
  const [excludedCities, setExcludedCities] = useState(new Set());
  const [excludedUniversities, setExcludedUniversities] = useState(new Set());
  const [excludedPrograms, setExcludedPrograms] = useState(new Set());
  const [excludedScholarships, setExcludedScholarships] = useState(new Set());

  // ── Derived / API-driven state ──────────────────────────────
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [similarPrograms, setSimilarPrograms] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [frequencyData, setFrequencyData] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [scholarshipCounts, setScholarshipCounts] = useState({});
  const [totalBeforeLimit, setTotalBeforeLimit] = useState(0);

  // ── Loading / error state ───────────────────────────────────
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);

  // ── One-time effects ────────────────────────────────────────

  useEffect(() => {
    clearBasket();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch own programs when year changes ────────────────────

  useEffect(() => {
    if (!year) {
      setAvailablePrograms([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        setLoadingPrograms(true);
        setError(null);
        const programs = await fetchOwnPrograms(university.name, year);
        if (!cancelled) {
          setAvailablePrograms(programs);
          setSelectedProgram(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading programs:", err);
          setError("Program listesi yüklenirken hata oluştu.");
        }
      } finally {
        if (!cancelled) setLoadingPrograms(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [year, university.name]);

  // ── Clear basket on program change ──────────────────────────

  useEffect(() => {
    if (
      selectedProgram &&
      previousProgramRef.current !== null &&
      previousProgramRef.current !== selectedProgram?.yop_kodu
    ) {
      clearBasket();
    }
    previousProgramRef.current = selectedProgram?.yop_kodu || null;
  }, [selectedProgram, clearBasket]);

  // ── Reset custom range on program / metric change ───────────

  useEffect(() => {
    setCustomRangeMin(null);
    setCustomRangeMax(null);
  }, [selectedProgram, metric]);

  // ── Reset exclusions on program change ──────────────────────

  useEffect(() => {
    setExcludedCities(new Set());
    setExcludedUniversities(new Set());
    setExcludedPrograms(new Set());
    setExcludedScholarships(new Set());
  }, [selectedProgram]);

  // ── Build the compare request body ──────────────────────────

  const buildCompareRequest = useCallback(() => {
    if (!selectedProgram || !year) return null;
    return {
      yop_kodu: selectedProgram.yop_kodu,
      year,
      metric,
      university_type: universityType,
      source_university: university.dataPrefix,
      own_university_name: university.name,
      record_limit: recordLimit,
      sort_by: chartSortBy,
      custom_range_min: customRangeMin,
      custom_range_max: customRangeMax,
      top_cities_limit: topCitiesLimit,
      top_cities_reversed: topCitiesReversed,
      min_university_count: minUniversityCount,
      university_count_reversed: universityCountReversed,
      min_program_count: minProgramCount,
      program_count_reversed: programCountReversed,
      min_fulfillment_rate: minFulfillmentRate,
      fulfillment_rate_reversed: fulfillmentRateReversed,
      excluded_cities: [...excludedCities],
      excluded_universities: [...excludedUniversities],
      excluded_programs: [...excludedPrograms],
      excluded_scholarships: [...excludedScholarships],
    };
  }, [
    selectedProgram,
    year,
    metric,
    universityType,
    university.dataPrefix,
    university.name,
    recordLimit,
    chartSortBy,
    customRangeMin,
    customRangeMax,
    topCitiesLimit,
    topCitiesReversed,
    minUniversityCount,
    universityCountReversed,
    minProgramCount,
    programCountReversed,
    minFulfillmentRate,
    fulfillmentRateReversed,
    excludedCities,
    excludedUniversities,
    excludedPrograms,
    excludedScholarships,
  ]);

  // ── Debounced compare call ──────────────────────────────────

  useEffect(() => {
    const req = buildCompareRequest();
    if (!req) {
      setSimilarPrograms([]);
      setChartData(null);
      setFrequencyData(null);
      setPriceData([]);
      setScholarshipCounts({});
      setTotalBeforeLimit(0);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setComparing(true);
        setError(null);

        const res = await comparePrograms(req);

        // Store the full programs list from server
        const allPrograms = res.similar_programs || [];
        setSimilarPrograms(allPrograms);
        setTotalBeforeLimit(res.total_before_limit || allPrograms.length);
        setPriceData(res.price_data || []);
        setFrequencyData(res.frequency_data || null);
        setScholarshipCounts(res.scholarship_counts || {});

        // Prepare chart data (display logic stays on the client)
        const selectedFlat = res.selected_program || selectedProgram;
        const otherPrograms = allPrograms.filter((p) => p.yop_kodu !== selectedFlat.yop_kodu);
        const limitedForChart =
          recordLimit >= 200
            ? allPrograms
            : [selectedFlat, ...otherPrograms.slice(0, recordLimit - 1)];

        const chart = prepareChartData(
          limitedForChart,
          year,
          metric,
          res.price_data || [],
          chartSortBy,
          university.name,
          selectedFlat
        );
        setChartData(chart);
      } catch (err) {
        console.error("Comparison error:", err);
        setError("Karşılaştırma yapılırken hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setComparing(false);
      }
    }, COMPARE_DEBOUNCE);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildCompareRequest]);

  // ── Y-axis range expansion handlers ─────────────────────────

  const handleExpandRange = (direction, step) => {
    if (!selectedProgram || !year || !metric) return;

    const minColumn = metric === "ranking" ? `tavan_bs_${year}` : `taban_${year}`;
    const maxColumn = metric === "ranking" ? `tbs_${year}` : `tavan_${year}`;

    const currentMin = customRangeMin !== null ? customRangeMin : selectedProgram[minColumn];
    const currentMax = customRangeMax !== null ? customRangeMax : selectedProgram[maxColumn];

    if (direction === "top") {
      if (metric === "ranking") {
        setCustomRangeMin(Math.max(0, currentMin - step));
      } else {
        setCustomRangeMax(currentMax + step);
      }
    } else {
      if (metric === "ranking") {
        setCustomRangeMax(currentMax + step);
      } else {
        setCustomRangeMin(Math.max(0, currentMin - step));
      }
    }
  };

  const handleResetRange = () => {
    setCustomRangeMin(null);
    setCustomRangeMax(null);
  };

  // ── Toggle helpers for exclusion tags ───────────────────────

  const toggle = (setter) => (item) =>
    setter((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });

  const toggleExcludedCity = toggle(setExcludedCities);
  const toggleExcludedUniversity = toggle(setExcludedUniversities);
  const toggleExcludedProgram = toggle(setExcludedPrograms);
  const toggleExcludedScholarship = toggle(setExcludedScholarships);

  // ── Handle program selection from dropdown ──────────────────

  const handleProgramChange = (program) => {
    setSelectedProgram(program);
  };

  // ── Render helpers ──────────────────────────────────────────

  const renderExclusionTags = (items, excludedSet, toggleFn, emptyText = "Hiçbiri") => {
    if (!items || items.length === 0) {
      return <Typography variant="caption">{emptyText}</Typography>;
    }
    return items.map(([name, count]) => (
      <Box
        key={name}
        onClick={() => toggleFn(name)}
        sx={{
          cursor: "pointer",
          px: 1,
          py: 0.25,
          borderRadius: 1,
          bgcolor: excludedSet.has(name) ? "error.light" : "grey.200",
          textDecoration: excludedSet.has(name) ? "line-through" : "none",
          opacity: excludedSet.has(name) ? 0.6 : 1,
          fontSize: "0.75rem",
          "&:hover": {
            bgcolor: excludedSet.has(name) ? "error.main" : "grey.300",
          },
        }}
      >
        {name} ({count})
      </Box>
    ));
  };

  // Filter frequency items by the active slider threshold (for tag display)
  const filterByThreshold = (items, threshold, reversed) => {
    if (!items) return [];
    return items.filter(([, count]) => (reversed ? count <= threshold : count >= threshold));
  };

  // ── Loading / error screens ─────────────────────────────────

  if (error && !selectedProgram) {
    return (
      <>
        <Header title="Üniversite Karşılaştırma" />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  // ── Main render ─────────────────────────────────────────────

  return (
    <PageContainer logourl={university.logo}>
      <Header title="Üniversite Karşılaştırma" />
      <ContentWrapper>
        <Container maxWidth={false} sx={{ mt: 4, mb: 4, marginTop: "70px" }}>
          <InstructionsPanel />

          <Grid container spacing={3}>
            {/* ─── Left Panel: Selectors & Filters ─── */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Filtreler
                </Typography>

                <YearSelector value={year} onChange={setYear} />

                <ProgramSelector
                  programs={availablePrograms}
                  value={selectedProgram?.yop_kodu || ""}
                  onChange={handleProgramChange}
                  disabled={!year || loadingPrograms}
                />

                <MetricSelector value={metric} onChange={setMetric} disabled={!selectedProgram} />

                <UniversityTypeSelector
                  universityType={universityType}
                  onChange={setUniversityType}
                  disabled={!selectedProgram}
                />

                {/* City preference slider */}
                <FilterSlider
                  value={topCitiesLimit}
                  onChange={setTopCitiesLimit}
                  disabled={!selectedProgram}
                  label={(val, reversed) =>
                    val === 0
                      ? "Tüm illerdeki tüm programlar gösteriliyor."
                      : reversed
                        ? `Yerleşenlerin en fazla ${val} defa tercih ettikleri illerdeki programlar gösteriliyor.`
                        : `Yerleşenlerin en az ${val} defa tercih ettikleri illerdeki programlar gösteriliyor.`
                  }
                  frequencyData={frequencyData?.cities || []}
                  type="il"
                  isReversed={topCitiesReversed}
                  onReversedChange={setTopCitiesReversed}
                />

                {/* University preference slider */}
                <FilterSlider
                  value={minUniversityCount}
                  onChange={setMinUniversityCount}
                  disabled={!selectedProgram}
                  label={(val, reversed) =>
                    val === 0
                      ? "Tüm üniversitelerdeki tüm programlar gösteriliyor."
                      : reversed
                        ? `Yerleşenlerin en fazla ${val} defa tercih ettikleri üniversitelerin programlarını tutar`
                        : `Yerleşenlerin en az ${val} defa tercih ettikleri üniversitelerin programlarını tutar`
                  }
                  frequencyData={frequencyData?.universities || []}
                  type="üniversite"
                  isReversed={universityCountReversed}
                  onReversedChange={setUniversityCountReversed}
                />

                {/* Program preference slider */}
                <FilterSlider
                  value={minProgramCount}
                  onChange={setMinProgramCount}
                  disabled={!selectedProgram}
                  label={(val, reversed) =>
                    val === 0
                      ? "Tüm program tiplerinden programlar gösteriliyor."
                      : reversed
                        ? `Yerleşenlerin en fazla ${val} defa tercih ettikleri program tipinden olan programları tutar.`
                        : `Yerleşenlerin en az ${val} defa tercih ettikleri program tipinden olan programları tutar.`
                  }
                  frequencyData={frequencyData?.programs || []}
                  type="program tipi"
                  isReversed={programCountReversed}
                  onReversedChange={setProgramCountReversed}
                />

                {/* Fulfillment rate slider */}
                <FilterSlider
                  value={minFulfillmentRate}
                  onChange={setMinFulfillmentRate}
                  disabled={!selectedProgram}
                  label={(val, reversed) =>
                    val === 0
                      ? "Tüm doluluk oranlarındaki programlar gösteriliyor."
                      : reversed
                        ? `Doluluk oranı en fazla %${val} olan programlar gösteriliyor.`
                        : `Doluluk oranı en az %${val} olan programlar gösteriliyor.`
                  }
                  frequencyData={frequencyData?.fulfillment || []}
                  type="doluluk oranı"
                  isPercentage={true}
                  isReversed={fulfillmentRateReversed}
                  onReversedChange={setFulfillmentRateReversed}
                />

                {/* ─── Selected program info box ─── */}
                {selectedProgram && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Seçilen Program Bilgileri:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fakülte:</strong> {selectedProgram.faculty}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Puan Türü:</strong> {selectedProgram.puan_type.toUpperCase()}
                    </Typography>

                    {/* Scholarship exclusion tags */}
                    {Object.keys(scholarshipCounts).length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Burs Türleri:</strong>{" "}
                          <Typography variant="caption" color="text.secondary">
                            (Hariç tutmak için tıklayın)
                          </Typography>
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mt: 0.5,
                          }}
                        >
                          {renderExclusionTags(
                            Object.entries(scholarshipCounts).sort((a, b) => b[1] - a[1]),
                            excludedScholarships,
                            toggleExcludedScholarship
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* City exclusion tags */}
                    {topCitiesLimit > 0 && frequencyData?.cities?.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Dahil Edilen Şehirler:</strong>{" "}
                          <Typography variant="caption" color="text.secondary">
                            (Hariç tutmak için tıklayın)
                          </Typography>
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mt: 0.5,
                          }}
                        >
                          {renderExclusionTags(
                            filterByThreshold(
                              frequencyData.cities,
                              topCitiesLimit,
                              topCitiesReversed
                            ),
                            excludedCities,
                            toggleExcludedCity
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* University exclusion tags */}
                    {minUniversityCount > 0 && frequencyData?.universities?.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>
                            Bu Programa Başvuranların Tercih Ettiği Üniversiteler (
                            {universityCountReversed
                              ? `Max ${minUniversityCount}`
                              : `Min ${minUniversityCount}`}{" "}
                            tercih):
                          </strong>{" "}
                          <Typography variant="caption" color="text.secondary">
                            (Hariç tutmak için tıklayın)
                          </Typography>
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mt: 0.5,
                          }}
                        >
                          {renderExclusionTags(
                            filterByThreshold(
                              frequencyData.universities,
                              minUniversityCount,
                              universityCountReversed
                            ),
                            excludedUniversities,
                            toggleExcludedUniversity
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Program exclusion tags */}
                    {minProgramCount > 0 && frequencyData?.programs?.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>
                            Bu Programa Başvuranların Tercih Ettiği Programlar (
                            {programCountReversed
                              ? `Max ${minProgramCount}`
                              : `Min ${minProgramCount}`}{" "}
                            tercih):
                          </strong>{" "}
                          <Typography variant="caption" color="text.secondary">
                            (Hariç tutmak için tıklayın)
                          </Typography>
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mt: 0.5,
                          }}
                        >
                          {renderExclusionTags(
                            filterByThreshold(
                              frequencyData.programs,
                              minProgramCount,
                              programCountReversed
                            ),
                            excludedPrograms,
                            toggleExcludedProgram
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Selected program stats */}
                    {metric === "score" ? (
                      <>
                        <Typography variant="body2">
                          <strong>Min Puan:</strong>{" "}
                          {selectedProgram[`taban_${year}`]
                            ? selectedProgram[`taban_${year}`].toLocaleString("tr-TR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "-"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Max Puan:</strong>{" "}
                          {selectedProgram[`tavan_${year}`]
                            ? selectedProgram[`tavan_${year}`].toLocaleString("tr-TR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "-"}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="body2">
                          <strong>Min Sıralama:</strong>{" "}
                          {selectedProgram[`tbs_${year}`]
                            ? Math.round(selectedProgram[`tbs_${year}`]).toLocaleString("tr-TR")
                            : "-"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Max Sıralama:</strong>{" "}
                          {selectedProgram[`tavan_bs_${year}`]
                            ? Math.round(selectedProgram[`tavan_bs_${year}`]).toLocaleString(
                                "tr-TR"
                              )
                            : "-"}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* ─── Right Panel: Results ─── */}
            <Grid item xs={12} md={8}>
              {comparing && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    Karşılaştırma yapılıyor...
                  </Typography>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {!comparing &&
                selectedProgram &&
                year &&
                (selectedProgram[`yerlesen_${year}`] === 0 ||
                !selectedProgram[`yerlesen_${year}`] ? (
                  <Paper sx={{ p: 3 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body1">
                        <strong>{selectedProgram.program || selectedProgram.department}</strong>{" "}
                        programına {year} yılında yerleşen öğrenci bulunmamaktadır.
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Bu nedenle karşılaştırma grafiği ve benzer programlar listesi
                        görüntülenememektedir.
                        {selectedProgram[`kontenjan_${year}`] > 0 && (
                          <span>
                            {" "}
                            Programın {year} yılı kontenjanı:{" "}
                            <strong>{selectedProgram[`kontenjan_${year}`]}</strong>
                          </span>
                        )}
                      </Typography>
                    </Alert>
                  </Paper>
                ) : (
                  chartData && (
                    <>
                      <ComparisonChart
                        chartData={chartData}
                        selectedProgram={selectedProgram}
                        year={year}
                        metric={metric}
                        totalPrograms={totalBeforeLimit}
                        onExpandRange={handleExpandRange}
                        currentRangeMin={customRangeMin}
                        currentRangeMax={customRangeMax}
                        onResetRange={handleResetRange}
                        recordLimit={recordLimit}
                        onRecordLimitChange={setRecordLimit}
                        sortBy={chartSortBy}
                        onSortChange={setChartSortBy}
                      />

                      <DepartmentList
                        programs={similarPrograms}
                        year={year}
                        metric={metric}
                        priceData={priceData}
                      />
                    </>
                  )
                ))}

              {!comparing && !selectedProgram && <div> </div>}
            </Grid>
          </Grid>
        </Container>
      </ContentWrapper>
    </PageContainer>
  );
};

export default UniversityComparison;
