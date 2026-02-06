/**
 * SearchInput Molecule
 *
 * A search input with icon and clear button.
 */

import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Search, Clear } from "@mui/icons-material";
import PropTypes from "prop-types";

function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Ara...",
  disabled = false,
  fullWidth = true,
  size = "small",
  autoFocus = false,
  ...props
}) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange("");
    }
  };

  return (
    <TextField
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      autoFocus={autoFocus}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search color="action" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} edge="end" aria-label="Temizle">
              <Clear fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      {...props}
    />
  );
}

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium"]),
  autoFocus: PropTypes.bool,
};

export default SearchInput;
