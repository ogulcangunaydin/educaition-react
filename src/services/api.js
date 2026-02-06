/**
 * Centralized API Client
 *
 * This is the ONLY module that should make HTTP requests to the backend.
 * All services should use this client instead of fetch or fetchWithAuth.
 *
 * Features:
 * - Automatic token refresh on 401
 * - Consistent error handling
 * - Support for different auth types (user, participant, etc.)
 *
 * Auth is provided by AuthContext via configureAuth() — this module
 * has no knowledge of where tokens come from.
 */

import { API_BASE_URL } from "@config/env";

const BASE_URL = API_BASE_URL;

export const AUTH_TYPES = {
  NONE: "none",
  USER: "user",
  PLAYER: "player",
  DISSONANCE_TEST: "dissonance_test",
  PROGRAM_SUGGESTION: "program_suggestion",
};

// Auth provider — registered by AuthContext on mount
let authProvider = {
  getToken: () => null,
  refreshToken: async () => {
    throw new Error("Auth not configured");
  },
  onAuthFailure: () => {
    window.location.href = "/login";
  },
};

/**
 * Register auth callbacks. Called once by AuthContext on mount.
 * This is the bridge between React auth state and the plain-JS API client.
 */
export const configureAuth = (provider) => {
  authProvider = { ...authProvider, ...provider };
};

const performTokenRefresh = () => authProvider.refreshToken();

const redirectToLogin = () => {
  authProvider.onAuthFailure();
};

const buildHeaders = (authType, customHeaders = {}) => {
  const headers = { ...customHeaders };

  if (authType === AUTH_TYPES.USER) {
    const token = authProvider.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const apiFetch = async (endpoint, options = {}, _isRetry = false) => {
  const {
    method = "GET",
    body,
    authType = AUTH_TYPES.NONE,
    headers: customHeaders = {},
    ...rest
  } = options;

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  // For authenticated requests without token, try refresh first
  if (authType === AUTH_TYPES.USER && !authProvider.getToken() && !_isRetry) {
    try {
      await performTokenRefresh();
    } catch {
      redirectToLogin();
      throw new Error("Authentication required");
    }
  }

  const headers = buildHeaders(authType, customHeaders);

  let processedBody = body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    processedBody = typeof body === "object" ? JSON.stringify(body) : body;
  }

  const fetchOptions = {
    method,
    headers,
    credentials: "include", // Always include credentials for cookie-based refresh
    ...rest,
  };

  if (processedBody && method !== "GET") {
    fetchOptions.body = processedBody;
  }

  const response = await fetch(url, fetchOptions);

  // Handle 401 - try to refresh token and retry
  if (response.status === 401 && authType === AUTH_TYPES.USER && !_isRetry) {
    const errorData = await response.json().catch(() => ({}));

    // If token is blacklisted, redirect to login
    if (errorData.error_code === "token_blacklisted") {
      redirectToLogin();
      throw new Error("Session expired");
    }

    // Try to refresh and retry the request
    try {
      await performTokenRefresh();
      return apiFetch(endpoint, options, true);
    } catch {
      redirectToLogin();
      throw new Error("Session expired");
    }
  }

  // Handle rate limiting
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    console.warn(`Rate limited. Retry after ${retryAfter || 60} seconds.`);
  }

  const data = await parseResponse(response.clone());

  return {
    ok: response.ok,
    status: response.status,
    data,
    headers: response.headers,
  };
};

const api = {
  get: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) => apiFetch(endpoint, { ...options, method: "POST", body }),
  put: (endpoint, body, options = {}) => apiFetch(endpoint, { ...options, method: "PUT", body }),
  delete: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: "DELETE" }),

  auth: {
    get: (endpoint, options = {}) =>
      apiFetch(endpoint, { ...options, method: "GET", authType: AUTH_TYPES.USER }),
    post: (endpoint, body, options = {}) =>
      apiFetch(endpoint, { ...options, method: "POST", body, authType: AUTH_TYPES.USER }),
    put: (endpoint, body, options = {}) =>
      apiFetch(endpoint, { ...options, method: "PUT", body, authType: AUTH_TYPES.USER }),
    delete: (endpoint, options = {}) =>
      apiFetch(endpoint, { ...options, method: "DELETE", authType: AUTH_TYPES.USER }),
  },

  participant: (type) => ({
    get: (endpoint, options = {}) =>
      apiFetch(endpoint, { ...options, method: "GET", authType: type }),
    post: (endpoint, body, options = {}) =>
      apiFetch(endpoint, { ...options, method: "POST", body, authType: type }),
    put: (endpoint, body, options = {}) =>
      apiFetch(endpoint, { ...options, method: "PUT", body, authType: type }),
    delete: (endpoint, options = {}) =>
      apiFetch(endpoint, { ...options, method: "DELETE", authType: type }),
  }),

  deviceTracking: {
    checkCompletion: async (deviceId, testType, roomId = null) => {
      return apiFetch("/api/device-tracking/check", {
        method: "POST",
        body: {
          device_id: deviceId,
          test_type: testType,
          room_id: roomId ? parseInt(roomId, 10) : null,
        },
      });
    },
    markCompletion: async (deviceId, testType, roomId = null) => {
      return apiFetch("/api/device-tracking/mark", {
        method: "POST",
        body: {
          device_id: deviceId,
          test_type: testType,
          room_id: roomId ? parseInt(roomId, 10) : null,
        },
      });
    },
    getDeviceCompletions: async (deviceId) => {
      return apiFetch(`/api/device-tracking/device/${deviceId}`, {
        method: "GET",
      });
    },
  },
};

export default api;
