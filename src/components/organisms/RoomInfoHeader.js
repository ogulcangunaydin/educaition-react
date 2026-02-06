/**
 * RoomInfoHeader Organism
 *
 * Reusable room information header card for all test room detail pages.
 * Displays room name, status, action buttons (QR, copy URL, refresh),
 * and quick participant stats.
 *
 * Handles URL copy internally — just pass `roomId` and `testType`.
 *
 * Usage:
 *   <RoomInfoHeader
 *     room={room}
 *     roomId={roomId}
 *     testType={TestType.PERSONALITY_TEST}
 *     participantCount={participants.length}
 *     completedCount={completedCount}
 *     onShowQR={() => setShowQR(true)}
 *     onRefresh={fetchRoomData}
 *   />
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Grid, Card, CardContent, Chip, IconButton, Tooltip } from "@mui/material";
import {
  QrCode2 as QRIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Typography } from "@components/atoms";
import { TEST_TYPE_CONFIG, generateRoomUrl } from "@services/testRoomService";

function RoomInfoHeader({
  room,
  roomId,
  testType,
  participantCount = 0,
  completedCount = 0,
  onShowQR,
  onRefresh,
  extraActions,
}) {
  const [copySuccess, setCopySuccess] = useState(false);
  const { t, i18n } = useTranslation();

  const config = testType ? TEST_TYPE_CONFIG[testType] : null;
  const inProgressCount = participantCount - completedCount;
  const completionRate =
    participantCount > 0 ? Math.round((completedCount / participantCount) * 100) : 0;

  const handleCopyUrl = async () => {
    const url = generateRoomUrl(roomId, testType);
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <Card sx={{ mb: 3, borderLeft: 4, borderColor: config?.color || "primary.main" }}>
      <CardContent>
        <Grid container spacing={3} alignItems="center">
          {/* Room name & status */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="h5">{room?.name}</Typography>
              <Chip
                label={room?.is_active ? t("tests.status.active") : t("tests.status.inactive")}
                color={room?.is_active ? "success" : "default"}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t("common.createdAt")}{" "}
              {room?.created_at
                ? new Date(room.created_at).toLocaleDateString(
                    i18n.language === "tr" ? "tr-TR" : "en-US"
                  )
                : "-"}
            </Typography>
          </Grid>

          {/* Action buttons */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: { xs: "flex-start", md: "flex-end" },
                flexWrap: "wrap",
              }}
            >
              {onShowQR && (
                <Tooltip title={t("common.showQRCode")}>
                  <IconButton color="primary" onClick={onShowQR}>
                    <QRIcon />
                  </IconButton>
                </Tooltip>
              )}
              {roomId && testType && (
                <Tooltip title={copySuccess ? t("common.copied") : t("common.copyURL")}>
                  <IconButton color={copySuccess ? "success" : "primary"} onClick={handleCopyUrl}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onRefresh && (
                <Tooltip title={t("common.refresh")}>
                  <IconButton color="primary" onClick={onRefresh}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
              {extraActions}
            </Box>
          </Grid>
        </Grid>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="h4" color="primary.main">
                {participantCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("tests.stats.totalParticipants")}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="h4" color="success.main">
                {completedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("tests.stats.completedCount")}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="h4" color="warning.main">
                {inProgressCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("tests.stats.inProgressCount")}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="h4" color="info.main">
                {completionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("tests.stats.completionRate")}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

RoomInfoHeader.propTypes = {
  /** Room data object (expects name, is_active, created_at) */
  room: PropTypes.object,
  /** Room ID used for generating the share URL */
  roomId: PropTypes.string,
  /** Test type key from TestType enum, used for accent color and URL generation */
  testType: PropTypes.string,
  /** Total number of participants */
  participantCount: PropTypes.number,
  /** Number of completed participants */
  completedCount: PropTypes.number,
  /** Callback to show QR code overlay */
  onShowQR: PropTypes.func,
  /** Callback to refresh room data */
  onRefresh: PropTypes.func,
  /** Additional action buttons rendered after the default ones */
  extraActions: PropTypes.node,
};

export default RoomInfoHeader;
