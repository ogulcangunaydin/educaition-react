/**
 * PageError Template
 *
 * Common error state for pages. Wraps PageLayout with an Alert
 * and optional back button. Use as an early return in page components.
 *
 * @example
 * if (error) return <PageError message={error} onBack={() => navigate(-1)} />;
 */

import React from "react";
import PropTypes from "prop-types";
import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import PageLayout from "./PageLayout";

function PageError({ title, message, onBack, onRetry, maxWidth = "lg" }) {
  const { t } = useTranslation();

  return (
    <PageLayout
      title={title || t("common.errorTitle")}
      showBackButton={!!onBack}
      onBack={onBack}
      maxWidth={maxWidth}
    >
      <Alert
        severity="error"
        action={
          onRetry ? (
            <span onClick={onRetry} style={{ cursor: "pointer", textDecoration: "underline" }}>
              {t("common.retry")}
            </span>
          ) : undefined
        }
      >
        {message || t("common.error")}
      </Alert>
    </PageLayout>
  );
}

PageError.propTypes = {
  /** Page title */
  title: PropTypes.string,
  /** Error message to display */
  message: PropTypes.string,
  /** Back navigation handler — shows back button when provided */
  onBack: PropTypes.func,
  /** Retry handler — shows retry action in the alert when provided */
  onRetry: PropTypes.func,
  /** Container max width */
  maxWidth: PropTypes.string,
};

export default PageError;
