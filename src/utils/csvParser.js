/**
 * CSV Parser Utility
 * Handles parsing CSV files with Turkish number format (comma as decimal separator)
 */

/**
 * Parse Turkish formatted score string to JavaScript number
 * Scores are in quotes with comma as decimal separator
 * Converts "358,17297" to 358.17297
 */
export const parseScore = (scoreStr) => {
  if (
    !scoreStr ||
    scoreStr === "" ||
    scoreStr === "Dolmadı" ||
    scoreStr === "0"
  ) {
    return null;
  }
  // Remove quotes and convert comma to dot for decimal
  const cleaned = String(scoreStr).replace(/"/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Parse Turkish formatted ranking string to JavaScript number
 * Rankings use dot as thousand separator (no quotes)
 * Converts "92.887" to 92887 and "1.383.482" to 1383482
 */
export const parseRanking = (rankingStr) => {
  if (
    !rankingStr ||
    rankingStr === "" ||
    rankingStr === "Dolmadı" ||
    rankingStr === "0"
  ) {
    return null;
  }
  // Remove all dots (thousand separators)
  const cleaned = String(rankingStr).replace(/\./g, "");
  const parsed = parseInt(cleaned);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Parse a single row of CSV data
 */
export const parseCSVRow = (row) => {
  const parsed = { ...row };

  // Parse numeric fields for all years
  ["2022", "2023", "2024"].forEach((year) => {
    parsed[`kontenjan_${year}`] = parseScore(row[`kontenjan_${year}`]);
    // Scores use comma as decimal separator
    parsed[`taban_${year}`] = parseScore(row[`taban_${year}`]);
    parsed[`tavan_${year}`] = parseScore(row[`tavan_${year}`]);
    // Rankings use dot as thousand separator
    parsed[`tavan_bs_${year}`] = parseRanking(row[`tavan_bs_${year}`]);
    parsed[`tbs_${year}`] = parseRanking(row[`tbs_${year}`]);
    parsed[`yerlesen_${year}`] = parseScore(row[`yerlesen_${year}`]);
  });

  // Parse boolean fields
  parsed.has_2022 = row.has_2022 === "True";
  parsed.has_2023 = row.has_2023 === "True";
  parsed.has_2024 = row.has_2024 === "True";

  parsed.years_with_data = parseInt(row.years_with_data) || 0;

  return parsed;
};

/**
 * Parse entire CSV text to array of objects
 */
export const parseCSV = (csvText) => {
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) return [];

  const headers = lines[0].split(",");
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    data.push(parseCSVRow(row));
  }

  return data;
};

/**
 * Parse a CSV line handling quoted values
 */
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

/**
 * Load CSV file from public assets
 */
export const loadCSV = async (filename) => {
  try {
    const response = await fetch(`/assets/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error(`Error loading CSV file ${filename}:`, error);
    throw error;
  }
};

/**
 * Format number for display with Turkish format
 */
export const formatScore = (score) => {
  if (score === null || score === undefined) return "-";
  return score.toFixed(2).replace(".", ",");
};

/**
 * Format ranking for display
 */
export const formatRanking = (ranking) => {
  if (ranking === null || ranking === undefined) return "-";
  return Math.round(ranking).toLocaleString("tr-TR");
};
