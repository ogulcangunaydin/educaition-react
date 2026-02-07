/**
 * Program Service
 * Fetches university and program data from the backend API
 * Replaces CSV file loading with API calls
 */

import { API_BASE_URL } from "@config/env";

/**
 * Fetch all programs in flattened format (matches old CSV structure)
 * @param {Object} options - Optional filters
 * @param {number} options.year - Filter by year with data
 * @returns {Promise<Array>} Array of program objects
 */
export const fetchAllPrograms = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.year) {
    params.append("year", options.year);
  }

  const url = `${API_BASE_URL}/programs/all${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch programs: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Fetch programs with pagination and filtering
 * @param {Object} options - Search parameters
 * @param {number} options.universityId - Filter by university ID
 * @param {string} options.universityName - Filter by university name (partial match)
 * @param {string} options.puanType - Filter by score type (SAY, EA, SÖZ, DİL, TYT)
 * @param {number} options.year - Filter by year with data
 * @param {string} options.city - Filter by city
 * @param {string} options.programName - Filter by program name (partial match)
 * @param {number} options.minTbs - Minimum TBS (success ranking)
 * @param {number} options.maxTbs - Maximum TBS (success ranking)
 * @param {number} options.limit - Maximum results (default 100)
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<{programs: Array, total: number}>}
 */
export const fetchPrograms = async (options = {}) => {
  const params = new URLSearchParams();

  if (options.universityId) params.append("university_id", options.universityId);
  if (options.universityName) params.append("university_name", options.universityName);
  if (options.puanType) params.append("puan_type", options.puanType);
  if (options.year) params.append("year", options.year);
  if (options.city) params.append("city", options.city);
  if (options.programName) params.append("program_name", options.programName);
  if (options.minTbs !== undefined) params.append("min_tbs", options.minTbs);
  if (options.maxTbs !== undefined) params.append("max_tbs", options.maxTbs);
  if (options.limit) params.append("limit", options.limit);
  if (options.offset) params.append("offset", options.offset);

  const url = `${API_BASE_URL}/programs${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch programs: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch a single program by YOP code
 * @param {string} yopKodu - The program's YOP code
 * @returns {Promise<Object>} Program object
 */
export const fetchProgramByYopKodu = async (yopKodu) => {
  const url = `${API_BASE_URL}/programs/${encodeURIComponent(yopKodu)}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch program: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch all universities
 * @returns {Promise<{universities: Array, total: number}>}
 */
export const fetchUniversities = async () => {
  const url = `${API_BASE_URL}/universities`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch universities: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch all unique cities
 * @returns {Promise<Array<string>>}
 */
export const fetchCities = async () => {
  const url = `${API_BASE_URL}/universities/cities`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch cities: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch programs for a specific university
 * @param {number} universityId - University ID
 * @param {number} year - Optional year filter
 * @returns {Promise<Array>} Array of program objects
 */
export const fetchUniversityPrograms = async (universityId, year = null) => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);

  const url = `${API_BASE_URL}/universities/${universityId}/programs${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch university programs: ${response.statusText}`);
  }

  return response.json();
};

// Cache for program data to avoid repeated API calls
let programCache = null;
let programCacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all programs with caching
 * Used for components that need the full dataset (like UniversityComparison)
 * @param {boolean} forceRefresh - Force a fresh fetch
 * @returns {Promise<Array>} Array of program objects
 */
export const fetchAllProgramsCached = async (forceRefresh = false) => {
  const now = Date.now();

  if (
    !forceRefresh &&
    programCache &&
    programCacheTimestamp &&
    now - programCacheTimestamp < CACHE_TTL
  ) {
    return programCache;
  }

  const data = await fetchAllPrograms();
  programCache = data;
  programCacheTimestamp = now;

  return data;
};

/**
 * Clear the program cache
 */
export const clearProgramCache = () => {
  programCache = null;
  programCacheTimestamp = null;
};

// ===================== TERCIH STATS API =====================

/**
 * Fetch program prices by YOP code
 * @param {string} yopKodu - The program's YOP code
 * @returns {Promise<Array>} Array of price objects
 */
export const fetchProgramPrices = async (yopKodu) => {
  const url = `${API_BASE_URL}/tercih-stats/prices/${encodeURIComponent(yopKodu)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch program prices: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch all program prices with pagination
 * @param {number} skip - Offset for pagination
 * @param {number} limit - Maximum results (default 1000)
 * @returns {Promise<{items: Array, total: number}>}
 */
export const fetchAllPrices = async (skip = 0, limit = 10000) => {
  const url = `${API_BASE_URL}/tercih-stats/prices?skip=${skip}&limit=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch prices: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch tercih stats by YOP code
 * @param {string} yopKodu - The program's YOP code
 * @param {number} year - Optional year filter
 * @returns {Promise<Array>} Array of stats objects
 */
export const fetchTercihStats = async (yopKodu, year = null) => {
  let url = `${API_BASE_URL}/tercih-stats/stats/${encodeURIComponent(yopKodu)}`;
  if (year) url += `?year=${year}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch tercih stats: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch all tercih stats
 * @param {number} skip - Offset for pagination
 * @param {number} limit - Maximum results (default 1000)
 * @returns {Promise<{items: Array, total: number}>}
 */
export const fetchAllTercihStats = async (skip = 0, limit = 50000) => {
  const url = `${API_BASE_URL}/tercih-stats/stats?skip=${skip}&limit=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch all tercih stats: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch detailed tercih stats by YOP code
 * @param {string} yopKodu - The program's YOP code
 * @returns {Promise<Object>} Detailed stats object
 */
export const fetchTercihDetailedStats = async (yopKodu) => {
  const url = `${API_BASE_URL}/tercih-stats/detailed-stats/${encodeURIComponent(yopKodu)}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch tercih detailed stats: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch all tercih detailed stats
 * @param {number} skip - Offset for pagination
 * @param {number} limit - Maximum results (default 1000)
 * @returns {Promise<Array>}
 */
export const fetchAllTercihDetailedStats = async (skip = 0, limit = 15000) => {
  const url = `${API_BASE_URL}/tercih-stats/detailed-stats?skip=${skip}&limit=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch all tercih detailed stats: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch tercih preferences by YOP code
 * @param {string} yopKodu - The program's YOP code
 * @param {Object} options - Optional filters
 * @param {string} options.sourceUniversity - Filter by source university
 * @param {string} options.preferenceType - Filter by type: city, university, program
 * @param {number} options.year - Filter by year
 * @returns {Promise<Array>} Array of preference objects
 */
export const fetchTercihPreferences = async (yopKodu, options = {}) => {
  const params = new URLSearchParams();
  if (options.sourceUniversity) params.append("source_university", options.sourceUniversity);
  if (options.preferenceType) params.append("preference_type", options.preferenceType);
  if (options.year) params.append("year", options.year);

  const url = `${API_BASE_URL}/tercih-stats/preferences/${encodeURIComponent(yopKodu)}${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch tercih preferences: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch tercih preferences by source university
 * @param {string} sourceUniversity - Source university (e.g., "halic", "fsm")
 * @param {Object} options - Optional filters
 * @param {string} options.preferenceType - Filter by type: city, university, program
 * @param {number} options.year - Filter by year
 * @returns {Promise<Array>} Array of preference objects
 */
export const fetchPreferencesBySource = async (sourceUniversity, options = {}) => {
  const params = new URLSearchParams();
  if (options.preferenceType) params.append("preference_type", options.preferenceType);
  if (options.year) params.append("year", options.year);

  const url = `${API_BASE_URL}/tercih-stats/preferences/source/${encodeURIComponent(sourceUniversity)}${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch preferences by source: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch available source universities
 * @returns {Promise<Array<string>>}
 */
export const fetchSourceUniversities = async () => {
  const url = `${API_BASE_URL}/tercih-stats/source-universities`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch source universities: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch available years for tercih stats
 * @returns {Promise<Array<number>>}
 */
export const fetchTercihYears = async () => {
  const url = `${API_BASE_URL}/tercih-stats/years`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch tercih years: ${response.statusText}`);
  }

  return response.json();
};

// Caches for tercih data
let tercihStatsCache = null;
let tercihStatsCacheTimestamp = null;
let tercihDetailedStatsCache = null;
let tercihDetailedStatsCacheTimestamp = null;
let pricesCache = null;
let pricesCacheTimestamp = null;

/**
 * Fetch all tercih stats with caching (for components that need full dataset)
 * @param {boolean} forceRefresh - Force a fresh fetch
 * @returns {Promise<Array>}
 */
export const fetchAllTercihStatsCached = async (forceRefresh = false) => {
  const now = Date.now();

  if (
    !forceRefresh &&
    tercihStatsCache &&
    tercihStatsCacheTimestamp &&
    now - tercihStatsCacheTimestamp < CACHE_TTL
  ) {
    return tercihStatsCache;
  }

  const data = await fetchAllTercihStats();
  tercihStatsCache = data.items;
  tercihStatsCacheTimestamp = now;

  return tercihStatsCache;
};

/**
 * Fetch all tercih detailed stats with caching
 * @param {boolean} forceRefresh - Force a fresh fetch
 * @returns {Promise<Array>}
 */
export const fetchAllTercihDetailedStatsCached = async (forceRefresh = false) => {
  const now = Date.now();

  if (
    !forceRefresh &&
    tercihDetailedStatsCache &&
    tercihDetailedStatsCacheTimestamp &&
    now - tercihDetailedStatsCacheTimestamp < CACHE_TTL
  ) {
    return tercihDetailedStatsCache;
  }

  const data = await fetchAllTercihDetailedStats();
  tercihDetailedStatsCache = data;
  tercihDetailedStatsCacheTimestamp = now;

  return tercihDetailedStatsCache;
};

/**
 * Fetch all program prices with caching
 * @param {boolean} forceRefresh - Force a fresh fetch
 * @returns {Promise<Array>}
 */
export const fetchAllPricesCached = async (forceRefresh = false) => {
  const now = Date.now();

  if (
    !forceRefresh &&
    pricesCache &&
    pricesCacheTimestamp &&
    now - pricesCacheTimestamp < CACHE_TTL
  ) {
    return pricesCache;
  }

  const data = await fetchAllPrices();
  pricesCache = data.items;
  pricesCacheTimestamp = now;

  return pricesCache;
};

/**
 * Clear all tercih caches
 */
export const clearTercihCaches = () => {
  tercihStatsCache = null;
  tercihStatsCacheTimestamp = null;
  tercihDetailedStatsCache = null;
  tercihDetailedStatsCacheTimestamp = null;
  pricesCache = null;
  pricesCacheTimestamp = null;
};

// ===================== BATCH ENDPOINT =====================

/**
 * Fetch stats, prices, and/or detailed stats for specific yop_kodlari in a single request.
 * This replaces the pattern of fetching ALL records and filtering client-side.
 *
 * @param {string[]} yopKodlari - List of program YOP codes
 * @param {Object} options
 * @param {number} [options.year] - Filter stats by year
 * @param {boolean} [options.includeStats=true] - Include tercih stats
 * @param {boolean} [options.includePrices=false] - Include program prices
 * @param {boolean} [options.includeDetailedStats=false] - Include tercih detailed stats
 * @returns {Promise<{stats: Array, prices: Array, detailed_stats: Array}>}
 */
export const fetchBatchStats = async (yopKodlari, options = {}) => {
  const {
    year = null,
    includeStats = true,
    includePrices = false,
    includeDetailedStats = false,
  } = options;

  const url = `${API_BASE_URL}/tercih-stats/batch`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      yop_kodlari: yopKodlari,
      year,
      include_stats: includeStats,
      include_prices: includePrices,
      include_detailed_stats: includeDetailedStats,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch batch stats: ${response.statusText}`);
  }

  return response.json();
};
