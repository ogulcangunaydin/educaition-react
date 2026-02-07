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
 * Set `exportable` to show a "Download PDF" button that captures
 * the full dialog content (title + body) via html2canvas + jsPDF.
 * Title/subtitle are rendered as part of the captured image so
 * Turkish characters (ş, ı, ö, ü, ç, ğ, İ, Ş) display correctly.
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
 *   exportable
 * >
 *   <RadarChart labels={...} datasets={...} />
 *   <MarkdownSection title="Meslek Tavsiyeleri" content={...} />
 * </ResultDetailDialog>
 */

import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon, PictureAsPdf as PdfIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
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

/**
 * Builds a safe file name from participant fields.
 * @param {object} participant - expects { full_name?, student_number? }
 * @returns {string}
 */
function buildExportFileName(participant) {
  const parts = [participant?.full_name, participant?.student_number].filter(Boolean);
  if (parts.length === 0) return "result";
  return parts
    .join("_")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_çÇğĞıİöÖşŞüÜ-]/g, "");
}

function ResultDetailDialog({
  open,
  onClose,
  title,
  participant,
  subtitle: subtitleOverride,
  children,
  maxWidth = "md",
  closeLabel,
  actions,
  exportable = false,
  exportFileName,
}) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();
  const contentRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const subtitle = subtitleOverride ?? getParticipantSubtitle(participant);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    setExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const contentEl = contentRef.current;

      // --- Build an off-screen wrapper with title + full content ---
      const wrapper = document.createElement("div");
      wrapper.style.cssText =
        "position:fixed;left:-9999px;top:0;background:#fff;padding:24px 32px;width:" +
        contentEl.scrollWidth +
        "px;";

      // Title header (rendered as HTML → captured as image → no font issues)
      const titleEl = document.createElement("div");
      titleEl.style.cssText = "margin-bottom:16px;";
      titleEl.innerHTML =
        '<div style="font-size:22px;font-weight:600;color:#333;margin-bottom:4px;">' +
        (title || "") +
        "</div>" +
        (subtitle ? '<div style="font-size:14px;color:#666;">' + subtitle + "</div>" : "");
      wrapper.appendChild(titleEl);

      // Clone the full scrollable content so we capture everything
      const contentClone = contentEl.cloneNode(true);
      contentClone.style.overflow = "visible";
      contentClone.style.maxHeight = "none";
      contentClone.style.height = "auto";
      contentClone.style.border = "none";
      contentClone.style.padding = "0";

      // cloneNode does NOT copy drawn canvas pixels — replace each cloned
      // <canvas> with an <img> snapshot of the original canvas content.
      const originalCanvases = contentEl.querySelectorAll("canvas");
      const clonedCanvases = contentClone.querySelectorAll("canvas");
      originalCanvases.forEach((origCanvas, i) => {
        if (clonedCanvases[i]) {
          const img = document.createElement("img");
          img.src = origCanvas.toDataURL("image/png");
          img.style.width = origCanvas.style.width || origCanvas.offsetWidth + "px";
          img.style.height = origCanvas.style.height || origCanvas.offsetHeight + "px";
          clonedCanvases[i].parentNode.replaceChild(img, clonedCanvases[i]);
        }
      });

      wrapper.appendChild(contentClone);

      document.body.appendChild(wrapper);

      // Wait for any charts/images inside the clone to settle
      await new Promise((r) => setTimeout(r, 300));

      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: wrapper.scrollWidth,
        windowHeight: wrapper.scrollHeight,
      });

      document.body.removeChild(wrapper);

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4 dimensions in mm
      const pdfWidth = 210;
      const margin = 10;
      const usableWidth = pdfWidth - margin * 2;
      const totalHeight = (imgHeight * usableWidth) / imgWidth;
      const pageHeight = 297 - margin * 2;

      const pdf = new jsPDF({ unit: "mm", format: "a4" });

      if (totalHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", margin, margin, usableWidth, totalHeight);
      } else {
        // Multi-page slicing
        const sourceSliceHeight = (pageHeight / usableWidth) * imgWidth;
        let srcY = 0;
        let isFirstPage = true;

        while (srcY < imgHeight) {
          if (!isFirstPage) pdf.addPage();

          const sliceH = Math.min(sourceSliceHeight, imgHeight - srcY);
          const drawH = (sliceH * usableWidth) / imgWidth;

          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = imgWidth;
          pageCanvas.height = sliceH;
          const ctx = pageCanvas.getContext("2d");
          ctx.drawImage(canvas, 0, srcY, imgWidth, sliceH, 0, 0, imgWidth, sliceH);

          pdf.addImage(
            pageCanvas.toDataURL("image/png"),
            "PNG",
            margin,
            margin,
            usableWidth,
            drawH
          );

          srcY += sliceH;
          isFirstPage = false;
        }
      }

      const fileName = exportFileName || buildExportFileName(participant);
      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

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
        <Typography component="div" variant="h6">
          {title}
          {subtitle && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              — {subtitle}
            </Typography>
          )}
        </Typography>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {exportable && (
            <Tooltip title={exporting ? t("common.exportingPDF") : t("common.downloadPDF")}>
              <span>
                <IconButton onClick={handleExportPDF} size="small" disabled={exporting}>
                  {exporting ? <CircularProgress size={20} /> : <PdfIcon />}
                </IconButton>
              </span>
            </Tooltip>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent dividers ref={contentRef}>
        {children}
      </DialogContent>

      <DialogActions>
        {actions}
        <Button onClick={onClose}>{closeLabel || t("common.close")}</Button>
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
  /** Participant object — auto-generates subtitle & default file name from full_name & student_number */
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
  /** Show PDF download button in the dialog header */
  exportable: PropTypes.bool,
  /** File name override for the exported PDF (without .pdf). Defaults to participant name + student number. */
  exportFileName: PropTypes.string,
};

export default ResultDetailDialog;
