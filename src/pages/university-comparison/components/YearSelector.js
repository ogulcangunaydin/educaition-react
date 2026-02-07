import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const YearSelector = ({ value, onChange, disabled = false }) => {
  const years = ["2022", "2023", "2024", "2025"];

  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel id="year-select-label">Yıl Seçiniz</InputLabel>
      <Select
        labelId="year-select-label"
        id="year-select"
        value={value || ""}
        label="Yıl Seçiniz"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <MenuItem value="">
          <em>Yıl Seçin</em>
        </MenuItem>
        {years.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default YearSelector;
