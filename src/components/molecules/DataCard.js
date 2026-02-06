/**
 * DataCard Molecule
 *
 * A card displaying a key-value data point.
 */

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import PropTypes from "prop-types";

function DataCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "primary",
  trend,
  trendValue,
  onClick,
  ...props
}) {
  return (
    <Paper
      elevation={1}
      onClick={onClick}
      sx={{
        p: 2.5,
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": onClick
          ? {
              boxShadow: 3,
              transform: "translateY(-2px)",
            }
          : {},
      }}
      {...props}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 700, mb: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography
                variant="body2"
                color={
                  trend === "up"
                    ? "success.main"
                    : trend === "down"
                      ? "error.main"
                      : "text.secondary"
                }
                sx={{ fontWeight: 600 }}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
        {Icon && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              opacity: 0.8,
            }}
          >
            <Icon fontSize="medium" />
          </Box>
        )}
      </Box>
    </Paper>
  );
}

DataCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  color: PropTypes.string,
  trend: PropTypes.oneOf(["up", "down", "neutral"]),
  trendValue: PropTypes.string,
  onClick: PropTypes.func,
};

export default DataCard;
