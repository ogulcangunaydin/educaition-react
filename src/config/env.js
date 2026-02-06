/**
 * Environment Configuration
 *
 * Centralized access to environment variables.
 * Vite uses import.meta.env.VITE_* for environment variables.
 */

export const ENV = {
  BACKEND_BASE_URL: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8000/api",
  FRONTEND_BASE_URL: import.meta.env.VITE_FRONTEND_BASE_URL || "http://localhost:8080",
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
};

// Aliases for backward compatibility
export const API_BASE_URL = ENV.BACKEND_BASE_URL;
export const FRONTEND_BASE_URL = ENV.FRONTEND_BASE_URL;

export default ENV;
