/**
 * Grid Atom
 *
 * Wrapper around MUI Grid with simplified props.
 */

import React from "react";
import { Grid as MuiGrid } from "@mui/material";
import PropTypes from "prop-types";
import { SPACING } from "../../theme";

function Grid({
  children,
  container = false,
  item = false,
  spacing = "md",
  xs,
  sm,
  md,
  lg,
  xl,
  ...props
}) {
  const spacingValue = typeof spacing === "string" ? (SPACING[spacing] || SPACING.md) / 8 : spacing;

  return (
    <MuiGrid
      container={container}
      item={item}
      spacing={container ? spacingValue : undefined}
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      {...props}
    >
      {children}
    </MuiGrid>
  );
}

/**
 * Convenience component for grid container
 */
function GridContainer({ children, spacing = "md", ...props }) {
  return (
    <Grid container spacing={spacing} {...props}>
      {children}
    </Grid>
  );
}

/**
 * Convenience component for grid item
 */
function GridItem({ children, xs = 12, sm, md, lg, xl, ...props }) {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl} {...props}>
      {children}
    </Grid>
  );
}

Grid.propTypes = {
  children: PropTypes.node,
  container: PropTypes.bool,
  item: PropTypes.bool,
  spacing: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
};

GridContainer.propTypes = {
  children: PropTypes.node,
  spacing: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

GridItem.propTypes = {
  children: PropTypes.node,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
};

export { Grid, GridContainer, GridItem };
export default Grid;
