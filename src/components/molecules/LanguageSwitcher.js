/**
 * LanguageSwitcher Component
 *
 * A dropdown/button to switch between available languages.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { Language } from "@mui/icons-material";
import { languages } from "../../i18n";

function LanguageSwitcher({ variant = "icon", size = "medium" }) {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    handleClose();
  };

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <>
      <Tooltip title={currentLang.name}>
        <IconButton
          onClick={handleClick}
          size={size}
          color="inherit"
          aria-controls={open ? "language-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          {variant === "flag" ? (
            <span style={{ fontSize: size === "small" ? "1rem" : "1.25rem" }}>
              {currentLang.flag}
            </span>
          ) : (
            <Language />
          )}
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "language-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={i18n.language === lang.code}
          >
            <ListItemIcon>
              <span style={{ fontSize: "1.25rem" }}>{lang.flag}</span>
            </ListItemIcon>
            <ListItemText>{lang.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default LanguageSwitcher;
