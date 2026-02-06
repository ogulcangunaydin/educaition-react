/**
 * QRCodeOverlay Molecule
 *
 * A full-screen overlay displaying a QR code.
 */

import React from "react";
import { Box, styled } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "../atoms/Button";
import Typography from "../atoms/Typography";
import { COLORS, SPACING } from "../../theme";

const Backdrop = styled(Box)({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1300,
  cursor: "pointer",
});

const QRContainer = styled(Box)({
  backgroundColor: COLORS.white,
  padding: SPACING.xl,
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: SPACING.md,
});

function QRCodeOverlay({ url, onClose, size = 256 }) {
  const { t } = useTranslation();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <QRContainer onClick={(e) => e.stopPropagation()}>
        <QRCodeCanvas value={url} size={size} level="H" includeMargin />
        <Typography
          variant="caption"
          color={COLORS.primary.contrastText}
          sx={{ textAlign: "center" }}
        >
          {t("common.qrFallbackMessage")}
        </Typography>
        <Typography
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
          sx={{
            maxWidth: 350,
            textAlign: "center",
            wordBreak: "break-all",
            userSelect: "all",
            color: COLORS.primary.contrastText,
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {url}
        </Typography>
        <Button variant="outlined" onClick={onClose}>
          {t("common.close")}
        </Button>
      </QRContainer>
    </Backdrop>
  );
}

QRCodeOverlay.propTypes = {
  url: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  size: PropTypes.number,
};

export default QRCodeOverlay;
