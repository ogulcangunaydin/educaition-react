/**
 * Data Filtering Utilities for University Comparison
 */

/**
 * Get programs for the specified university and year
 * @param {Array} data - All programs data
 * @param {string} year - Year to filter
 * @param {string} universityName - University name (e.g., "HALİÇ ÜNİVERSİTESİ")
 */
export const getUniversityProgramsForYear = (data, year, universityName) => {
  if (!data || !year || !universityName) return [];

  return data.filter(
    (program) =>
      program[`has_${year}`] === true && program.university === universityName
  );
};

/**
 * @deprecated Use getUniversityProgramsForYear instead
 * Get Haliç programs that have data for the specified year (kept for backward compatibility)
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
  buffer,
  customRangeMin = null,
  customRangeMax = null
) => {
  if (!allUniversitiesData || !selectedProgram || !year || !metric) {
    return [];
  }

  // Determine which columns to use based on metric type
  // For RANKING: tavan_bs is BEST (lower number = min), tbs is WORST (higher number = max)
  // For SCORE: taban is min, tavan is max
  const minColumn = metric === "ranking" ? `tavan_bs_${year}` : `taban_${year}`;
  const maxColumn = metric === "ranking" ? `tbs_${year}` : `tavan_${year}`;

  // Get min and max values from selected program or use custom range
  const selectedMin =
    customRangeMin !== null ? customRangeMin : selectedProgram[minColumn];
  const selectedMax =
    customRangeMax !== null ? customRangeMax : selectedProgram[maxColumn];

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

  // Filter programs that fall within the buffer range
  const filtered = allUniversitiesData.filter((program) => {
    // Must have data for the selected year
    if (program[`has_${year}`] !== true) return false;

    // Must have the same puan_type (score type)
    if (program.puan_type !== selectedProgram.puan_type) return false;

    // Get program's min and max values
    let progMin = program[minColumn];
    let progMax = program[maxColumn];

    // Handle "Dolmadı" cases: if min is null but max exists, use max for both
    if (progMin === null && progMax !== null) {
      progMin = progMax;
    }

    if (progMin === null || progMax === null) return false;

    // Ensure progMin is actually smaller than progMax (data might be inconsistent)
    if (progMin > progMax) {
      [progMin, progMax] = [progMax, progMin]; // Swap if needed
    }

    // STRICT buffer check: Both min and max of the program must be within the buffer range
    // progMin must be >= searchMin (not lower than lower bound)
    // progMax must be <= searchMax (not higher than upper bound)
    const isInRange = progMin >= searchMin && progMax <= searchMax;

    return isInRange;
  });

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
 * @param {Array} programs - Programs to display
 * @param {string} year - Selected year
 * @param {string} metric - "ranking" or "score"
 * @param {Array} priceData - Price data array
 * @param {string} sortBy - Sort method
 * @param {string} ownUniversityName - The user's own university name to highlight (e.g., "HALİÇ ÜNİVERSİTESİ")
 * @param {Object} selectedProgram - The selected base program to show first in the chart
 */
export const prepareChartData = (
  programs,
  year,
  metric,
  priceData = [],
  sortBy = "spread",
  ownUniversityName = "HALİÇ ÜNİVERSİTESİ",
  selectedProgram = null
) => {
  if (!programs || programs.length === 0) return null;

  // Only show prices for 2024 and 2025
  const showPrices = year === "2024" || year === "2025";

  // Create a map for quick price lookup by yop_kodu and scholarship_pct
  // Normalize yop_kodu by removing .0 suffix if present
  const priceMap = new Map();
  priceData.forEach((price) => {
    if (!price.yop_kodu) return; // Skip entries without yop_kodu

    // Normalize yop_kodu: convert to number then back to string to remove trailing .0
    let normalizedYopKodu = price.yop_kodu;
    if (normalizedYopKodu.includes(".")) {
      const numValue = parseFloat(normalizedYopKodu);
      if (!isNaN(numValue)) {
        normalizedYopKodu = Math.round(numValue).toString();
      }
    }

    const key = `${normalizedYopKodu}_${price.scholarship_pct}`;
    // Store year-specific discounted price
    const yearPrice =
      year === "2024"
        ? price.discounted_price_2024
        : year === "2025"
        ? price.discounted_price_2025
        : null;
    if (yearPrice !== null && !isNaN(yearPrice)) {
      priceMap.set(key, yearPrice);
    }
  });

  // For RANKING: tavan_bs is BEST (lower number = min), tbs is WORST (higher number = max)
  // For SCORE: taban is min, tavan is max
  const minColumn = metric === "ranking" ? `tavan_bs_${year}` : `taban_${year}`;
  const maxColumn = metric === "ranking" ? `tbs_${year}` : `tavan_${year}`;

  const labels = [];
  const dataPoints = [];
  const pricePoints = [];
  const colors = [];

  // Color scheme for university types
  const colorMap = {
    Devlet: "rgba(54, 162, 235, 0.6)", // Blue for state universities
    Vakıf: "rgba(255, 99, 132, 0.6)", // Red for private universities
    KKTC: "rgba(75, 192, 192, 0.6)", // Teal for TRNC universities
  };

  // Special color for own university (highlighted)
  const ownUniversityColor = "rgba(255, 193, 7, 0.8)"; // Bright orange/yellow

  // First pass: collect all valid items to calculate data range
  const departmentItems = programs
    .map((program) => {
      let min = program[minColumn];
      let max = program[maxColumn];

      // Check if this program had "Dolmadı" (not filled) status
      // The parser already filled min with max value in such cases
      const minWasFilled = program[`${minColumn}_filled`] === true;

      if (min === null || max === null) return null;

      // Ensure min is actually smaller than max
      if (min > max) {
        [min, max] = [max, min];
      }

      const originalMin = min;
      const originalMax = max;
      const isSingleStudent = min === max;

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
        originalMin,
        originalMax,
        isSingleStudent,
        minWasFilled, // Track if min was filled from max due to "Dolmadı"
      };
    })
    .filter((item) => item !== null);

  // Calculate the overall data range to determine appropriate minimum bar size
  const allSpreads = departmentItems
    .map((item) => item.spread)
    .filter((s) => s > 0);
  const maxSpread = Math.max(...allSpreads);

  // Set minimum visible bar size as 3% of the maximum spread (or at least 1)
  const minVisibleSpread = Math.max(maxSpread * 0.03, 1);

  // Second pass: adjust single-student programs to have minimum visible spread,
  // calculate fulfillment rate, and get price for sorting
  departmentItems.forEach((item) => {
    if (item.isSingleStudent) {
      item.max = item.min + minVisibleSpread;
      item.spread = minVisibleSpread;
    }

    // Calculate fulfillment rate
    const kontenjan = item.program[`kontenjan_${year}`];
    const yerlesen = item.program[`yerlesen_${year}`];
    item.fulfillmentRate =
      kontenjan && yerlesen ? (yerlesen / kontenjan) * 100 : 100;

    // Get price for sorting
    let yopKodu = item.program.yop_kodu;
    if (yopKodu && typeof yopKodu === "string" && yopKodu.includes(".")) {
      const numValue = parseFloat(yopKodu);
      if (!isNaN(numValue)) {
        yopKodu = Math.round(numValue).toString();
      }
    } else if (yopKodu && typeof yopKodu === "number") {
      yopKodu = Math.round(yopKodu).toString();
    }

    const scholarship = item.program.scholarship || "Ücretli";
    let scholarshipPct = 0;
    if (scholarship.includes("100") || scholarship.includes("Tam Burslu")) {
      scholarshipPct = 100;
    } else if (scholarship.includes("75")) {
      scholarshipPct = 75;
    } else if (
      scholarship.includes("50") ||
      scholarship.includes("Yarım Burslu")
    ) {
      scholarshipPct = 50;
    } else if (scholarship.includes("25")) {
      scholarshipPct = 25;
    } else if (scholarship === "Burslu") {
      // "Burslu" without percentage means full scholarship (100%)
      scholarshipPct = 100;
    }

    const priceKey = `${yopKodu}_${scholarshipPct}`;
    // Only show prices for 2024 and 2025 years
    item.price = showPrices ? priceMap.get(priceKey) || 0 : 0;
  });

  // Sort: Selected program first, then by selected sort method
  // Other programs from ownUniversityName are sorted normally but colored differently
  const selectedYopKodu = selectedProgram?.yop_kodu;

  departmentItems.sort((a, b) => {
    // Selected program always comes first
    if (selectedYopKodu) {
      if (a.program.yop_kodu === selectedYopKodu) return -1;
      if (b.program.yop_kodu === selectedYopKodu) return 1;
    }

    // Apply sorting based on sortBy parameter for all other programs
    switch (sortBy) {
      case "price":
        return b.price - a.price; // Higher price first
      case "fulfillment":
        return a.fulfillmentRate - b.fulfillmentRate; // Lower fulfillment first (reversed)
      case "max":
        // Sort by maximum value (worst first - hardest to get in)
        // For ranking: higher max is worse (larger ranking number = worse rank)
        // For score: lower max is worse (lower score = worse)
        return metric === "ranking" ? b.max - a.max : a.max - b.max;
      case "min":
        // Sort by minimum value (worst first - hardest to get in)
        // For ranking: higher min is worse (larger ranking number = worse rank)
        // For score: lower min is worse (lower score = worse)
        return metric === "ranking" ? b.min - a.min : a.min - b.min;
      case "spread":
      default:
        return b.spread - a.spread; // Larger spread first
    }
  });

  // All departments are now included in the chart (no filtering by spread)

  // Build chart data
  departmentItems.forEach((item) => {
    labels.push(item.label);

    // Get capacity and placed students for the year
    const capacity = item.program[`kontenjan_${year}`] || 0;
    const yerlesen = item.program[`yerlesen_${year}`] || 0;

    dataPoints.push({
      min: item.min,
      q1: item.min,
      median: (item.min + item.max) / 2,
      q3: item.max,
      max: item.max,
      programs: [item.program],
      fulfillmentRate: item.fulfillmentRate,
      capacity: capacity,
      yerlesen: yerlesen,
    });

    pricePoints.push(item.price);

    // Use special color for own university, otherwise use type-based color
    if (item.university === ownUniversityName) {
      colors.push(ownUniversityColor);
    } else {
      colors.push(colorMap[item.university_type] || "rgba(153, 102, 255, 0.6)");
    }
  });

  return {
    labels,
    dataPoints,
    pricePoints,
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
