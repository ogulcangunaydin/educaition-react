import React from "react";
import { Box, Typography, Slider } from "@mui/material";

const MinUniversityCountSlider = ({ value, onChange, disabled = false }) => {
  const marks = [
    { value: 1, label: "Tümü" },
    { value: 3, label: "İlk 3" },
    { value: 5, label: "İlk 5" },
    { value: 10, label: "İlk 10" },
    { value: 20, label: "İlk 20" },
  ];

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Typography gutterBottom>
        Yerleşenlerin en az {value} defa tercih ettikleri üniversitelerin
        programlarını tutar
      </Typography>
      <Slider
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        min={1}
        max={20}
        step={1}
        marks={marks}
        valueLabelDisplay="auto"
        disabled={disabled}
      />
    </Box>
  );
};

export default MinUniversityCountSlider;
