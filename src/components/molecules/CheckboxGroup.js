/**
 * CheckboxGroup Molecule
 *
 * A group of checkboxes with a label.
 */

import React from "react";
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Box,
} from "@mui/material";
import PropTypes from "prop-types";

function CheckboxGroup({
  label,
  name,
  value = [],
  onChange,
  options = [],
  error = false,
  helperText,
  required = false,
  disabled = false,
  row = false,
  size = "medium",
  maxSelections,
  ...props
}) {
  const handleChange = (optionValue) => (e) => {
    if (!onChange) return;

    let newValue;
    if (e.target.checked) {
      // Check if max selections reached
      if (maxSelections && value.length >= maxSelections) {
        return;
      }
      newValue = [...value, optionValue];
    } else {
      newValue = value.filter((v) => v !== optionValue);
    }
    onChange(newValue);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl component="fieldset" error={error} required={required} disabled={disabled}>
        {label && (
          <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
            {label}
            {maxSelections && (
              <Box component="span" sx={{ fontWeight: 400, ml: 1 }}>
                (Maks. {maxSelections})
              </Box>
            )}
          </FormLabel>
        )}
        <FormGroup row={row} {...props}>
          {options.map((option) => {
            const optionValue = option.value ?? option;
            const optionLabel = option.label ?? option;
            const isChecked = value.includes(optionValue);
            const isDisabled =
              option.disabled || (maxSelections && value.length >= maxSelections && !isChecked);

            return (
              <FormControlLabel
                key={optionValue}
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={handleChange(optionValue)}
                    name={name}
                    size={size}
                    disabled={isDisabled}
                  />
                }
                label={optionLabel}
              />
            );
          })}
        </FormGroup>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </Box>
  );
}

CheckboxGroup.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.array,
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
  maxSelections: PropTypes.number,
};

export default CheckboxGroup;
