/**
 * RadioGroup Molecule
 *
 * A group of radio buttons with a label.
 */

import React from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Box,
} from "@mui/material";
import PropTypes from "prop-types";

function RadioGroup({
  label,
  name,
  value,
  onChange,
  options = [],
  error = false,
  helperText,
  required = false,
  disabled = false,
  row = false,
  size = "medium",
  ...props
}) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl component="fieldset" error={error} required={required} disabled={disabled}>
        {label && (
          <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
            {label}
          </FormLabel>
        )}
        <MuiRadioGroup name={name} value={value} onChange={handleChange} row={row} {...props}>
          {options.map((option) => (
            <FormControlLabel
              key={option.value ?? option}
              value={option.value ?? option}
              control={<Radio size={size} />}
              label={option.label ?? option}
              disabled={option.disabled}
            />
          ))}
        </MuiRadioGroup>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </Box>
  );
}

RadioGroup.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string,
        disabled: PropTypes.bool,
      }),
    ])
  ),
  error: PropTypes.bool,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  row: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium"]),
};

export default RadioGroup;
