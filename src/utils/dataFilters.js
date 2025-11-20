/**
 * Data Filtering Utilities for University Comparison
 */

/**
 * Get Haliç programs that have data for the specified year
 */
export const getHalicProgramsForYear = (halicData, year) => {
  if (!halicData || !year) return [];

  return halicData.filter((program) => program[`has_${year}`] === true);
};

/**
 * Find similar programs from all universities based on metric and buffer
 */
export const findSimilarPrograms = (
  allUniversitiesData,
  selectedProgram,
  year,
  metric,
  buffer
) => {
  if (!allUniversitiesData || !selectedProgram || !year || !metric) {
    return [];
  }

  // Determine which columns to use based on metric type
  // For RANKING: tavan_bs is BEST (lower number = min), tbs is WORST (higher number = max)
  // For SCORE: taban is min, tavan is max
  const minColumn = metric === "ranking" ? `tavan_bs_${year}` : `taban_${year}`;
  const maxColumn = metric === "ranking" ? `tbs_${year}` : `tavan_${year}`;

  // Get min and max values from selected program
  const selectedMin = selectedProgram[minColumn];
  const selectedMax = selectedProgram[maxColumn];

  if (selectedMin === null || selectedMax === null) {
    return [];
  }

  // Calculate buffer range
  const bufferMultiplier = buffer / 100;

  // For ranking: lower number is better, so we invert the logic
  // For score: higher number is better
  let searchMin, searchMax;

  if (metric === "ranking") {
    // For ranking: expand range in both directions
    // Lower rankings (better) get a buffer downward
    // Higher rankings (worse) get a buffer upward
    searchMin = selectedMin * (1 - bufferMultiplier);
    searchMax = selectedMax * (1 + bufferMultiplier);
  } else {
    // For score: expand range in both directions
    searchMin = selectedMin * (1 - bufferMultiplier);
    searchMax = selectedMax * (1 + bufferMultiplier);
  }

  console.log("=== BUFFER CALCULATION DEBUG ===");
  console.log(
    "Selected Program:",
    selectedProgram.program,
    selectedProgram.program_detail
  );
  console.log("Metric:", metric);
  console.log("Year:", year);
  console.log("Buffer:", buffer + "%");
  console.log("Selected Min:", selectedMin);
  console.log("Selected Max:", selectedMax);
  console.log("Search Range:", searchMin, "-", searchMax);
  console.log("minColumn:", minColumn, "maxColumn:", maxColumn);

  // Filter programs that fall within the buffer range
  const filtered = allUniversitiesData.filter((program) => {
    // Must have data for the selected year
    if (program[`has_${year}`] !== true) return false;

    // Must have the same puan_type (score type)
    if (program.puan_type !== selectedProgram.puan_type) return false;

    // Get program's min and max values
    let progMin = program[minColumn];
    let progMax = program[maxColumn];

    if (progMin === null || progMax === null) return false;

    // Ensure progMin is actually smaller than progMax (data might be inconsistent)
    if (progMin > progMax) {
      [progMin, progMax] = [progMax, progMin]; // Swap if needed
    }

    // STRICT buffer check: Both min and max of the program must be within the buffer range
    // progMin must be >= searchMin (not lower than lower bound)
    // progMax must be <= searchMax (not higher than upper bound)
    const isInRange = progMin >= searchMin && progMax <= searchMax;

    if (isInRange) {
      console.log("✓ MATCH:", program.university, "-", program.program);
      console.log("  Program range:", progMin, "-", progMax);
      console.log(
        "  Min check:",
        progMin,
        ">=",
        searchMin,
        "?",
        progMin >= searchMin
      );
      console.log(
        "  Max check:",
        progMax,
        "<=",
        searchMax,
        "?",
        progMax <= searchMax
      );
    }

    return isInRange;
  });

  console.log("Total matched programs:", filtered.length);
  console.log("================================\n");

  return filtered;
};

/**
 * Group programs by university for chart display
 */
export const groupProgramsByUniversity = (programs) => {
  const grouped = {};

  programs.forEach((program) => {
    const university = program.university;
    if (!grouped[university]) {
      grouped[university] = [];
    }
    grouped[university].push(program);
  });

  return grouped;
};

/**
 * Prepare chart data for box and whisker plot
 */
export const prepareChartData = (programs, year, metric) => {
  if (!programs || programs.length === 0) return null;

  // For RANKING: tavan_bs is BEST (lower number = min), tbs is WORST (higher number = max)
  // For SCORE: taban is min, tavan is max
  const minColumn = metric === "ranking" ? `tavan_bs_${year}` : `taban_${year}`;
  const maxColumn = metric === "ranking" ? `tbs_${year}` : `tavan_${year}`;

  const labels = [];
  const dataPoints = [];
  const colors = [];

  // Color scheme for university types
  const colorMap = {
    Devlet: "rgba(54, 162, 235, 0.6)", // Blue for state universities
    Vakıf: "rgba(255, 99, 132, 0.6)", // Red for private universities
    KKTC: "rgba(75, 192, 192, 0.6)", // Teal for TRNC universities
  };

  // Special color for Haliç University (highlighted)
  const halicColor = "rgba(255, 193, 7, 0.8)"; // Bright orange/yellow

  // Build department-level entries (one entry per program)
  const departmentItems = programs
    .map((program) => {
      let min = program[minColumn];
      let max = program[maxColumn];

      if (min === null || max === null) return null;

      // Ensure min is actually smaller than max
      if (min > max) {
        [min, max] = [max, min];
      }

      const spread = max - min;
      const label = `${program.university} - ${formatProgramName(program)}`;

      return {
        program,
        label,
        university: program.university,
        university_type: program.university_type,
        min,
        max,
        spread,
      };
    })
    .filter((item) => item !== null);

  // Sort: Haliç first, then by spread (largest to smallest)
  departmentItems.sort((a, b) => {
    if (a.university === "HALİÇ ÜNİVERSİTESİ") return -1;
    if (b.university === "HALİÇ ÜNİVERSİTESİ") return 1;
    return b.spread - a.spread; // Sort by spread descending (largest first)
  });

  // Filter out departments with zero spread for the chart (but keep them in programs list)
  const departmentsForChart = departmentItems.filter(
    (item) => item.spread > 0 || item.university === "HALİÇ ÜNİVERSİTESİ"
  );

  // Build chart data
  departmentsForChart.forEach((item) => {
    labels.push(item.label);
    dataPoints.push({
      min: item.min,
      q1: item.min,
      median: (item.min + item.max) / 2,
      q3: item.max,
      max: item.max,
      programs: [item.program],
    });

    // Use special color for Haliç University, otherwise use type-based color
    if (item.university === "HALİÇ ÜNİVERSİTESİ") {
      colors.push(halicColor);
    } else {
      colors.push(colorMap[item.university_type] || "rgba(153, 102, 255, 0.6)");
    }
  });

  return {
    labels,
    dataPoints,
    colors,
    sortedPrograms: departmentItems.map((item) => item.program), // All programs in chart order
  };
};

/**
 * Get available years for a specific program
 */
export const getAvailableYears = (program) => {
  const years = [];
  if (program.has_2022) years.push("2022");
  if (program.has_2023) years.push("2023");
  if (program.has_2024) years.push("2024");
  return years;
};

/**
 * Format program name for display
 */
export const formatProgramName = (program) => {
  let name = program.program;
  if (program.program_detail && program.program_detail !== program.program) {
    name += ` ${program.program_detail}`;
  }
  if (program.scholarship) {
    name += ` (${program.scholarship})`;
  }
  return name;
};

/**
 * Sort programs by a specific metric
 */
export const sortPrograms = (programs, year, metric, direction = "asc") => {
  // For ranking, use tavan_bs (best ranking) for sorting
  const column = metric === "ranking" ? `tavan_bs_${year}` : `taban_${year}`;

  return [...programs].sort((a, b) => {
    const valA = a[column] || 0;
    const valB = b[column] || 0;

    return direction === "asc" ? valA - valB : valB - valA;
  });
};
