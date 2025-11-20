import React from "react";
import { Box, Slider, Typography } from "@mui/material";

const RecordLimitSlider = ({ value, onChange, disabled = false }) => {
  const marks = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
    { value: 200, label: "Tümü" },
  ];

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Typography id="record-limit-slider" gutterBottom>
        Grafikte Gösterilecek Departman Sayısı: {value >= 200 ? "Tümü" : value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        En yakın sonuçları göstermek için üniversite sayısını sınırlayın
      </Typography>
      <Slider
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        aria-labelledby="record-limit-slider"
        valueLabelDisplay="auto"
        step={null}
        marks={marks}
        min={10}
        max={200}
        disabled={disabled}
      />
    </Box>
  );
};

export default RecordLimitSlider;
