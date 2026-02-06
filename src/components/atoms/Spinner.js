/**
 * Spinner Atom
 *
 * Loading spinner component with size variants.
 */

import React from "react";
import { CircularProgress, Box } from "@mui/material";
import PropTypes from "prop-types";

const SIZES = {
  small: 20,
  medium: 40,
  large: 60,
};

function Spinner({ size = "medium", color = "primary", centered = false, ...props }) {
  const spinnerSize = typeof size === "number" ? size : SIZES[size];

  if (centered) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          py: 4,
        }}
      >
        <CircularProgress size={spinnerSize} color={color} {...props} />
      </Box>
    );
  }

  return <CircularProgress size={spinnerSize} color={color} {...props} />;
}

Spinner.propTypes = {
  size: PropTypes.oneOfType([PropTypes.oneOf(["small", "medium", "large"]), PropTypes.number]),
  color: PropTypes.oneOf(["primary", "secondary", "inherit"]),
  centered: PropTypes.bool,
};

export default Spinner;
