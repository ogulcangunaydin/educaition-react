/**
 * Alert Atom
 *
 * Wrapper around MUI Alert with consistent styling.
 */

import React from "react";
import { Alert as MuiAlert, AlertTitle } from "@mui/material";
import PropTypes from "prop-types";

function Alert({
  severity = "info",
  title,
  children,
  onClose,
  variant = "standard",
  icon,
  action,
  sx,
  ...props
}) {
  return (
    <MuiAlert
      severity={severity}
      variant={variant}
      onClose={onClose}
      icon={icon}
      action={action}
      sx={{ mb: 2, ...sx }}
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
}

Alert.propTypes = {
  severity: PropTypes.oneOf(["error", "warning", "info", "success"]),
  title: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(["standard", "filled", "outlined"]),
  icon: PropTypes.node,
  action: PropTypes.node,
  sx: PropTypes.object,
};

export default Alert;
