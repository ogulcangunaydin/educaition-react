/**
 * Container Atom
 *
 * Wrapper around MUI Box/Container with common layout patterns.
 */

import React from "react";
import { Box, Container as MuiContainer } from "@mui/material";
import PropTypes from "prop-types";
import { SPACING } from "../../theme";

/**
 * Page container with max width and padding
 */
function Container({ children, maxWidth = "lg", padding = true, centered = false, ...props }) {
  return (
    <MuiContainer
      maxWidth={maxWidth}
      sx={{
        py: padding ? SPACING.xl / 8 : 0,
        px: padding ? SPACING.lg / 8 : 0,
        ...(centered && {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }),
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </MuiContainer>
  );
}

/**
 * Flex container with common patterns
 */
function Flex({
  children,
  direction = "row",
  justify = "flex-start",
  align = "center",
  gap = "md",
  wrap = false,
  ...props
}) {
  const gapValue = typeof gap === "string" ? SPACING[gap] || SPACING.md : gap;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: direction,
        justifyContent: justify,
        alignItems: align,
        gap: `${gapValue}px`,
        flexWrap: wrap ? "wrap" : "nowrap",
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

/**
 * Centered container
 */
function Center({ children, ...props }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 200,
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

Container.propTypes = {
  children: PropTypes.node,
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", false]),
  padding: PropTypes.bool,
  centered: PropTypes.bool,
};

Flex.propTypes = {
  children: PropTypes.node,
  direction: PropTypes.oneOf(["row", "column", "row-reverse", "column-reverse"]),
  justify: PropTypes.string,
  align: PropTypes.string,
  gap: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  wrap: PropTypes.bool,
};

Center.propTypes = {
  children: PropTypes.node,
};

export { Container, Flex, Center };
export default Container;
