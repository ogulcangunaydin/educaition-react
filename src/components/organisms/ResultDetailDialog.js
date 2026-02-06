/**
 * ResultDetailDialog Organism
 *
 * Reusable dialog for displaying individual test results.
 * Provides a consistent shell with participant info in the title,
 * a close button, and responsive fullScreen on small devices.
 *
 * Accepts a `participant` object (with full_name / student_number) and
 * auto-generates the subtitle. You can also override with a custom `subtitle`.
 *
 * Content is passed as children so each test type can render
 * its own result layout (RadarChart, MarkdownSection, etc.).
 *
 * @example
 * <ResultDetailDialog
 *   open={!!selectedParticipant}
 *   onClose={() => setSelectedParticipant(null)}
 *   title="Kişilik Testi Sonuçları"
 *   participant={selectedParticipant}
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

/**
 * Builds a display subtitle from participant fields.
 * @param {object} participant - expects { full_name?, student_number? }
 * @returns {string|undefined}
 */
function getParticipantSubtitle(participant) {
  if (!participant) return undefined;
  const parts = [
    participant.full_name,
    participant.student_number && `(${participant.student_number})`,
  ];
  return parts.filter(Boolean).join(" ") || undefined;
}

function ResultDetailDialog({
  open,
  onClose,
  title,
  participant,
  subtitle: subtitleOverride,
  children,
  maxWidth = "md",
  closeLabel = "Kapat",
  actions,
}) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const subtitle = subtitleOverride ?? getParticipantSubtitle(participant);

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
  /** Participant object — auto-generates subtitle from full_name & student_number */
  participant: PropTypes.shape({
    full_name: PropTypes.string,
    student_number: PropTypes.string,
  }),
  /** Manual subtitle override (takes priority over participant-based subtitle) */
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
