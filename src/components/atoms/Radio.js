/**
 * Radio Atom
 *
 * Wrapper around MUI Radio with FormControlLabel.
 */

import React from "react";
import { Radio as MuiRadio, FormControlLabel } from "@mui/material";
import PropTypes from "prop-types";

function Radio({
  label,
  value,
  checked = false,
  onChange,
  disabled = false,
  color = "primary",
  size = "medium",
  ...props
}) {
  if (label) {
    return (
      <FormControlLabel
        value={value}
        control={
          <MuiRadio
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            color={color}
            size={size}
            {...props}
          />
        }
        label={label}
      />
    );
  }

  return (
    <MuiRadio
      value={value}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      color={color}
      size={size}
      {...props}
    />
  );
}

Radio.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  color: PropTypes.oneOf(["primary", "secondary", "default"]),
  size: PropTypes.oneOf(["small", "medium"]),
};

export default Radio;
