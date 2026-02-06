/**
 * Token Store - Centralized token storage for non-React code
 *
 * This module provides a minimal interface for the API client (api.js)
 * that needs access to authentication tokens outside of React components.
 *
 * IMPORTANT: This store is SYNCED FROM AuthContext. Never set tokens directly
 * from outside AuthContext - it is the single source of truth.
 *
 * For React components: Use useAuth() hook from AuthContext
 * For API calls: Use api.js (which uses this tokenStore internally)
 */

// In-memory storage (not persisted, cleared on page refresh)
let accessToken = null;
let userId = null;

/**
 * Get the current access token
 * @returns {string|null} The access token or null if not authenticated
 */
export const getAccessToken = () => accessToken;

/**
 * Get the current user ID
 * @returns {string|null} The user ID or null if not authenticated
 */
export const getUserId = () => userId;

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => !!accessToken;

/**
 * Set auth data - ONLY called by AuthContext
 * @internal
 */
export const setTokens = (token, user) => {
  accessToken = token;
  userId = user;
};

/**
 * Clear all tokens - ONLY called by AuthContext
 * @internal
 */
export const clearTokens = () => {
  accessToken = null;
  userId = null;
};

/**
 * Refresh access token using HttpOnly cookie
 * Used by api.js when token expires
 */
export const refreshAccessToken = async () => {
  const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    clearTokens();
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Token refresh failed");
  }

  const data = await response.json();

  // Update in-memory tokens
  accessToken = data.access_token;
  userId = data.current_user_id;

  return data;
};
