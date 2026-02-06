/**
 * Login Page
 *
 * Unified login component that supports both:
 * - /login - Educaition login for teachers/admins → redirects to dashboard
 * - /login-halic - Halic login for viewers → redirects to university comparison
 *
 * Uses AuthLayout template with configurable branding.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useUniversity } from "@contexts/UniversityContext";
import { useAuth } from "@contexts/AuthContext";
import { storeUsername, getUserRole, getUserUniversity } from "@services/authService";
import AuthLayout from "@templates/AuthLayout";
import Button from "@atoms/Button";
import TextField from "@atoms/TextField";
import Alert from "@atoms/Alert";
import { LanguageSwitcher } from "@molecules";

// Login variants configuration
const LOGIN_VARIANTS = {
  educaition: {
    logo: "/educaition_logo.svg", // Placeholder - will use default if not exists
    fallbackLogo: "/halic_universitesi_logo.svg",
    allowedRoles: ["admin", "teacher"],
    redirectPath: "/dashboard",
    translationKey: "educaition",
  },
  halic: {
    logo: "/halic_universitesi_logo.svg",
    allowedRoles: ["viewer", "admin", "teacher"],
    redirectPath: "/university-comparison",
    translationKey: "halic",
  },
};

function Login({ variant = "educaition" }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setUniversityKey } = useUniversity();
  const { login } = useAuth();

  const config = LOGIN_VARIANTS[variant] || LOGIN_VARIANTS.educaition;
  const currentYear = new Date().getFullYear();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);

      // Store username for UI convenience (non-sensitive)
      storeUsername(username);

      // Get role and university from backend response
      const role = getUserRole();
      const university = getUserUniversity();

      // Set university from backend response
      if (university) {
        setUniversityKey(university);
      }

      const roleLower = role?.toLowerCase();

      // Role-based access control based on login variant
      if (variant === "educaition") {
        // Standard login: only admin and teacher
        if (roleLower === "viewer") {
          setError(t("auth.viewerNotAllowed"));
          setLoading(false);
          return;
        }
        if (roleLower === "student") {
          setError(t("auth.studentNotAllowed"));
          setLoading(false);
          return;
        }
        navigate("/dashboard");
      } else if (variant === "halic") {
        // Halic login: viewers go to university comparison
        // Admin/teacher can also use this but will be redirected to comparison
        if (roleLower === "student") {
          setError(t("auth.studentNotAllowed"));
          setLoading(false);
          return;
        }
        navigate("/university-comparison");
      }
    } catch (err) {
      setError(err.message || t("auth.loginError"));
      setLoading(false);
    }
  };

  // Determine which logo to use
  const logoSrc = config.logo;

  return (
    <AuthLayout
      title={t(`auth.${config.translationKey}.welcomeTitle`)}
      subtitle={t(`auth.${config.translationKey}.welcomeSubtitle`)}
      logoSrc={logoSrc}
      headerActions={<LanguageSwitcher variant="flag" />}
    >
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label={t("auth.username")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          fullWidth
          disabled={loading}
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
          autoComplete="username"
        />

        <TextField
          label={t("auth.password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          disabled={loading}
          sx={{ mb: 3 }}
          InputLabelProps={{ shrink: true }}
          autoComplete="current-password"
        />

        <Button type="submit" variant="contained" fullWidth size="large" loading={loading}>
          {t("auth.signIn")}
        </Button>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
        sx={{ mt: 3, display: "block" }}
      >
        {t(`auth.${config.translationKey}.copyright`, { year: currentYear })}
      </Typography>
    </AuthLayout>
  );
}

Login.propTypes = {
  variant: PropTypes.oneOf(["educaition", "halic"]),
};

export default Login;
