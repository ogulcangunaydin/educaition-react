/**
 * Typography Atom
 *
 * Wrapper around MUI Typography with common variants.
 */

import React from "react";
import { Typography as MuiTypography } from "@mui/material";
import PropTypes from "prop-types";

function Typography({
  children,
  variant = "body1",
  color = "textPrimary",
  align = "inherit",
  gutterBottom = false,
  noWrap = false,
  component,
  sx,
  ...props
}) {
  return (
    <MuiTypography
      variant={variant}
      color={color}
      align={align}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      component={component}
      sx={sx}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}

// Convenience components for common use cases
export const Title = ({ children, ...props }) => (
  <Typography variant="h4" gutterBottom {...props}>
    {children}
  </Typography>
);

export const Subtitle = ({ children, ...props }) => (
  <Typography variant="h6" color="text.secondary" gutterBottom {...props}>
    {children}
  </Typography>
);

export const SectionTitle = ({ children, ...props }) => (
  <Typography variant="h5" gutterBottom {...props}>
    {children}
  </Typography>
);

export const BodyText = ({ children, ...props }) => (
  <Typography variant="body1" {...props}>
    {children}
  </Typography>
);

export const Caption = ({ children, ...props }) => (
  <Typography variant="caption" color="text.secondary" {...props}>
    {children}
  </Typography>
);

export const Label = ({ children, required = false, ...props }) => (
  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }} {...props}>
    {children}
    {required && <span style={{ color: "red", marginLeft: 4 }}>*</span>}
  </Typography>
);

Typography.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "subtitle1",
    "subtitle2",
    "body1",
    "body2",
    "caption",
    "overline",
    "button",
  ]),
  color: PropTypes.string,
  align: PropTypes.oneOf(["inherit", "left", "center", "right", "justify"]),
  gutterBottom: PropTypes.bool,
  noWrap: PropTypes.bool,
  component: PropTypes.elementType,
  sx: PropTypes.object,
};

export default Typography;
