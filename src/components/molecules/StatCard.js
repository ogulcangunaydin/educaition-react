/**
 * StatCard Molecule
 *
 * A card component for displaying statistics with an icon and value.
 */

import React from "react";
import PropTypes from "prop-types";
import { Paper, Box, Typography, alpha, Skeleton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  height: "100%",
}));

const IconWrapper = styled(Box)(({ theme, bgcolor }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.spacing(1.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: alpha(bgcolor || theme.palette.primary.main, 0.1),
  color: bgcolor || theme.palette.primary.main,
}));

function StatCard({ title, value, icon: Icon, color, trend, trendValue, loading = false }) {
  const isPositiveTrend = trend === "up";

  return (
    <StyledCard elevation={0}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box flex={1}>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={80} height={40} />
          ) : (
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {value}
            </Typography>
          )}
          {trend && trendValue && !loading && (
            <Box display="flex" alignItems="center" mt={1}>
              {isPositiveTrend ? (
                <TrendingUp sx={{ fontSize: 16, color: "success.main", mr: 0.5 }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: "error.main", mr: 0.5 }} />
              )}
              <Typography
                variant="caption"
                sx={{ color: isPositiveTrend ? "success.main" : "error.main" }}
              >
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
        <IconWrapper bgcolor={color}>
          <Icon sx={{ fontSize: 24 }} />
        </IconWrapper>
      </Box>
    </StyledCard>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
  trend: PropTypes.oneOf(["up", "down"]),
  trendValue: PropTypes.string,
  loading: PropTypes.bool,
};

export default StatCard;
