/**
 * MarkdownSection Molecule
 *
 * A styled section box that renders markdown content with a title.
 * Used for GPT-generated recommendations, analysis results, etc.
 *
 * @example
 * <MarkdownSection
 *   title="Meslek Tavsiyeleri"
 *   content={participant.job_recommendation}
 * />
 */

import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import ReactMarkdown from "react-markdown";
import Typography from "../atoms/Typography";

function MarkdownSection({ title, content, sx }) {
  if (!content) return null;

  return (
    <Box
      sx={{
        mt: 3,
        p: 2,
        bgcolor: "grey.50",
        borderRadius: 2,
        ...sx,
      }}
    >
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Box sx={{ "& p": { mt: 0, mb: 1 }, "& ul": { pl: 2 } }}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </Box>
    </Box>
  );
}

MarkdownSection.propTypes = {
  /** Section heading */
  title: PropTypes.string,
  /** Markdown content string */
  content: PropTypes.string,
  /** Additional sx styles */
  sx: PropTypes.object,
};

export default MarkdownSection;
