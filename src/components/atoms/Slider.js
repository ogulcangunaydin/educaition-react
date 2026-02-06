/**
 * Slider Atom
 *
 * Wrapper around MUI Slider with consistent styling.
 */

import React from "react";
import { Slider as MuiSlider, Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  marks = false,
  disabled = false,
  valueLabelDisplay = "auto",
  color = "primary",
  label,
  showValue = false,
  ...props
}) {
  return (
    <Box sx={{ width: "100%" }}>
      {(label || showValue) && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          {label && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
          {showValue && (
            <Typography variant="body2" fontWeight="600">
              {Array.isArray(value) ? `${value[0]} - ${value[1]}` : value}
            </Typography>
          )}
        </Box>
      )}
      <MuiSlider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        marks={marks}
        disabled={disabled}
        valueLabelDisplay={valueLabelDisplay}
        color={color}
        {...props}
      />
    </Box>
  );
}

Slider.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
  onChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  marks: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
  disabled: PropTypes.bool,
  valueLabelDisplay: PropTypes.oneOf(["auto", "on", "off"]),
  color: PropTypes.oneOf(["primary", "secondary"]),
  label: PropTypes.string,
  showValue: PropTypes.bool,
};

export default Slider;
