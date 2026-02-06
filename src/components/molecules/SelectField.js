/**
 * SelectField Molecule
 *
 * A labeled select field with error handling.
 */

import React from "react";
import { Box } from "@mui/material";
import PropTypes from "prop-types";
import Select from "../atoms/Select";
import { Label } from "../atoms/Typography";

function SelectField({
  label,
  name,
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
  hideLabel = false,
  ...props
}) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {label && !hideLabel && <Label required={required}>{label}</Label>}
      <Select
        name={name}
        value={value}
        onChange={handleChange}
        options={options}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        size={size}
        placeholder={placeholder}
        label={hideLabel ? label : undefined}
        {...props}
      />
    </Box>
  );
}

SelectField.propTypes = {
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
  hideLabel: PropTypes.bool,
};

export default SelectField;
