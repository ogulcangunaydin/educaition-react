/**
 * Modal Atom
 *
 * Wrapper around MUI Modal with consistent styling for centered content.
 */

import React from "react";
import { Modal as MuiModal, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import { COLORS, SPACING, SHADOWS } from "../../theme";

const ModalContent = styled(Box)(({ theme, width }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: width || 400,
  maxWidth: "90vw",
  maxHeight: "90vh",
  overflow: "auto",
  backgroundColor: COLORS.white,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: SHADOWS.xl,
  padding: SPACING.xl,
  outline: "none",
}));

const ModalTitle = styled("h2")({
  margin: 0,
  marginBottom: SPACING.lg,
  color: COLORS.text.primary,
  fontSize: "1.25rem",
  fontWeight: 600,
});

const ModalActions = styled(Box)({
  display: "flex",
  gap: SPACING.sm,
  justifyContent: "flex-end",
  marginTop: SPACING.lg,
});

function Modal({ open, onClose, title, children, actions, width, ...props }) {
  return (
    <MuiModal open={open} onClose={onClose} {...props}>
      <ModalContent width={width}>
        {title && <ModalTitle>{title}</ModalTitle>}
        {children}
        {actions && <ModalActions>{actions}</ModalActions>}
      </ModalContent>
    </MuiModal>
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Modal;
