/**
 * LoadingOverlay Molecule
 *
 * A full-page or container loading overlay.
 */

import React from "react";
import { Box, Typography, Backdrop } from "@mui/material";
import PropTypes from "prop-types";
import Spinner from "../atoms/Spinner";

function LoadingOverlay({
  open = true,
  message,
  fullScreen = true,
  spinnerSize = "large",
  backgroundColor = "rgba(255, 255, 255, 0.9)",
  ...props
}) {
  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Spinner size={spinnerSize} />
      {message && (
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Backdrop
        open={open}
        sx={{
          color: "primary.main",
          backgroundColor,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        {...props}
      >
        {content}
      </Backdrop>
    );
  }

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor,
        zIndex: 10,
      }}
      {...props}
    >
      {content}
    </Box>
  );
}

LoadingOverlay.propTypes = {
  open: PropTypes.bool,
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  spinnerSize: PropTypes.oneOfType([
    PropTypes.oneOf(["small", "medium", "large"]),
    PropTypes.number,
  ]),
  backgroundColor: PropTypes.string,
};

export default LoadingOverlay;
