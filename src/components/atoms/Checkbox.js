/**
 * Checkbox Atom
 *
 * Wrapper around MUI Checkbox with FormControlLabel.
 */

import React from "react";
import { Checkbox as MuiCheckbox, FormControlLabel } from "@mui/material";
import PropTypes from "prop-types";

function Checkbox({
  label,
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
        control={
          <MuiCheckbox
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
    <MuiCheckbox
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      color={color}
      size={size}
      {...props}
    />
  );
}

Checkbox.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  color: PropTypes.oneOf(["primary", "secondary", "default"]),
  size: PropTypes.oneOf(["small", "medium"]),
};

export default Checkbox;
