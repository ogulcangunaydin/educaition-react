/**
 * Logo Atom
 *
 * Logo component with size variants.
 */

import React from "react";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";

const SIZES = {
  small: 40,
  medium: 80,
  large: 120,
  xlarge: 200,
};

const StyledImg = styled("img")({
  objectFit: "contain",
});

function Logo({ src = "/halic_universitesi_logo.svg", alt = "Logo", size = "medium", ...props }) {
  const logoSize = typeof size === "number" ? size : SIZES[size];

  return (
    <StyledImg
      src={src}
      alt={alt}
      style={{
        width: logoSize,
        height: "auto",
      }}
      {...props}
    />
  );
}

Logo.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOfType([
    PropTypes.oneOf(["small", "medium", "large", "xlarge"]),
    PropTypes.number,
  ]),
};

export default Logo;
