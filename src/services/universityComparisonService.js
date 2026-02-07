/**
 * University Comparison Service
 *
 * Thin client for the /university-comparison backend endpoints.
 * Replaces the old approach of loading ALL programs / prices / preferences
 * on mount and filtering in JS.
 */

import { API_BASE_URL } from "@config/env";

/**
 * Fetch the user's own university programs for a given year.
 * Used to populate the program selector dropdown.
 *
 * @param {string} universityName - e.g. "HALİÇ ÜNİVERSİTESİ"
 * @param {string} year           - e.g. "2024"
 * @returns {Promise<Array>}  Array of ProgramFlat objects
 */
export const fetchOwnPrograms = async (universityName, year) => {
  const params = new URLSearchParams({
    university_name: universityName,
    year,
  });

  const res = await fetch(`${API_BASE_URL}/university-comparison/programs?${params}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch programs: ${res.statusText}`);
  }

  return res.json();
};

/**
 * Run the comparison query. The server does ALL filtering:
 *   – find similar programs by metric range
 *   – apply preference-based filters
 *   – apply manual exclusions
 *   – compute frequency histograms for sliders
 *   – collect price data
 *
 * @param {Object} params  – maps 1-to-1 to CompareRequest schema
 * @returns {Promise<Object>}  CompareResponse
 */
export const comparePrograms = async (params) => {
  const res = await fetch(`${API_BASE_URL}/university-comparison/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Comparison failed: ${res.statusText}`);
  }

  return res.json();
};
