/**
 * FormSection Organism
 *
 * A section of a form with a title and description.
 */

import React from "react";
import { Box, Typography, Paper, Divider } from "@mui/material";
import PropTypes from "prop-types";

function FormSection({
  title,
  description,
  children,
  elevation = 0,
  withPaper = false,
  divider = false,
  ...props
}) {
  const content = (
    <Box {...props}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>{children}</Box>
      {divider && <Divider sx={{ mt: 4, mb: 2 }} />}
    </Box>
  );

  if (withPaper) {
    return (
      <Paper elevation={elevation} sx={{ p: 3, mb: 3 }}>
        {content}
      </Paper>
    );
  }

  return content;
}

FormSection.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
  elevation: PropTypes.number,
  withPaper: PropTypes.bool,
  divider: PropTypes.bool,
};

export default FormSection;
