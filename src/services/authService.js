const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_ID: "current_user_id",
  USERNAME: "username",
  TOKEN_EXPIRY: "token_expiry",
};

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

export const storeAuthData = (data) => {
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.access_token);
  localStorage.setItem(TOKEN_KEYS.USER_ID, data.current_user_id);

  if (data.refresh_token) {
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, data.refresh_token);
  }

  if (data.expires_in) {
    const expiryTime = Date.now() + data.expires_in * 1000;
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  }
};

export const storeUsername = (username) => {
  localStorage.setItem(TOKEN_KEYS.USERNAME, username);
};

export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
};

export const getRefreshToken = () => {
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

export const getUserId = () => {
  return localStorage.getItem(TOKEN_KEYS.USER_ID);
};

export const getUsername = () => {
  return localStorage.getItem(TOKEN_KEYS.USERNAME);
};

export const isAuthenticated = () => {
  return !!getAccessToken();
};

export const isTokenExpiringSoon = () => {
  const expiryTime = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
  if (!expiryTime) return false;

  const timeUntilExpiry = parseInt(expiryTime, 10) - Date.now();
  return timeUntilExpiry < REFRESH_THRESHOLD_MS;
};

export const isTokenExpired = () => {
  const expiryTime = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
  if (!expiryTime) return false;

  return Date.now() > parseInt(expiryTime, 10);
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.USER_ID);
  localStorage.removeItem(TOKEN_KEYS.USERNAME);
  localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
  localStorage.removeItem("universityKey");
};

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${BASE_URL}/authenticate`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  storeAuthData(data);
  storeUsername(username);

  return data;
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${BASE_URL}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearAuthData();
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Token refresh failed");
  }

  const data = await response.json();

  storeAuthData({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    current_user_id: getUserId(),
    expires_in: data.expires_in,
  });

  return data;
};

export const logout = async (callApi = true) => {
  if (callApi) {
    try {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (accessToken) {
        await fetch(`${BASE_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch {
      console.warn("Logout API call failed, clearing local data.");
    }
  }

  clearAuthData();
};

export const getValidAccessToken = async () => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("No access token available");
  }

  if (isTokenExpiringSoon() || isTokenExpired()) {
    try {
      await refreshAccessToken();
      return getAccessToken();
    } catch {
      return accessToken;
    }
  }

  return accessToken;
};

export { TOKEN_KEYS };

const authService = {
  login,
  logout,
  refreshAccessToken,
  getAccessToken,
  getRefreshToken,
  getUserId,
  getUsername,
  isAuthenticated,
  isTokenExpiringSoon,
  isTokenExpired,
  clearAuthData,
  storeAuthData,
  storeUsername,
  getValidAccessToken,
  TOKEN_KEYS,
};

export default authService;
