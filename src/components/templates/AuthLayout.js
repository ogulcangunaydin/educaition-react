/**
 * AuthLayout Template
 *
 * Layout for authentication pages (login, register, etc.)
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import Logo from "../atoms/Logo";
import Typography from "../atoms/Typography";

const AuthContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  position: "relative",
  overflow: "hidden",
  padding: theme.spacing(2),
}));

const HeaderActions = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const AuthCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  backgroundColor: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(10px)",
  zIndex: 1,
  minWidth: 400,
  maxWidth: 480,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    minWidth: "auto",
    padding: theme.spacing(3),
  },
}));

const BackgroundDecoration = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "600px",
  height: "600px",
  borderRadius: "50%",
  background: `radial-gradient(circle, ${theme.palette.primary.light}33 0%, transparent 70%)`,
  "&.top-right": {
    top: "-200px",
    right: "-200px",
  },
  "&.bottom-left": {
    bottom: "-200px",
    left: "-200px",
  },
}));

function AuthLayout({
  children,
  logoSrc = "/halic_universitesi_logo.svg",
  title,
  subtitle,
  headerActions,
  ...props
}) {
  return (
    <AuthContainer {...props}>
      <BackgroundDecoration className="top-right" />
      <BackgroundDecoration className="bottom-left" />

      {headerActions && <HeaderActions>{headerActions}</HeaderActions>}

      <AuthCard elevation={0}>
        <Logo src={logoSrc} size="xlarge"/>

        {title && (
          <Typography variant="h5" align="center" gutterBottom>
            {title}
          </Typography>
        )}

        {subtitle && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
        )}

        <Box sx={{ width: "100%" }}>{children}</Box>
      </AuthCard>
    </AuthContainer>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node,
  logoSrc: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  headerActions: PropTypes.node,
};

export default AuthLayout;
