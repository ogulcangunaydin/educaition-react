const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

export const AUTH_TYPES = {
  NONE: "none",
  USER: "user",
  PLAYER: "player",
  DISSONANCE_TEST: "dissonance_test",
  PROGRAM_SUGGESTION: "program_suggestion",
};

let tokenGetter = () => localStorage.getItem("access_token");

export const setTokenGetter = (getter) => {
  tokenGetter = getter;
};

const getToken = () => tokenGetter();

const buildHeaders = (authType, customHeaders = {}) => {
  const headers = { ...customHeaders };

  if (authType === AUTH_TYPES.USER) {
    const token = getToken();
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

const apiFetch = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body,
    authType = AUTH_TYPES.NONE,
    headers: customHeaders = {},
    ...rest
  } = options;

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  const headers = buildHeaders(authType, customHeaders);

  let processedBody = body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    processedBody = typeof body === "object" ? JSON.stringify(body) : body;
  }

  const fetchOptions = {
    method,
    headers,
    ...rest,
  };

  if (
    [AUTH_TYPES.PLAYER, AUTH_TYPES.DISSONANCE_TEST, AUTH_TYPES.PROGRAM_SUGGESTION].includes(
      authType
    )
  ) {
    fetchOptions.credentials = "include";
  }

  if (processedBody && method !== "GET") {
    fetchOptions.body = processedBody;
  }

  const response = await fetch(url, fetchOptions);

  return {
    ok: response.ok,
    status: response.status,
    data: await parseResponse(response),
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
