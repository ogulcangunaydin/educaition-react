/**
 * Enum Service - Fetches controlled values from backend API.
 *
 * This service provides a single source of truth for dropdown options
 * and controlled values, eliminating hardcoded lists in the frontend.
 */

const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

// Cache for enum values to avoid repeated API calls
let enumsCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all enums from the API.
 * Results are cached to avoid repeated API calls.
 *
 * @returns {Promise<Object>} Object containing all enum categories
 */
export const fetchEnums = async () => {
  // Return cached data if still valid
  if (enumsCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL) {
    return enumsCache;
  }

  const response = await fetch(`${BASE_URL}/api/enums`);
  if (!response.ok) {
    throw new Error(`Failed to fetch enums: ${response.statusText}`);
  }
  enumsCache = await response.json();
  cacheTimestamp = Date.now();
  return enumsCache;
};

/**
 * Fetch a specific enum by name.
 *
 * @param {string} enumName - The name of the enum to fetch
 * @returns {Promise<Array>} Array of {value, label} options
 */
export const fetchEnumByName = async (enumName) => {
  const enums = await fetchEnums();
  return enums[enumName] || [];
};

/**
 * Clear the enum cache.
 * Useful when you need to force a refresh of enum values.
 */
export const clearEnumCache = () => {
  enumsCache = null;
  cacheTimestamp = null;
};

// Export individual enum getters for convenience
export const getGenders = () => fetchEnumByName("genders");
export const getClassYears = () => fetchEnumByName("classYears");
export const getScoreAreas = () => fetchEnumByName("scoreAreas");
export const getScoreDistributions = () => fetchEnumByName("scoreDistributions");
export const getPreferredLanguages = () => fetchEnumByName("preferredLanguages");
export const getCities = () => fetchEnumByName("cities");
export const getEducationLevels = () => fetchEnumByName("educationLevels");
export const getStarSigns = () => fetchEnumByName("starSigns");
export const getRiasecAnswers = () => fetchEnumByName("riasecAnswers");
