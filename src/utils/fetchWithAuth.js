import {
  getAccessToken,
  refreshAccessToken,
  isTokenExpiringSoon,
  clearAuthData,
} from "../services/authService";

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

const fetchWithAuth = async (url, options = {}, _isRetry = false) => {
  if (!_isRetry && isTokenExpiringSoon()) {
    try {
      await performTokenRefresh();
    } catch (err) {
      console.debug("Proactive token refresh failed, continuing", err);
    }
  }

  const accessToken = getAccessToken();

  const method = options.method || "GET";

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  if (options.body) {
    headers["Content-Type"] = options.headers?.["Content-Type"] || "application/json";
  }

  const body = options.body && method === "POST" ? JSON.stringify(options.body) : options.body;

  try {
    const response = await fetch(url, { ...options, method, headers, body });

    if (response.status === 401 && !_isRetry) {
      try {
        await performTokenRefresh();
        return fetchWithAuth(url, options, true);
      } catch (err) {
        console.debug("Token refresh failed after 401, logging out.", err);
        clearAuthData();
        window.location.href = "/login";
        return undefined;
      }
    }

    return response;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export default fetchWithAuth;
