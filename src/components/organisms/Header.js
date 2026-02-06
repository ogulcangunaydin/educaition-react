/**
 * Header Organism
 *
 * Main application header with navigation, language switcher, and logout.
 */

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button as MuiButton,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Logout, Menu, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/AuthContext";
import LanguageSwitcher from "../molecules/LanguageSwitcher";

function Header({
  title,
  children,
  showLogout = true,
  showLogo = true,
  showLanguageSwitcher = true,
  showBackButton = false,
  onBack,
  logoSrc = "/halic_universitesi_logo.svg",
  onMenuClick,
}) {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "primary.light" }}>
      <Toolbar>
        {/* Back button */}
        {showBackButton && (
          <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
        )}

        {/* Menu button for mobile */}
        {onMenuClick && isMobile && (
          <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 1 }}>
            <Menu />
          </IconButton>
        )}

        {/* Logo */}
        {showLogo && (
          <Box
            component="img"
            src={logoSrc}
            alt="Logo"
            sx={{
              height: 40,
              mr: 2,
            }}
          />
        )}

        {/* Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {children}

          {/* Language Switcher */}
          {showLanguageSwitcher && <LanguageSwitcher variant="flag" />}

          {/* Logout button */}
          {showLogout &&
            isAuthenticated &&
            (isMobile ? (
              <IconButton color="inherit" onClick={handleLogout}>
                <Logout />
              </IconButton>
            ) : (
              <MuiButton
                color="inherit"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ ml: 1 }}
              >
                {t("header.logout")}
              </MuiButton>
            ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  showLogout: PropTypes.bool,
  showLogo: PropTypes.bool,
  showLanguageSwitcher: PropTypes.bool,
  showBackButton: PropTypes.bool,
  onBack: PropTypes.func,
  logoSrc: PropTypes.string,
  onMenuClick: PropTypes.func,
};

export default Header;
