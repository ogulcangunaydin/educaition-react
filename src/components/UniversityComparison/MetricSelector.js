import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const MetricSelector = ({ value, onChange, disabled = false }) => {
  const metrics = [
    { value: "ranking", label: "Başarı Sıralaması" },
    { value: "score", label: "Puan" },
  ];

  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel id="metric-select-label">Karşılaştırma Kriteri</InputLabel>
      <Select
        labelId="metric-select-label"
        id="metric-select"
        value={value || ""}
        label="Karşılaştırma Kriteri"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <MenuItem value="">
          <em>Kriter Seçin</em>
        </MenuItem>
        {metrics.map((metric) => (
          <MenuItem key={metric.value} value={metric.value}>
            {metric.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MetricSelector;
