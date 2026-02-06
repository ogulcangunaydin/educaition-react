/**
 * PageLoading Template
 *
 * Common loading state for pages. Wraps PageLayout with a centered spinner
 * and optional back button. Use as an early return in page components.
 *
 * @example
 * if (loading) return <PageLoading onBack={() => navigate(-1)} />;
 */

import React from "react";
import PropTypes from "prop-types";
import { Box, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import PageLayout from "./PageLayout";

function PageLoading({ title, onBack, maxWidth = "lg" }) {
  const { t } = useTranslation();

  return (
    <PageLayout
      title={title || t("common.loading")}
      showBackButton={!!onBack}
      onBack={onBack}
      maxWidth={maxWidth}
    >
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    </PageLayout>
  );
}

PageLoading.propTypes = {
  /** Page title shown while loading */
  title: PropTypes.string,
  /** Back navigation handler — shows back button when provided */
  onBack: PropTypes.func,
  /** Container max width */
  maxWidth: PropTypes.string,
};

export default PageLoading;
