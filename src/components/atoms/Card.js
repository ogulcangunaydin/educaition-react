/**
 * Card Atom
 *
 * Wrapper around MUI Card with consistent styling.
 */

import React from "react";
import { Card as MuiCard, CardContent, CardHeader, CardActions } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";

const StyledCard = styled(MuiCard)(({ theme, clickable, selected }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "box-shadow 0.2s, transform 0.2s",
  ...(clickable && {
    cursor: "pointer",
    "&:hover": {
      boxShadow: theme.shadows[4],
      transform: "translateY(-2px)",
    },
  }),
  ...(selected && {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
    borderStyle: "solid",
  }),
}));

function Card({
  children,
  title,
  subtitle,
  headerAction,
  actions,
  onClick,
  selected = false,
  elevation = 1,
  sx,
  ...props
}) {
  const clickable = Boolean(onClick);

  return (
    <StyledCard
      elevation={elevation}
      onClick={onClick}
      clickable={clickable}
      selected={selected}
      sx={sx}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={headerAction}
          titleTypographyProps={{ variant: "h6" }}
          subheaderTypographyProps={{ variant: "body2" }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>{children}</CardContent>
      {actions && <CardActions sx={{ p: 2, pt: 0 }}>{actions}</CardActions>}
    </StyledCard>
  );
}

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.string,
  headerAction: PropTypes.node,
  actions: PropTypes.node,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  elevation: PropTypes.number,
  sx: PropTypes.object,
};

export default Card;
