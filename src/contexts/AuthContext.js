import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { ROLES } from "@config/permissions";
import { configureAuth } from "@services/api";
import { storeUniversityKey, clearLocalAuthData } from "@services/authService";
import { API_BASE_URL } from "@config/env";
const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000;

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;

  const expiresAt = payload.exp * 1000;
  return Date.now() >= expiresAt - TOKEN_REFRESH_BUFFER_MS;
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refs for synchronous access from api.js callbacks (no stale closures)
  const tokenRef = useRef(null);
  const refreshRef = useRef(null);

  const updateAuthState = useCallback((data) => {
    if (data) {
      const token = data.access_token;
      setAccessToken(token);
      tokenRef.current = token;
      setUser({
        id: data.current_user_id,
        role: data.role,
        university: data.university,
      });
      setIsAuthenticated(true);
      localStorage.setItem("access_token", token);
      storeUniversityKey(data.university);
    } else {
      setAccessToken(null);
      tokenRef.current = null;
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
      clearLocalAuthData();
    }
  }, []);

  /**
   * Single deduped refresh function.
   * Uses a ref-based promise so concurrent callers (timer, 401 retry, init)
   * all share one in-flight request. Critical because the backend rotates
   * (blacklists) the refresh token on every use.
   */
  const silentRefresh = useCallback(async () => {
    if (refreshRef.current) {
      return refreshRef.current;
    }

    const promise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          updateAuthState(null);
          return null;
        }

        const data = await response.json();
        updateAuthState(data);
        return data.access_token;
      } catch (error) {
        console.error("Silent refresh failed:", error);
        updateAuthState(null);
        return null;
      } finally {
        refreshRef.current = null;
      }
    })();

    refreshRef.current = promise;
    return promise;
  }, [updateAuthState]);

  const getValidAccessToken = useCallback(async () => {
    if (accessToken && !isTokenExpiringSoon(accessToken)) {
      return accessToken;
    }
    return silentRefresh();
  }, [accessToken, silentRefresh]);

  const login = useCallback(
    async (username, password) => {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/authenticate`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(error.detail || "Login failed");
      }

      const data = await response.json();
      updateAuthState(data);
      return data;
    },
    [updateAuthState]
  );

  const logout = useCallback(async () => {
    try {
      if (tokenRef.current) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      updateAuthState(null);
    }
  }, [updateAuthState]);

  /**
   * Authenticate an anonymous user by device fingerprint.
   * Finds or creates a student-role user on the backend, then stores
   * the returned JWT pair just like a regular login.
   */
  const deviceLogin = useCallback(
    async (deviceId) => {
      const response = await fetch(`${API_BASE_URL}/auth/device-login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: deviceId }),
      });

      if (!response.ok) {
        throw new Error("Device login failed");
      }

      const data = await response.json();
      updateAuthState(data);
      return data;
    },
    [updateAuthState]
  );

  // Register auth callbacks with the API client once on mount
  useEffect(() => {
    configureAuth({
      getToken: () => tokenRef.current,
      refreshToken: () => silentRefresh(),
      onAuthFailure: () => updateAuthState(null),
    });
  }, [silentRefresh, updateAuthState]);

  // Initial session restore from HttpOnly cookie
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Only attempt refresh if a previous session existed.
        // The refresh token is an HttpOnly cookie (not readable from JS),
        // so we use the stored access_token as a proxy indicator.
        const hadSession = localStorage.getItem("access_token");
        if (hadSession) {
          await silentRefresh();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Proactive token refresh before expiry
  useEffect(() => {
    if (!accessToken || !isAuthenticated) return;

    const payload = parseJwt(accessToken);
    if (!payload || !payload.exp) return;

    const expiresAt = payload.exp * 1000;
    const refreshAt = expiresAt - TOKEN_REFRESH_BUFFER_MS;
    const delay = refreshAt - Date.now();

    if (delay <= 0) {
      silentRefresh();
      return;
    }

    const timeoutId = setTimeout(() => {
      silentRefresh();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [accessToken, isAuthenticated, silentRefresh]);

  const hasRole = useCallback(
    (...roles) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const isAdmin = useMemo(() => hasRole(ROLES.ADMIN), [hasRole]);
  const isTeacher = useMemo(() => hasRole(ROLES.TEACHER), [hasRole]);
  const isTeacherOrAdmin = useMemo(() => hasRole(ROLES.ADMIN, ROLES.TEACHER), [hasRole]);
  const isViewer = useMemo(() => hasRole(ROLES.VIEWER), [hasRole]);

  const canAccessUniversity = useCallback(
    (universityKey) => {
      if (!user) return false;
      if (user.role === ROLES.ADMIN) return true;
      return user.university === universityKey;
    },
    [user]
  );

  const value = useMemo(
    () => ({
      accessToken,
      user,
      userId: user?.id,
      role: user?.role,
      university: user?.university,
      isAuthenticated,
      isLoading,
      login,
      logout,
      deviceLogin,
      getValidAccessToken,
      silentRefresh,
      hasRole,
      isAdmin,
      isTeacher,
      isTeacherOrAdmin,
      isViewer,
      canAccessUniversity,
    }),
    [
      accessToken,
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      deviceLogin,
      getValidAccessToken,
      silentRefresh,
      hasRole,
      isAdmin,
      isTeacher,
      isTeacherOrAdmin,
      isViewer,
      canAccessUniversity,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
