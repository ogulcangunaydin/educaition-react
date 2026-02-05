import React, { useState, useEffect, useMemo, useRef } from "react";
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
import Header from "../components/Header";
import YearSelector from "../components/UniversityComparison/YearSelector";
import ProgramSelector from "../components/UniversityComparison/ProgramSelector";
import MetricSelector from "../components/UniversityComparison/MetricSelector";
import UniversityTypeSelector from "../components/UniversityComparison/UniversityTypeSelector";
import FilterSlider from "../components/UniversityComparison/FilterSlider";
import ComparisonChart from "../components/UniversityComparison/ComparisonChart";
import DepartmentList from "../components/UniversityComparison/DepartmentList";
import InstructionsPanel from "../components/UniversityComparison/InstructionsPanel";
import { fetchAllProgramsCached } from "../services/programService";
import { useBasket } from "../contexts/BasketContext";
import { useUniversity } from "../contexts/UniversityContext";
import {
  getUniversityProgramsForYear,
  findSimilarPrograms,
  prepareChartData,
} from "../utils/dataFilters";
import fetchWithAuth from "../utils/fetchWithAuth";

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

const UniversityComparison = () => {
  const { clearBasket } = useBasket();
  const { university } = useUniversity();
  const previousProgramRef = useRef(null);

  // State for CSV data
  const [allUniversitiesData, setAllUniversitiesData] = useState([]);
  const [cityPreferencesData, setCityPreferencesData] = useState([]);
  const [universityPreferencesData, setUniversityPreferencesData] = useState([]);
  const [programPreferencesData, setProgramPreferencesData] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Clear basket once on mount
  useEffect(() => {
    clearBasket();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // State for selections
  const [year, setYear] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [metric, setMetric] = useState("ranking");
  const [recordLimit, setRecordLimit] = useState(10);
  const [universityType, setUniversityType] = useState("Vakıf");
  const [topCitiesLimit, setTopCitiesLimit] = useState(0);
  const [topCitiesReversed, setTopCitiesReversed] = useState(false);
  const [minUniversityCount, setMinUniversityCount] = useState(0);
  const [universityCountReversed, setUniversityCountReversed] = useState(false);
  const [minProgramCount, setMinProgramCount] = useState(0);
  const [programCountReversed, setProgramCountReversed] = useState(false);
  const [minFulfillmentRate, setMinFulfillmentRate] = useState(0);
  const [fulfillmentRateReversed, setFulfillmentRateReversed] = useState(false);
  const [customRangeMin, setCustomRangeMin] = useState(null);
  const [customRangeMax, setCustomRangeMax] = useState(null);
  const [chartSortBy, setChartSortBy] = useState("spread");

  // State for manually excluded items (clicked to exclude)
  const [excludedCities, setExcludedCities] = useState(new Set());
  const [excludedUniversities, setExcludedUniversities] = useState(new Set());
  const [excludedPrograms, setExcludedPrograms] = useState(new Set());
  const [excludedScholarships, setExcludedScholarships] = useState(new Set());

  // State for computed data
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [similarPrograms, setSimilarPrograms] = useState([]);
  const [programsBeforeScholarshipFilter, setProgramsBeforeScholarshipFilter] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Calculate program frequency data for the selected program
  const programFrequencyData = useMemo(() => {
    if (!selectedProgram || !year || programPreferencesData.length === 0) {
      return [];
    }

    const programTotals = {};
    programPreferencesData.forEach((row) => {
      if (row.yop_kodu === selectedProgram.yop_kodu && row.year === year) {
        const prog = row.program;
        programTotals[prog] = (programTotals[prog] || 0) + row.tercih_sayisi;
      }
    });

    return Object.entries(programTotals).sort((a, b) => b[1] - a[1]);
  }, [selectedProgram, year, programPreferencesData]);

  // Calculate city frequency data for the selected program
  const cityFrequencyData = useMemo(() => {
    if (!selectedProgram || !year || cityPreferencesData.length === 0) {
      return [];
    }

    const cityTotals = {};
    cityPreferencesData.forEach((row) => {
      if (row.yop_kodu === selectedProgram.yop_kodu && row.year === year) {
        const city = row.il;
        cityTotals[city] = (cityTotals[city] || 0) + row.tercih_sayisi;
      }
    });

    return Object.entries(cityTotals).sort((a, b) => b[1] - a[1]);
  }, [selectedProgram, year, cityPreferencesData]);

  // Calculate university frequency data for the selected program
  const universityFrequencyData = useMemo(() => {
    if (!selectedProgram || !year || universityPreferencesData.length === 0) {
      return [];
    }

    const universityTotals = {};
    universityPreferencesData.forEach((row) => {
      if (row.yop_kodu === selectedProgram.yop_kodu && row.year === year) {
        const uni = row.universite;
        if (uni !== university.name) {
          universityTotals[uni] = (universityTotals[uni] || 0) + row.tercih_sayisi;
        }
      }
    });

    return Object.entries(universityTotals).sort((a, b) => b[1] - a[1]);
  }, [selectedProgram, year, universityPreferencesData, university.name]);

  // Calculate fulfillment rate frequency data for similar programs
  const fulfillmentFrequencyData = useMemo(() => {
    if (!selectedProgram || !year || allUniversitiesData.length === 0) {
      return [];
    }

    // Get similar programs
    const similar = findSimilarPrograms(
      allUniversitiesData,
      selectedProgram,
      year,
      metric,
      0,
      customRangeMin,
      customRangeMax
    );

    // Filter by university type first
    const filteredSimilar = similar.filter(
      (p) => universityType === "all" || p.university_type === universityType
    );

    // Calculate fulfillment rates for each program
    const fulfillmentRates = [];
    filteredSimilar.forEach((program) => {
      const kontenjan = program[`kontenjan_${year}`];
      const yerlesen = program[`yerlesen_${year}`];

      if (kontenjan && yerlesen) {
        const fulfillmentRate = (yerlesen / kontenjan) * 100;
        fulfillmentRates.push(fulfillmentRate);
      }
    });

    // Count how many programs have at least X% fulfillment for each threshold
    // Using percentage thresholds: 0%, 20%, 40%, 60%, 80%, 100%
    const thresholds = [0, 20, 40, 60, 80, 100];

    return thresholds.map((threshold) => {
      const count = fulfillmentRates.filter((rate) => rate >= threshold).length;
      return [threshold, count];
    });
  }, [
    selectedProgram,
    year,
    metric,
    universityType,
    allUniversitiesData,
    customRangeMin,
    customRangeMax,
  ]);

  // Load data on mount or when university changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const dataPrefix = university.dataPrefix;

        // Load program data from API (cached)
        const programDataPromise = fetchAllProgramsCached();

        // Load preference and price CSV files (these will be migrated to API in Phase 8.5)
        const [
          cityPrefsResponse,
          uniPrefsResponse,
          progPrefsResponse,
          priceResponse,
          cityPrefs2025Response,
          uniPrefs2025Response,
          progPrefs2025Response,
        ] = await Promise.all([
          fetch(`/assets/data/${dataPrefix}_tercih_edilen_iller.csv`),
          fetch(`/assets/data/${dataPrefix}_tercih_edilen_universiteler.csv`),
          fetch(`/assets/data/${dataPrefix}_tercih_edilen_programlar.csv`),
          fetch("/assets/data/all_programs_prices_processed.csv"),
          fetch(`/assets/data_2025/${dataPrefix}_tercih_edilen_iller.csv`),
          fetch(`/assets/data_2025/${dataPrefix}_tercih_edilen_universiteler.csv`),
          fetch(`/assets/data_2025/${dataPrefix}_tercih_edilen_programlar.csv`),
        ]);

        if (
          !cityPrefsResponse.ok ||
          !uniPrefsResponse.ok ||
          !progPrefsResponse.ok ||
          !priceResponse.ok ||
          !cityPrefs2025Response.ok ||
          !uniPrefs2025Response.ok ||
          !progPrefs2025Response.ok
        ) {
          throw new Error("Failed to load preference CSV files");
        }

        // Get program data from API
        const allProgramsData = await programDataPromise;

        const [
          cityPrefsText,
          uniPrefsText,
          progPrefsText,
          priceText,
          cityPrefs2025Text,
          uniPrefs2025Text,
          progPrefs2025Text,
        ] = await Promise.all([
          cityPrefsResponse.text(),
          uniPrefsResponse.text(),
          progPrefsResponse.text(),
          priceResponse.text(),
          cityPrefs2025Response.text(),
          uniPrefs2025Response.text(),
          progPrefs2025Response.text(),
        ]);

        // Parse city preferences CSV (simple format, not using parseCSV)
        const cityPrefsLines = cityPrefsText.trim().split("\n");
        const cityPrefs2025Lines = cityPrefs2025Text.trim().split("\n");
        const cityPrefsData = [];
        for (let i = 1; i < cityPrefsLines.length; i++) {
          const [yop_kodu, year, il, tercih_sayisi] = cityPrefsLines[i].split(",");
          cityPrefsData.push({
            yop_kodu,
            year,
            il,
            tercih_sayisi: parseInt(tercih_sayisi),
          });
        }
        // Add 2025 city preferences
        for (let i = 1; i < cityPrefs2025Lines.length; i++) {
          const [yop_kodu, year, il, tercih_sayisi] = cityPrefs2025Lines[i].split(",");
          cityPrefsData.push({
            yop_kodu,
            year,
            il,
            tercih_sayisi: parseInt(tercih_sayisi),
          });
        }

        // Parse university preferences CSV
        const uniPrefsLines = uniPrefsText.trim().split("\n");
        const uniPrefs2025Lines = uniPrefs2025Text.trim().split("\n");
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
        // Add 2025 university preferences
        for (let i = 1; i < uniPrefs2025Lines.length; i++) {
          const [yop_kodu, year, universite, tercih_sayisi, university_type] =
            uniPrefs2025Lines[i].split(",");
          uniPrefsData.push({
            yop_kodu,
            year,
            universite,
            tercih_sayisi: parseInt(tercih_sayisi),
            university_type,
          });
        }

        // Parse program preferences CSV
        const progPrefsLines = progPrefsText.trim().split("\n");
        const progPrefs2025Lines = progPrefs2025Text.trim().split("\n");
        const progPrefsData = [];
        for (let i = 1; i < progPrefsLines.length; i++) {
          const [yop_kodu, year, program, tercih_sayisi] = progPrefsLines[i].split(",");
          progPrefsData.push({
            yop_kodu,
            year,
            program,
            tercih_sayisi: parseInt(tercih_sayisi),
          });
        }
        // Add 2025 program preferences
        for (let i = 1; i < progPrefs2025Lines.length; i++) {
          const [yop_kodu, year, program, tercih_sayisi] = progPrefs2025Lines[i].split(",");
          progPrefsData.push({
            yop_kodu,
            year,
            program,
            tercih_sayisi: parseInt(tercih_sayisi),
          });
        }

        // Parse price data CSV (new format with 2024 and 2025 prices)
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

        const priceLines = priceText.trim().split("\n");
        const parsedPriceData = [];
        for (let i = 1; i < priceLines.length; i++) {
          const parts = parseCSVLine(priceLines[i]);
          const [
            yop_kodu,
            university,
            program,
            is_english,
            scholarship_pct,
            full_price_2024,
            full_price_2025,
            discounted_price_2024,
            discounted_price_2025,
          ] = parts;
          parsedPriceData.push({
            yop_kodu: yop_kodu?.trim(),
            university: university?.trim(),
            program: program?.trim(),
            is_english: is_english === "True",
            scholarship_pct: parseFloat(scholarship_pct),
            full_price_2024: parseFloat(full_price_2024) || null,
            full_price_2025: parseFloat(full_price_2025) || null,
            discounted_price_2024: parseFloat(discounted_price_2024) || null,
            discounted_price_2025: parseFloat(discounted_price_2025) || null,
          });
        }

        // Use program data from API (already includes all years)
        setAllUniversitiesData(allProgramsData);
        setCityPreferencesData(cityPrefsData);
        setUniversityPreferencesData(uniPrefsData);
        setProgramPreferencesData(progPrefsData);
        setPriceData(parsedPriceData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Veri yüklenirken hata oluştu. Lütfen sayfayı yenileyin.");
        setLoading(false);
      }
    };

    loadData();
  }, [university.dataPrefix]);

  // Update available programs when year or university changes
  // Filter programs for the current university from all universities data
  useEffect(() => {
    if (year && allUniversitiesData.length > 0) {
      // Filter programs that belong to the current user's university
      const programs = getUniversityProgramsForYear(allUniversitiesData, year, university.name);
      setAvailablePrograms(programs);
      setSelectedProgram(null); // Reset program selection
    } else {
      setAvailablePrograms([]);
    }
  }, [year, allUniversitiesData, university.name]);

  // Clear basket when selected program changes to a different program
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

  // Reset custom range when program or metric changes
  useEffect(() => {
    setCustomRangeMin(null);
    setCustomRangeMax(null);
  }, [selectedProgram, metric]);

  // Reset excluded items when selected program changes
  useEffect(() => {
    setExcludedCities(new Set());
    setExcludedUniversities(new Set());
    setExcludedPrograms(new Set());
    setExcludedScholarships(new Set());
  }, [selectedProgram]);

  // Handle Y-axis range expansion
  const handleExpandRange = (direction, step) => {
    if (!selectedProgram || !year || !metric) return;

    const minColumn = metric === "ranking" ? `tavan_bs_${year}` : `taban_${year}`;
    const maxColumn = metric === "ranking" ? `tbs_${year}` : `tavan_${year}`;

    const currentMin = customRangeMin !== null ? customRangeMin : selectedProgram[minColumn];
    const currentMax = customRangeMax !== null ? customRangeMax : selectedProgram[maxColumn];

    if (direction === "top") {
      // Expand toward better values
      if (metric === "ranking") {
        // For ranking: top means smaller numbers (better)
        setCustomRangeMin(Math.max(0, currentMin - step));
      } else {
        // For score: top means higher scores (better)
        setCustomRangeMax(currentMax + step);
      }
    } else {
      // Expand toward worse values
      if (metric === "ranking") {
        // For ranking: bottom means larger numbers (worse)
        setCustomRangeMax(currentMax + step);
      } else {
        // For score: bottom means lower scores (worse)
        setCustomRangeMin(Math.max(0, currentMin - step));
      }
    }
  };

  // Handle reset range
  const handleResetRange = () => {
    setCustomRangeMin(null);
    setCustomRangeMax(null);
  };

  // Update similar programs when selections change
  useEffect(() => {
    if (selectedProgram && year && metric && allUniversitiesData.length > 0) {
      const similar = findSimilarPrograms(
        allUniversitiesData,
        selectedProgram,
        year,
        metric,
        0, // Buffer is now controlled by chart's custom range
        customRangeMin,
        customRangeMax
      );

      // Filter by university type
      const filteredByType = similar.filter(
        (p) => universityType === "all" || p.university_type === universityType
      );

      // Filter by top cities if limit is set
      let filteredByCity = filteredByType;
      if (topCitiesLimit > 0 && cityPreferencesData.length > 0) {
        // Calculate total preferences per city for THIS specific program and year
        const cityTotals = {};
        cityPreferencesData.forEach((row) => {
          if (row.yop_kodu === selectedProgram.yop_kodu && row.year === year) {
            const city = row.il;
            cityTotals[city] = (cityTotals[city] || 0) + row.tercih_sayisi;
          }
        });

        // Only allow cities that pass the filter
        const allowedCities = Object.entries(cityTotals)
          .filter(([_, count]) =>
            topCitiesReversed ? count <= topCitiesLimit : count >= topCitiesLimit
          )
          .map(([city]) => city);

        filteredByCity = filteredByType.filter((p) => {
          if (p.yop_kodu === selectedProgram.yop_kodu) return true;
          return allowedCities.includes(p.city);
        });
      }

      // Filter out manually excluded cities
      if (excludedCities.size > 0) {
        filteredByCity = filteredByCity.filter((p) => {
          if (p.yop_kodu === selectedProgram.yop_kodu) return true;
          return !excludedCities.has(p.city);
        });
      }

      // Filter by minimum university count (exclude own university from count check)
      let filteredByUniversityCount = filteredByCity;
      if (minUniversityCount > 0 && universityPreferencesData.length > 0) {
        // Calculate total preferences per university for THIS specific own university program and year
        const universityTotals = {};
        universityPreferencesData.forEach((row) => {
          // Only count preferences for the selected own university program and year
          if (row.yop_kodu === selectedProgram.yop_kodu && row.year === year) {
            const uni = row.universite;
            if (uni !== university.name) {
              universityTotals[uni] = (universityTotals[uni] || 0) + row.tercih_sayisi;
            }
          }
        });

        // Only allow universities that pass the filter
        const allowedUniversities = Object.entries(universityTotals)
          .filter(([_, count]) =>
            universityCountReversed ? count <= minUniversityCount : count >= minUniversityCount
          )
          .map(([uni]) => uni);

        filteredByUniversityCount = filteredByCity.filter((p) => {
          if (p.yop_kodu === selectedProgram.yop_kodu) return true;
          return allowedUniversities.includes(p.university);
        });
      }

      // Filter out manually excluded universities
      if (excludedUniversities.size > 0) {
        filteredByUniversityCount = filteredByUniversityCount.filter((p) => {
          if (p.yop_kodu === selectedProgram.yop_kodu) return true;
          return !excludedUniversities.has(p.university);
        });
      }

      // Filter by minimum program count
      let filteredByProgramCount = filteredByUniversityCount;
      if (minProgramCount > 0 && programPreferencesData.length > 0) {
        // Calculate total preferences per program for THIS specific own university program and year
        const programTotals = {};
        programPreferencesData.forEach((row) => {
          // Only count preferences for the selected own university program and year
          if (row.yop_kodu === selectedProgram.yop_kodu && row.year === year) {
            const prog = row.program;
            programTotals[prog] = (programTotals[prog] || 0) + row.tercih_sayisi;
          }
        });

        // Only allow programs that pass the filter
        const allowedPrograms = Object.entries(programTotals)
          .filter(([_, count]) =>
            programCountReversed ? count <= minProgramCount : count >= minProgramCount
          )
          .map(([prog]) => prog.toLocaleLowerCase("tr-TR"));

        filteredByProgramCount = filteredByUniversityCount.filter((p) => {
          if (p.yop_kodu === selectedProgram.yop_kodu) return true;
          // Try to match program name (case-insensitive with Turkish locale)
          const programName = (p.program || p.department || "").toLocaleLowerCase("tr-TR");
          return allowedPrograms.includes(programName);
        });
      }

      // Filter out manually excluded programs
      if (excludedPrograms.size > 0) {
        filteredByProgramCount = filteredByProgramCount.filter((p) => {
          if (p.yop_kodu === selectedProgram.yop_kodu) return true;
          const programName = (p.program || p.department || "").toLocaleLowerCase("tr-TR");
          // Check case-insensitive by converting excluded programs to lowercase with Turkish locale
          const excludedLower = new Set(
            [...excludedPrograms].map((s) => s.toLocaleLowerCase("tr-TR"))
          );
          return !excludedLower.has(programName);
        });
      }

      // Filter by minimum fulfillment rate
      let filteredByFulfillmentRate = filteredByProgramCount;
      if (minFulfillmentRate > 0) {
        filteredByFulfillmentRate = filteredByProgramCount.filter((p) => {
          // Always include selected own university program
          if (p.yop_kodu === selectedProgram.yop_kodu) return true;

          const kontenjan = p[`kontenjan_${year}`];
          const yerlesen = p[`yerlesen_${year}`];

          if (!kontenjan || !yerlesen) return false;

          const fulfillmentRate = (yerlesen / kontenjan) * 100;
          return fulfillmentRateReversed
            ? fulfillmentRate <= minFulfillmentRate
            : fulfillmentRate >= minFulfillmentRate;
        });
      }

      // Save programs before scholarship filtering for UI display
      setProgramsBeforeScholarshipFilter(filteredByFulfillmentRate);

      // Filter out manually excluded scholarships
      let filteredByScholarship = filteredByFulfillmentRate;
      if (excludedScholarships.size > 0) {
        filteredByScholarship = filteredByFulfillmentRate.filter((p) => {
          if (p.yop_kodu === selectedProgram.yop_kodu) return true;
          const scholarship = p.scholarship || "Ücretli";
          return !excludedScholarships.has(scholarship);
        });
      }

      // Ensure selected program is always included and first
      const similarWithoutSelected = filteredByScholarship.filter(
        (p) => p.yop_kodu !== selectedProgram.yop_kodu
      );
      const allPrograms = [selectedProgram, ...similarWithoutSelected];

      setSimilarPrograms(allPrograms);

      // Limit programs for chart based on recordLimit
      // Always include the selected program as first, then limit the rest
      const limitedForChart =
        recordLimit >= 200
          ? allPrograms
          : [selectedProgram, ...similarWithoutSelected.slice(0, recordLimit - 1)];

      // Prepare chart data
      const chart = prepareChartData(
        limitedForChart,
        year,
        metric,
        priceData,
        chartSortBy,
        university.name,
        selectedProgram
      );
      setChartData(chart);
    } else {
      setSimilarPrograms([]);
      setChartData(null);
    }
  }, [
    selectedProgram,
    year,
    metric,
    recordLimit,
    universityType,
    topCitiesLimit,
    topCitiesReversed,
    minUniversityCount,
    universityCountReversed,
    minProgramCount,
    programCountReversed,
    minFulfillmentRate,
    fulfillmentRateReversed,
    allUniversitiesData,
    cityPreferencesData,
    universityPreferencesData,
    programPreferencesData,
    customRangeMin,
    customRangeMax,
    chartSortBy,
    priceData,
    university.name,
    excludedCities,
    excludedUniversities,
    excludedPrograms,
    excludedScholarships,
  ]);

  // Toggle functions for excluding/including items
  const toggleExcludedCity = (city) => {
    setExcludedCities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(city)) {
        newSet.delete(city);
      } else {
        newSet.add(city);
      }
      return newSet;
    });
  };

  const toggleExcludedUniversity = (uni) => {
    setExcludedUniversities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(uni)) {
        newSet.delete(uni);
      } else {
        newSet.add(uni);
      }
      return newSet;
    });
  };

  const toggleExcludedProgram = (prog) => {
    setExcludedPrograms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(prog)) {
        newSet.delete(prog);
      } else {
        newSet.add(prog);
      }
      return newSet;
    });
  };

  const toggleExcludedScholarship = (scholarship) => {
    setExcludedScholarships((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(scholarship)) {
        newSet.delete(scholarship);
      } else {
        newSet.add(scholarship);
      }
      return newSet;
    });
  };

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

  // Handle minimum program count change
  const handleMinProgramCountChange = (newCount) => {
    setMinProgramCount(newCount);
  };

  // Handle minimum fulfillment rate change
  const handleMinFulfillmentRateChange = (newRate) => {
    setMinFulfillmentRate(newRate);
  };

  if (loading) {
    return (
      <>
        <Header title="Üniversite Karşılaştırma" />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
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
    <PageContainer logourl={university.logo}>
      <Header title="Üniversite Karşılaştırma" />
      <ContentWrapper>
        <Container maxWidth={false} sx={{ mt: 4, mb: 4, marginTop: "70px" }}>
          {/* Instructions */}
          <InstructionsPanel />

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
                <FilterSlider
                  value={topCitiesLimit}
                  onChange={handleTopCitiesChange}
                  disabled={!selectedProgram}
                  label={(val, reversed) =>
                    val === 0
                      ? "Tüm illerdeki tüm programlar gösteriliyor."
                      : reversed
                        ? `Yerleşenlerin en fazla ${val} defa tercih ettikleri illerdeki programlar gösteriliyor.`
                        : `Yerleşenlerin en az ${val} defa tercih ettikleri illerdeki programlar gösteriliyor.`
                  }
                  frequencyData={cityFrequencyData}
                  type="il"
                  isReversed={topCitiesReversed}
                  onReversedChange={setTopCitiesReversed}
                />

                <FilterSlider
                  value={minUniversityCount}
                  onChange={handleMinUniversityCountChange}
                  disabled={!selectedProgram}
                  label={(val, reversed) =>
                    val === 0
                      ? "Tüm üniversitelerdeki tüm programlar gösteriliyor."
                      : reversed
                        ? `Yerleşenlerin en fazla ${val} defa tercih ettikleri üniversitelerin programlarını tutar`
                        : `Yerleşenlerin en az ${val} defa tercih ettikleri üniversitelerin programlarını tutar`
                  }
                  frequencyData={universityFrequencyData}
                  type="üniversite"
                  isReversed={universityCountReversed}
                  onReversedChange={setUniversityCountReversed}
                />
                <FilterSlider
                  value={minProgramCount}
                  onChange={handleMinProgramCountChange}
                  disabled={!selectedProgram}
                  label={(val, reversed) =>
                    val === 0
                      ? "Tüm program tiplerinden programlar gösteriliyor."
                      : reversed
                        ? `Yerleşenlerin en fazla ${val} defa tercih ettikleri program tipinden olan programları tutar.`
                        : `Yerleşenlerin en az ${val} defa tercih ettikleri program tipinden olan programları tutar.`
                  }
                  frequencyData={programFrequencyData}
                  type="program tipi"
                  isReversed={programCountReversed}
                  onReversedChange={setProgramCountReversed}
                />
                <FilterSlider
                  value={minFulfillmentRate}
                  onChange={handleMinFulfillmentRateChange}
                  disabled={!selectedProgram}
                  label={(val, reversed) =>
                    val === 0
                      ? "Tüm doluluk oranlarındaki programlar gösteriliyor."
                      : reversed
                        ? `Doluluk oranı en fazla %${val} olan programlar gösteriliyor.`
                        : `Doluluk oranı en az %${val} olan programlar gösteriliyor.`
                  }
                  frequencyData={fulfillmentFrequencyData}
                  type="doluluk oranı"
                  isPercentage={true}
                  isReversed={fulfillmentRateReversed}
                  onReversedChange={setFulfillmentRateReversed}
                />
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
                    {/* Scholarship exclusion filter - always show for similar programs */}
                    {programsBeforeScholarshipFilter.length > 1 && (
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
                          {(() => {
                            // Get unique scholarships from programs BEFORE scholarship filtering
                            const scholarshipCounts = {};
                            programsBeforeScholarshipFilter.forEach((p) => {
                              if (p.yop_kodu !== selectedProgram.yop_kodu) {
                                const scholarship = p.scholarship || "Ücretli";
                                scholarshipCounts[scholarship] =
                                  (scholarshipCounts[scholarship] || 0) + 1;
                              }
                            });
                            const scholarshipEntries = Object.entries(scholarshipCounts).sort(
                              (a, b) => b[1] - a[1]
                            );
                            return scholarshipEntries.length > 0 ? (
                              scholarshipEntries.map(([scholarship, count]) => (
                                <Box
                                  key={scholarship}
                                  onClick={() => toggleExcludedScholarship(scholarship)}
                                  sx={{
                                    cursor: "pointer",
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    bgcolor: excludedScholarships.has(scholarship)
                                      ? "error.light"
                                      : "grey.200",
                                    textDecoration: excludedScholarships.has(scholarship)
                                      ? "line-through"
                                      : "none",
                                    opacity: excludedScholarships.has(scholarship) ? 0.6 : 1,
                                    fontSize: "0.75rem",
                                    "&:hover": {
                                      bgcolor: excludedScholarships.has(scholarship)
                                        ? "error.main"
                                        : "grey.300",
                                    },
                                  }}
                                >
                                  {scholarship} ({count})
                                </Box>
                              ))
                            ) : (
                              <Typography variant="caption">Hiçbiri</Typography>
                            );
                          })()}
                        </Box>
                      </Box>
                    )}
                    {topCitiesLimit > 0 && cityPreferencesData.length > 0 && (
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
                          {(() => {
                            const cityTotals = {};
                            cityPreferencesData.forEach((row) => {
                              if (row.yop_kodu === selectedProgram.yop_kodu && row.year === year) {
                                const city = row.il;
                                cityTotals[city] = (cityTotals[city] || 0) + row.tercih_sayisi;
                              }
                            });
                            const filteredCities = Object.entries(cityTotals)
                              .filter(([_, count]) =>
                                topCitiesReversed
                                  ? count <= topCitiesLimit
                                  : count >= topCitiesLimit
                              )
                              .sort((a, b) => b[1] - a[1]);
                            return filteredCities.length > 0 ? (
                              filteredCities.map(([city, count]) => (
                                <Box
                                  key={city}
                                  onClick={() => toggleExcludedCity(city)}
                                  sx={{
                                    cursor: "pointer",
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    bgcolor: excludedCities.has(city) ? "error.light" : "grey.200",
                                    textDecoration: excludedCities.has(city)
                                      ? "line-through"
                                      : "none",
                                    opacity: excludedCities.has(city) ? 0.6 : 1,
                                    fontSize: "0.75rem",
                                    "&:hover": {
                                      bgcolor: excludedCities.has(city) ? "error.main" : "grey.300",
                                    },
                                  }}
                                >
                                  {city} ({count})
                                </Box>
                              ))
                            ) : (
                              <Typography variant="caption">Hiçbiri</Typography>
                            );
                          })()}
                        </Box>
                      </Box>
                    )}
                    {minUniversityCount > 0 && universityPreferencesData.length > 0 && (
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
                          {(() => {
                            const universityTotals = {};
                            universityPreferencesData.forEach((row) => {
                              if (row.yop_kodu === selectedProgram.yop_kodu && row.year === year) {
                                const uni = row.universite;
                                if (uni !== university.name) {
                                  universityTotals[uni] =
                                    (universityTotals[uni] || 0) + row.tercih_sayisi;
                                }
                              }
                            });
                            const filteredUniversities = Object.entries(universityTotals)
                              .filter(([_, count]) =>
                                universityCountReversed
                                  ? count <= minUniversityCount
                                  : count >= minUniversityCount
                              )
                              .sort((a, b) => b[1] - a[1]);
                            return filteredUniversities.length > 0 ? (
                              filteredUniversities.map(([uni, count]) => (
                                <Box
                                  key={uni}
                                  onClick={() => toggleExcludedUniversity(uni)}
                                  sx={{
                                    cursor: "pointer",
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    bgcolor: excludedUniversities.has(uni)
                                      ? "error.light"
                                      : "grey.200",
                                    textDecoration: excludedUniversities.has(uni)
                                      ? "line-through"
                                      : "none",
                                    opacity: excludedUniversities.has(uni) ? 0.6 : 1,
                                    fontSize: "0.75rem",
                                    "&:hover": {
                                      bgcolor: excludedUniversities.has(uni)
                                        ? "error.main"
                                        : "grey.300",
                                    },
                                  }}
                                >
                                  {uni} ({count})
                                </Box>
                              ))
                            ) : (
                              <Typography variant="caption">Hiçbiri</Typography>
                            );
                          })()}
                        </Box>
                      </Box>
                    )}
                    {minProgramCount > 0 && programPreferencesData.length > 0 && (
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
                          {(() => {
                            const programTotals = {};
                            programPreferencesData.forEach((row) => {
                              if (row.yop_kodu === selectedProgram.yop_kodu && row.year === year) {
                                const prog = row.program;
                                programTotals[prog] =
                                  (programTotals[prog] || 0) + row.tercih_sayisi;
                              }
                            });
                            const filteredPrograms = Object.entries(programTotals)
                              .filter(([_, count]) =>
                                programCountReversed
                                  ? count <= minProgramCount
                                  : count >= minProgramCount
                              )
                              .sort((a, b) => b[1] - a[1]);
                            return filteredPrograms.length > 0 ? (
                              filteredPrograms.map(([prog, count]) => (
                                <Box
                                  key={prog}
                                  onClick={() => toggleExcludedProgram(prog)}
                                  sx={{
                                    cursor: "pointer",
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    bgcolor: excludedPrograms.has(prog)
                                      ? "error.light"
                                      : "grey.200",
                                    textDecoration: excludedPrograms.has(prog)
                                      ? "line-through"
                                      : "none",
                                    opacity: excludedPrograms.has(prog) ? 0.6 : 1,
                                    fontSize: "0.75rem",
                                    "&:hover": {
                                      bgcolor: excludedPrograms.has(prog)
                                        ? "error.main"
                                        : "grey.300",
                                    },
                                  }}
                                >
                                  {prog} ({count})
                                </Box>
                              ))
                            ) : (
                              <Typography variant="caption">Hiçbiri</Typography>
                            );
                          })()}
                        </Box>
                      </Box>
                    )}
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

            {/* Right Panel - Results */}
            <Grid item xs={12} md={8}>
              {selectedProgram && year ? (
                selectedProgram[`yerlesen_${year}`] === 0 ||
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
                  <>
                    <ComparisonChart
                      chartData={chartData}
                      selectedProgram={selectedProgram}
                      year={year}
                      metric={metric}
                      totalPrograms={similarPrograms.length}
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
              ) : (
                <div> </div>
              )}
            </Grid>
          </Grid>
        </Container>
      </ContentWrapper>
    </PageContainer>
  );
};

export default UniversityComparison;
