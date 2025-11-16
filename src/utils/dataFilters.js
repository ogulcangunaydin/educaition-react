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
  const minColumn = metric === "ranking" ? `tbs_${year}` : `taban_${year}`;
  const maxColumn = metric === "ranking" ? `tavan_bs_${year}` : `tavan_${year}`;

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

  // Filter programs that fall within the buffer range
  return allUniversitiesData.filter((program) => {
    // Must have data for the selected year
    if (program[`has_${year}`] !== true) return false;

    // Must have the same puan_type (score type)
    if (program.puan_type !== selectedProgram.puan_type) return false;

    // Get program's min and max values
    const progMin = program[minColumn];
    const progMax = program[maxColumn];

    if (progMin === null || progMax === null) return false;

    // Check if ranges overlap with buffer zone
    // Program is included if its range overlaps with the search range
    return progMin <= searchMax && progMax >= searchMin;
  });
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

  const minColumn = metric === "ranking" ? `tbs_${year}` : `taban_${year}`;
  const maxColumn = metric === "ranking" ? `tavan_bs_${year}` : `tavan_${year}`;

  // Group by university
  const grouped = groupProgramsByUniversity(programs);

  const labels = [];
  const dataPoints = [];
  const colors = [];

  // Color scheme for university types
  const colorMap = {
    Devlet: "rgba(54, 162, 235, 0.6)", // Blue for state universities
    Vakıf: "rgba(255, 99, 132, 0.6)", // Red for private universities
    KKTC: "rgba(75, 192, 192, 0.6)", // Teal for TRNC universities
  };

  Object.keys(grouped)
    .sort()
    .forEach((university) => {
      const universityPrograms = grouped[university];

      // Collect all min and max values for this university
      const values = [];
      universityPrograms.forEach((program) => {
        const min = program[minColumn];
        const max = program[maxColumn];
        if (min !== null) values.push(min);
        if (max !== null) values.push(max);
      });

      if (values.length > 0) {
        // Sort values for box plot calculation
        values.sort((a, b) => a - b);

        const min = Math.min(...values);
        const max = Math.max(...values);
        const q1 = values[Math.floor(values.length * 0.25)];
        const median = values[Math.floor(values.length * 0.5)];
        const q3 = values[Math.floor(values.length * 0.75)];

        labels.push(university);
        dataPoints.push({
          min,
          q1,
          median,
          q3,
          max,
          programs: universityPrograms,
        });

        // Get color based on university type
        const universityType = universityPrograms[0].university_type;
        colors.push(colorMap[universityType] || "rgba(153, 102, 255, 0.6)");
      }
    });

  return {
    labels,
    dataPoints,
    colors,
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
  const column = metric === "ranking" ? `tbs_${year}` : `taban_${year}`;

  return [...programs].sort((a, b) => {
    const valA = a[column] || 0;
    const valB = b[column] || 0;

    return direction === "asc" ? valA - valB : valB - valA;
  });
};
