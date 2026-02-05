/**
 * Program Service
 * Fetches university and program data from the backend API
 * Replaces CSV file loading with API calls
 */

const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

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
