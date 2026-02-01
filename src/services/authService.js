/**
 * Auth Service - Legacy Compatibility Layer
 *
 * This service provides backward compatibility for code that hasn't migrated
 * to the new AuthContext-based authentication.
 *
 * MIGRATION NOTE: New code should use the useAuth() hook from AuthContext.
 * This service will be deprecated once all components have migrated.
 *
 * Security Model:
 * - Access tokens: Stored in memory (AuthContext state)
 * - Refresh tokens: HttpOnly cookie (managed by backend)
 * - Only username persists in localStorage (for UI convenience)
 */

const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

// Only store non-sensitive data in localStorage
const STORAGE_KEYS = {
  USERNAME: "username",
  UNIVERSITY_KEY: "universityKey",
};

// In-memory token storage for legacy compatibility
// This is a singleton - shared across all imports
let inMemoryAccessToken = null;
let inMemoryUserId = null;

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
 * Get access token from memory.
 *
 * For React components, prefer using useAuth().accessToken.
 * For utility functions (like fetchWithAuth), this is the correct approach.
 */
export const getAccessToken = () => {
  return inMemoryAccessToken;
};

/**
 * Get user ID from memory.
 *
 * For React components, prefer using useAuth().userId.
 * For utility functions, this is the correct approach.
 */
export const getUserId = () => {
  return inMemoryUserId;
};

/**
 * Check if user is authenticated (has access token in memory).
 *
 * For React components, prefer using useAuth().isAuthenticated.
 * For utility functions, this is the correct approach.
 */
export const isAuthenticated = () => {
  return !!inMemoryAccessToken;
};

/**
 * Clear all auth data
 */
export const clearAuthData = () => {
  inMemoryAccessToken = null;
  inMemoryUserId = null;
  localStorage.removeItem(STORAGE_KEYS.USERNAME);
  localStorage.removeItem(STORAGE_KEYS.UNIVERSITY_KEY);
};

/**
 * Store auth data in memory (called by AuthContext or login)
 * @internal Used by AuthContext, not for direct use
 */
export const setAuthData = (accessToken, userId) => {
  inMemoryAccessToken = accessToken;
  inMemoryUserId = userId;
};

/**
 * Login with username and password
 * Sets HttpOnly refresh cookie automatically via backend
 */
export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${BASE_URL}/authenticate`, {
    method: "POST",
    credentials: "include", // Receive HttpOnly cookie
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Store access token in memory only
  inMemoryAccessToken = data.access_token;
  inMemoryUserId = data.current_user_id;
  // Refresh token is automatically stored in HttpOnly cookie by backend

  storeUsername(username);

  return data;
};

/**
 * Refresh access token using HttpOnly cookie
 */
export const refreshAccessToken = async () => {
  const response = await fetch(`${BASE_URL}/refresh`, {
    method: "POST",
    credentials: "include", // Send HttpOnly cookie
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    clearAuthData();
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Token refresh failed");
  }

  const data = await response.json();

  // Update in-memory token
  inMemoryAccessToken = data.access_token;
  inMemoryUserId = data.current_user_id;

  return data;
};

/**
 * Logout - clear tokens and revoke on server
 */
export const logout = async (callApi = true) => {
  if (callApi) {
    try {
      if (inMemoryAccessToken) {
        await fetch(`${BASE_URL}/logout`, {
          method: "POST",
          credentials: "include", // Send refresh cookie to be cleared
          headers: {
            Authorization: `Bearer ${inMemoryAccessToken}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch {
      console.warn("Logout API call failed, clearing local data.");
    }
  }

  clearAuthData();
};

/**
 * Get a valid access token, refreshing if needed
 * @deprecated Use useAuth().getValidAccessToken() instead
 */
export const getValidAccessToken = async () => {
  if (!inMemoryAccessToken) {
    // Try to restore session via refresh token cookie
    try {
      await refreshAccessToken();
      return inMemoryAccessToken;
    } catch {
      throw new Error("No access token available");
    }
  }

  return inMemoryAccessToken;
};

/**
 * Try to restore session on app load
 * Called once on app initialization to restore session from refresh cookie
 */
export const tryRestoreSession = async () => {
  try {
    await refreshAccessToken();
    return true;
  } catch {
    return false;
  }
};

// Legacy exports for backward compatibility
export { STORAGE_KEYS as TOKEN_KEYS };

const authService = {
  login,
  logout,
  refreshAccessToken,
  getAccessToken,
  getUserId,
  getUsername,
  isAuthenticated,
  clearAuthData,
  storeUsername,
  getValidAccessToken,
  setAuthData,
  tryRestoreSession,
  TOKEN_KEYS: STORAGE_KEYS,
};

export default authService;
