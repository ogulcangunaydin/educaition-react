/**
 * SliderField Molecule
 *
 * A labeled slider field.
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import Slider from "../atoms/Slider";
import { Label } from "../atoms/Typography";

function SliderField({
  label,
  name,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  marks = false,
  disabled = false,
  required = false,
  helperText,
  valueLabelDisplay = "auto",
  showCurrentValue = true,
  formatValue,
  ...props
}) {
  const handleChange = (e, newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  const displayValue = formatValue
    ? formatValue(value)
    : Array.isArray(value)
      ? `${value[0]} - ${value[1]}`
      : value;

  return (
    <Box sx={{ mb: 3 }}>
      {label && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Label required={required}>{label}</Label>
          {showCurrentValue && (
            <Typography variant="body2" fontWeight={600} color="primary">
              {displayValue}
            </Typography>
          )}
        </Box>
      )}
      <Box sx={{ px: 1 }}>
        <Slider
          name={name}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          marks={marks}
          disabled={disabled}
          valueLabelDisplay={valueLabelDisplay}
          {...props}
        />
      </Box>
      {helperText && (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

SliderField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
  onChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  marks: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  helperText: PropTypes.string,
  valueLabelDisplay: PropTypes.oneOf(["auto", "on", "off"]),
  showCurrentValue: PropTypes.bool,
  formatValue: PropTypes.func,
};

export default SliderField;
