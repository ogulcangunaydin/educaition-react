/**
 * TextField Atom
 *
 * Wrapper around MUI TextField with consistent styling.
 */

import React from "react";
import { TextField as MuiTextField } from "@mui/material";
import PropTypes from "prop-types";

function TextField({
  label,
  value,
  onChange,
  placeholder,
  error = false,
  helperText,
  required = false,
  disabled = false,
  type = "text",
  multiline = false,
  rows = 1,
  fullWidth = true,
  size = "medium",
  InputProps,
  ...props
}) {
  return (
    <MuiTextField
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      type={type}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      fullWidth={fullWidth}
      size={size}
      variant="outlined"
      InputProps={InputProps}
      {...props}
    />
  );
}

TextField.propTypes = {
  label: PropTypes.string,
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
  InputProps: PropTypes.object,
};

export default TextField;
