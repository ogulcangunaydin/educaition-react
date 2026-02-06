/**
 * ModuleCard Molecule
 *
 * A clickable card component for displaying dashboard modules.
 * Features an icon, title, description, and hover effects.
 */

import React from "react";
import PropTypes from "prop-types";
import { Paper, Box, Typography, alpha } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Paper)(({ theme, bgcolor }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  height: "100%",
  minHeight: 180,
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: bgcolor || theme.palette.primary.main,
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
    borderColor: bgcolor || theme.palette.primary.main,
    "&::before": {
      opacity: 1,
    },
  },
  "&:active": {
    transform: "translateY(-2px)",
  },
}));

const IconWrapper = styled(Box)(({ theme, bgcolor }) => ({
  width: 56,
  height: 56,
  borderRadius: theme.spacing(1.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: alpha(bgcolor || theme.palette.primary.main, 0.1),
  color: bgcolor || theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  transition: "all 0.3s ease",
  ".MuiPaper-root:hover &": {
    backgroundColor: bgcolor || theme.palette.primary.main,
    color: "#fff",
    transform: "scale(1.1)",
  },
}));

function ModuleCard({ title, description, icon: Icon, color, onClick, disabled }) {
  return (
    <StyledCard
      elevation={0}
      bgcolor={color}
      onClick={disabled ? undefined : onClick}
      sx={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <IconWrapper bgcolor={color}>
        <Icon sx={{ fontSize: 28 }} />
      </IconWrapper>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: "text.primary" }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
        {description}
      </Typography>
    </StyledCard>
  );
}

ModuleCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

ModuleCard.defaultProps = {
  disabled: false,
};

export default ModuleCard;
