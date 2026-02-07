/**
 * TestCompletionMessage Molecule
 *
 * Reusable "thank you" banner shown after a public test is completed.
 * Can be placed at the bottom of any test result page.
 *
 * @example
 * <TestCompletionMessage />
 * <TestCompletionMessage message="Custom thank-you text" />
 */

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { CheckCircleOutline as CheckIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

function TestCompletionMessage({ message }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        mt: 3,
        py: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <CheckIcon color="success" sx={{ fontSize: 32 }} />
      <Typography variant="body2" color="text.secondary">
        {message || t("tests.thankYou")}
      </Typography>
    </Box>
  );
}

TestCompletionMessage.propTypes = {
  /** Custom message (defaults to i18n tests.thankYou) */
  message: PropTypes.string,
};

export default TestCompletionMessage;
