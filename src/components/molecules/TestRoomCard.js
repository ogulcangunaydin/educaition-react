/**
 * TestRoomCard Molecule
 *
 * A card component for displaying test room information with actions.
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Card, CardContent, CardActions, IconButton, Chip, Tooltip } from "@mui/material";
import {
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon,
} from "@mui/icons-material";
import Typography from "../atoms/Typography";
import Button from "../atoms/Button";
import { TEST_TYPE_CONFIG, generateRoomUrl } from "@services/testRoomService";

function TestRoomCard({
  room,
  onView,
  onDelete,
  onToggleActive,
  onShowQR,
  showActions = true,
  compact = false,
}) {
  const [copySuccess, setCopySuccess] = useState(false);

  const config = TEST_TYPE_CONFIG[room.test_type] || {};

  const handleCopyUrl = async () => {
    try {
      const url = generateRoomUrl(room.id, room.test_type);
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: `4px solid ${config.color || "#1976d2"}`,
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: compact ? 1 : 2 }}>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}
        >
          <Typography variant={compact ? "subtitle1" : "h6"} component="h3" gutterBottom>
            {room.name}
          </Typography>
          <Chip
            label={room.is_active ? "Aktif" : "Pasif"}
            size="small"
            color={room.is_active ? "success" : "default"}
            sx={{ ml: 1 }}
          />
        </Box>

        <Chip
          label={config.label || room.test_type}
          size="small"
          sx={{
            backgroundColor: config.color || "#1976d2",
            color: "#fff",
            mb: 1,
          }}
        />

        {!compact && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Oluşturulma: {formatDate(room.created_at)}
          </Typography>
        )}

        {room.updated_at && !compact && (
          <Typography variant="caption" color="text.secondary" display="block">
            Son güncelleme: {formatDate(room.updated_at)}
          </Typography>
        )}
      </CardContent>

      {showActions && (
        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          <Box>
            {onView && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => onView(room)}
                startIcon={<OpenIcon />}
              >
                Görüntüle
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            {onShowQR && (
              <Tooltip title="QR Kod Göster">
                <IconButton size="small" color="primary" onClick={() => onShowQR(room)}>
                  <QrCodeIcon />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title={copySuccess ? "Kopyalandı!" : "Linki Kopyala"}>
              <IconButton
                size="small"
                color={copySuccess ? "success" : "default"}
                onClick={handleCopyUrl}
              >
                <CopyIcon />
              </IconButton>
            </Tooltip>

            {onToggleActive && (
              <Tooltip title={room.is_active ? "Pasif Yap" : "Aktif Yap"}>
                <IconButton
                  size="small"
                  color={room.is_active ? "warning" : "success"}
                  onClick={() => onToggleActive(room)}
                >
                  {room.is_active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Tooltip>
            )}

            {onDelete && (
              <Tooltip title="Sil">
                <IconButton size="small" color="error" onClick={() => onDelete(room)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </CardActions>
      )}
    </Card>
  );
}

TestRoomCard.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    test_type: PropTypes.string.isRequired,
    is_active: PropTypes.bool,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    settings: PropTypes.object,
  }).isRequired,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleActive: PropTypes.func,
  onShowQR: PropTypes.func,
  showActions: PropTypes.bool,
  compact: PropTypes.bool,
};

export default TestRoomCard;
