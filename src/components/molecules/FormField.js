/**
 * FormField Molecule
 *
 * A labeled text input field with error handling.
 */

import React from "react";
import { Box } from "@mui/material";
import PropTypes from "prop-types";
import TextField from "../atoms/TextField";
import { Label } from "../atoms/Typography";

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  error = false,
  helperText,
  required = false,
  disabled = false,
  type = "text",
  multiline = false,
  rows = 4,
  fullWidth = true,
  size = "medium",
  hideLabel = false,
  ...props
}) {
  const handleChange = (e) => {
    if (onChange) {
      // Support both (value) and (event) signatures
      onChange(e.target.value, e);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {label && !hideLabel && <Label required={required}>{label}</Label>}
      <TextField
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
        type={type}
        multiline={multiline}
        rows={rows}
        fullWidth={fullWidth}
        size={size}
        label={hideLabel ? label : undefined}
        {...props}
      />
    </Box>
  );
}

FormField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium"]),
  hideLabel: PropTypes.bool,
};

export default FormField;
