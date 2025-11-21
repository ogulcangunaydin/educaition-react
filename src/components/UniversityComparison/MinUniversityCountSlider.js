import React from "react";
import { Box, Typography, Slider } from "@mui/material";

const MinUniversityCountSlider = ({ value, onChange, disabled = false }) => {
  const marks = [
    { value: 0, label: "Tümü" },
    { value: 3, label: "İlk 3" },
    { value: 5, label: "İlk 5" },
    { value: 10, label: "İlk 10" },
    { value: 20, label: "İlk 20" },
  ];

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Typography gutterBottom>
        Minimum Tercih Sayısı: {value === 0 ? "Tümü" : value}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1, display: "block" }}
      >
        {value === 0
          ? "Tüm üniversiteler dahil"
          : `En az ${value} kez tercih edilen üniversiteler`}
      </Typography>
      <Slider
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        min={0}
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
