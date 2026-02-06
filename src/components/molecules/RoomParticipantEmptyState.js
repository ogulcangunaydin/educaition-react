/**
 * RoomParticipantEmptyState Molecule
 *
 * Shared empty state for room detail pages when there are no participants yet.
 * Shows a message and a QR code button to encourage sharing.
 *
 * Usage:
 *   <RoomParticipantEmptyState onShowQR={() => setShowQR(true)} />
 */

import React from "react";
import PropTypes from "prop-types";
import { QrCode2 as QRIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import Button from "../atoms/Button";
import EmptyState from "./EmptyState";

function RoomParticipantEmptyState({ title, description, onShowQR, buttonLabel }) {
  const { t } = useTranslation();

  return (
    <EmptyState
      title={title || t("tests.noParticipantsYet")}
      message={description || t("tests.shareQRDescription")}
      action={
        onShowQR ? (
          <Button variant="contained" startIcon={<QRIcon />} onClick={onShowQR}>
            {buttonLabel || t("common.showQRCode")}
          </Button>
        ) : undefined
      }
    />
  );
}

RoomParticipantEmptyState.propTypes = {
  /** Empty state title */
  title: PropTypes.string,
  /** Empty state description */
  description: PropTypes.string,
  /** Callback to show QR code overlay */
  onShowQR: PropTypes.func,
  /** Label for the QR button */
  buttonLabel: PropTypes.string,
};

export default RoomParticipantEmptyState;
