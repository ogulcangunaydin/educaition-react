/**
 * ResultDetailDialog Organism
 *
 * Reusable dialog for displaying individual test results.
 * Provides a consistent shell with participant info in the title,
 * a close button, and responsive fullScreen on small devices.
 *
 * Content is passed as children so each test type can render
 * its own result layout (RadarChart, MarkdownSection, etc.).
 *
 * @example
 * <ResultDetailDialog
 *   open={!!selectedParticipant}
 *   onClose={() => setSelectedParticipant(null)}
 *   title="Kişilik Testi Sonuçları"
 *   subtitle="Ahmet Yılmaz (2024001)"
 * >
 *   <RadarChart labels={...} datasets={...} />
 *   <MarkdownSection title="Meslek Tavsiyeleri" content={...} />
 * </ResultDetailDialog>
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import Typography from "../atoms/Typography";
import Button from "../atoms/Button";

function ResultDetailDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "md",
  closeLabel = "Kapat",
  actions,
}) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth fullScreen={isSmallScreen}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6">
          {title}
          {subtitle && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              — {subtitle}
            </Typography>
          )}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      <DialogActions>
        {actions}
        <Button onClick={onClose}>{closeLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}

ResultDetailDialog.propTypes = {
  /** Whether the dialog is open */
  open: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Main dialog title */
  title: PropTypes.string.isRequired,
  /** Secondary text shown after title (e.g. participant name + id) */
  subtitle: PropTypes.string,
  /** Dialog content — RadarChart, MarkdownSection, etc. */
  children: PropTypes.node,
  /** MUI Dialog maxWidth */
  maxWidth: PropTypes.string,
  /** Label for the close button */
  closeLabel: PropTypes.string,
  /** Additional action buttons rendered before the close button */
  actions: PropTypes.node,
};

export default ResultDetailDialog;
