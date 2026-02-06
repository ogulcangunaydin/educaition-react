/**
 * Lise (High School) Service
 * Fetches lise placement data from the backend API
 */

import { API_BASE_URL } from "@config/env";

/**
 * Fetch lise ID to info mapping
 * @param {string} yearGroup - Optional year group filter: "2022-2024" or "2025"
 * @returns {Promise<Object>} Mapping: lise_id -> {lise_adi, sehir}
 */
export const fetchLiseMapping = async (yearGroup = null) => {
  const params = new URLSearchParams();
  if (yearGroup) {
    params.append("year_group", yearGroup);
  }

  const url = `${API_BASE_URL}/lise/mapping${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch lise mapping: ${response.statusText}`);
  }

  const data = await response.json();
  return data.mapping;
};

/**
 * Fetch university name to slug mapping
 * @returns {Promise<Object>} Mapping: display_name -> slug
 */
export const fetchUniversityMapping = async () => {
  const url = `${API_BASE_URL}/lise/university-mapping`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch university mapping: ${response.statusText}`);
  }

  const data = await response.json();
  return data.mapping;
};

/**
 * Fetch list of universities with lise data
 * @returns {Promise<string[]>} List of university slugs
 */
export const fetchUniversitiesWithLiseData = async () => {
  const url = `${API_BASE_URL}/lise/universities`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch universities: ${response.statusText}`);
  }

  const data = await response.json();
  return data.universities;
};

/**
 * Fetch lise placements for given program YOP codes
 * @param {string[]} yopKodlari - Array of YOP codes
 * @param {number} year - Optional year filter
 * @param {Object} options - Pagination options
 * @returns {Promise<{items: Array, total: number}>}
 */
export const fetchPlacementsByPrograms = async (yopKodlari, year = null, options = {}) => {
  const params = new URLSearchParams();
  params.append("yop_kodlari", yopKodlari.join(","));
  if (year) {
    params.append("year", year);
  }
  if (options.skip) {
    params.append("skip", options.skip);
  }
  if (options.limit) {
    params.append("limit", options.limit);
  }

  const url = `${API_BASE_URL}/lise/placements?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch placements: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch lise placements for a specific university
 * @param {string} universitySlug - University slug (e.g., "istanbul_universitesi")
 * @param {number} year - Optional year filter
 * @param {Object} options - Pagination options
 * @returns {Promise<{items: Array, total: number}>}
 */
export const fetchPlacementsByUniversity = async (universitySlug, year = null, options = {}) => {
  const params = new URLSearchParams();
  if (year) {
    params.append("year", year);
  }
  if (options.skip) {
    params.append("skip", options.skip);
  }
  if (options.limit) {
    params.append("limit", options.limit);
  }

  const url = `${API_BASE_URL}/lise/placements/university/${encodeURIComponent(universitySlug)}${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch placements: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch score ranking distribution
 * @returns {Promise<Object>} Distribution data by puan type
 */
export const fetchScoreRankingDistribution = async () => {
  const url = `${API_BASE_URL}/lise/score-ranking-distribution`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch score ranking distribution: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
};
