import React from "react";
import { Paper, Typography, Slider, Box } from "@mui/material";

const TopCitiesSlider = ({ value, onChange, disabled }) => {
  const marks = [
    { value: 0, label: "Tümü" },
    { value: 3, label: "İlk 3" },
    { value: 5, label: "İlk 5" },
    { value: 10, label: "İlk 10" },
    { value: 20, label: "İlk 20" },
  ];

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        En Çok Tercih Edilen İller
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {value === 0
          ? "Tüm illerdeki üniversiteler gösteriliyor"
          : `İlk ${value} tercih edilen ildeki üniversiteler gösteriliyor`}
      </Typography>
      <Box sx={{ px: 1 }}>
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
    </Paper>
  );
};

export default TopCitiesSlider;
