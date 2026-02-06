/**
 * Select Atom
 *
 * Wrapper around MUI Select with FormControl for consistent styling.
 */

import React from "react";
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import PropTypes from "prop-types";

function Select({
  label,
  value,
  onChange,
  options = [],
  error = false,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  size = "medium",
  placeholder,
  ...props
}) {
  const labelId = `${label?.toLowerCase().replace(/\s/g, "-")}-label`;

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      required={required}
      disabled={disabled}
      size={size}
    >
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <MuiSelect labelId={labelId} value={value} onChange={onChange} label={label} {...props}>
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

Select.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string,
      }),
    ])
  ),
  error: PropTypes.bool,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium"]),
  placeholder: PropTypes.string,
};

export default Select;
