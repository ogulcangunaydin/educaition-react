/**
 * ChartContainer Organism
 *
 * A container for charts with title, loading, and empty states.
 */

import React from "react";
import { Paper, Box, Typography, IconButton, Tooltip } from "@mui/material";
import { Download, Fullscreen, Refresh } from "@mui/icons-material";
import PropTypes from "prop-types";
import Spinner from "../atoms/Spinner";
import EmptyState from "../molecules/EmptyState";

function ChartContainer({
  title,
  subtitle,
  children,
  loading = false,
  empty = false,
  emptyMessage = "Veri bulunamadı",
  onRefresh,
  onDownload,
  onFullscreen,
  height = 400,
  elevation = 1,
  actions,
  ...props
}) {
  return (
    <Paper elevation={elevation} sx={{ p: 3, height: "100%" }} {...props}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box>
          {title && (
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {actions}
          {onRefresh && (
            <Tooltip title="Yenile">
              <IconButton size="small" onClick={onRefresh}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDownload && (
            <Tooltip title="İndir">
              <IconButton size="small" onClick={onDownload}>
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onFullscreen && (
            <Tooltip title="Tam Ekran">
              <IconButton size="small" onClick={onFullscreen}>
                <Fullscreen fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          height: height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <Spinner size="large" />
        ) : empty ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <Box sx={{ width: "100%", height: "100%" }}>{children}</Box>
        )}
      </Box>
    </Paper>
  );
}

ChartContainer.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  loading: PropTypes.bool,
  empty: PropTypes.bool,
  emptyMessage: PropTypes.string,
  onRefresh: PropTypes.func,
  onDownload: PropTypes.func,
  onFullscreen: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  elevation: PropTypes.number,
  actions: PropTypes.node,
};

export default ChartContainer;
