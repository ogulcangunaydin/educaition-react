/**
 * Button Atom
 *
 * Wrapper around MUI Button with consistent styling and common variants.
 */

import React from "react";
import { Button as MuiButton, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";

const StyledButton = styled(MuiButton)(() => ({
  minWidth: 100,
  "&.MuiButton-sizeLarge": {
    padding: "12px 24px",
    fontSize: "1rem",
  },
}));

function Button({
  children,
  variant = "contained",
  color = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  onClick,
  type = "button",
  ...props
}) {
  return (
    <StyledButton
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || loading}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      fullWidth={fullWidth}
      onClick={onClick}
      type={type}
      {...props}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </StyledButton>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["contained", "outlined", "text"]),
  color: PropTypes.oneOf(["primary", "secondary", "success", "error", "warning", "info"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
};

export default Button;
