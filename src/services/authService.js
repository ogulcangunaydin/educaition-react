/**
 * Auth Utilities
 *
 * Simple utility functions for authentication-related tasks.
 * For authentication state and token management, use:
 * - React components: useAuth() hook from AuthContext
 * - Non-React code: tokenStore from utils/tokenStore
 */

const STORAGE_KEYS = {
  USERNAME: "username",
  UNIVERSITY_KEY: "universityKey",
};

/**
 * Store username in localStorage (non-sensitive, for UI convenience)
 */
export const storeUsername = (username) => {
  localStorage.setItem(STORAGE_KEYS.USERNAME, username);
};

/**
 * Get stored username
 */
export const getUsername = () => {
  return localStorage.getItem(STORAGE_KEYS.USERNAME);
};

/**
 * Clear username from localStorage
 */
export const clearUsername = () => {
  localStorage.removeItem(STORAGE_KEYS.USERNAME);
};

/**
 * Store university key in localStorage
 */
export const storeUniversityKey = (key) => {
  if (key) {
    localStorage.setItem(STORAGE_KEYS.UNIVERSITY_KEY, key);
  }
};

/**
 * Get stored university key
 */
export const getStoredUniversityKey = () => {
  return localStorage.getItem(STORAGE_KEYS.UNIVERSITY_KEY);
};

/**
 * Clear university key from localStorage
 */
export const clearUniversityKey = () => {
  localStorage.removeItem(STORAGE_KEYS.UNIVERSITY_KEY);
};

/**
 * Clear all auth-related data from localStorage
 */
export const clearLocalAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.USERNAME);
  localStorage.removeItem(STORAGE_KEYS.UNIVERSITY_KEY);
};

export { STORAGE_KEYS };
