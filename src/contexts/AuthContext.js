import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { ROLES } from "@config/permissions";

const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
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
  const [refreshPromise, setRefreshPromise] = useState(null);

  const updateAuthState = useCallback((data) => {
    if (data) {
      setAccessToken(data.access_token);
      setUser({
        id: data.current_user_id,
        role: data.role,
        university: data.university,
      });
      setIsAuthenticated(true);
      localStorage.setItem("access_token", data.access_token);
    } else {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
    }
  }, []);

  const silentRefresh = useCallback(async () => {
    if (refreshPromise) {
      return refreshPromise;
    }

    const promise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          updateAuthState(data);
          return data.access_token;
        } else {
          updateAuthState(null);
          return null;
        }
      } catch (error) {
        console.error("Silent refresh failed:", error);
        updateAuthState(null);
        return null;
      } finally {
        setRefreshPromise(null);
      }
    })();

    setRefreshPromise(promise);
    return promise;
  }, [refreshPromise, updateAuthState]);

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
      if (accessToken) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      updateAuthState(null);
    }
  }, [accessToken, updateAuthState]);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        await silentRefresh();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
