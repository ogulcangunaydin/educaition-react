/**
 * ErrorMessage Molecule
 *
 * An error message display component.
 */

import React from "react";
import { Button } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import PropTypes from "prop-types";
import Alert from "../atoms/Alert";

function ErrorMessage({
  title = "Hata",
  message,
  error,
  onRetry,
  retryText = "Tekrar Dene",
  severity = "error",
  ...props
}) {
  // Extract message from error object if provided
  const displayMessage =
    message ||
    error?.message ||
    error?.response?.data?.message ||
    "Bir hata oluştu. Lütfen tekrar deneyin.";

  return (
    <Alert
      severity={severity}
      title={title}
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry} startIcon={<Refresh />}>
            {retryText}
          </Button>
        )
      }
      {...props}
    >
      {displayMessage}
    </Alert>
  );
}

ErrorMessage.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onRetry: PropTypes.func,
  retryText: PropTypes.string,
  severity: PropTypes.oneOf(["error", "warning", "info", "success"]),
};

export default ErrorMessage;
