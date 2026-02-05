import { getAccessToken, refreshAccessToken, clearAuthData } from "../services/authService";

let isRefreshing = false;
let refreshPromise = null;

const performTokenRefresh = async () => {
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken()
    .then((result) => {
      isRefreshing = false;
      refreshPromise = null;
      return result;
    })
    .catch((error) => {
      isRefreshing = false;
      refreshPromise = null;
      throw error;
    });

  return refreshPromise;
};

const handleRateLimit = (response) => {
  const retryAfter = response.headers.get("Retry-After");
  console.warn(`Rate limited. Retry after ${retryAfter || 60} seconds.`);
  return false;
};

const parseErrorResponse = async (response) => {
  try {
    const data = await response.json();
    return {
      detail: data.detail || "An error occurred",
      error_code: data.error_code || "unknown_error",
    };
  } catch {
    return {
      detail: response.statusText || "An error occurred",
      error_code: "parse_error",
    };
  }
};

const redirectToLogin = () => {
  clearAuthData();
  window.location.href = "/login";
};

const fetchWithAuth = async (url, options = {}, _isRetry = false) => {
  const accessToken = getAccessToken();

  if (!accessToken && !_isRetry) {
    try {
      await performTokenRefresh();
    } catch {
      redirectToLogin();
      return undefined;
    }
  }

  const currentToken = getAccessToken();
  const method = options.method || "GET";

  const headers = {
    ...options.headers,
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const body =
    options.body && typeof options.body === "object" && method !== "GET"
      ? JSON.stringify(options.body)
      : options.body;

  try {
    const response = await fetch(url, {
      ...options,
      method,
      headers,
      body,
      credentials: "include",
    });

    if (response.status === 429) {
      handleRateLimit(response);
      const error = await parseErrorResponse(response);
      throw new Error(error.detail);
    }

    if (response.status === 401 && !_isRetry) {
      const error = await parseErrorResponse(response.clone());

      if (error.error_code === "token_blacklisted") {
        console.debug("Token has been revoked, logging out.");
        redirectToLogin();
        return undefined;
      }

      try {
        await performTokenRefresh();
        return fetchWithAuth(url, options, true);
      } catch (err) {
        console.debug("Token refresh failed after 401, logging out.", err);
        redirectToLogin();
        return undefined;
      }
    }

    if (response.status === 403) {
      const error = await parseErrorResponse(response.clone());
      console.warn("Access forbidden:", error.detail);
    }

    return response;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export default fetchWithAuth;
