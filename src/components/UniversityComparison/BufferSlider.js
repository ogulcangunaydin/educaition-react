import React from "react";
import { Box, Slider, Typography } from "@mui/material";

const BufferSlider = ({ value, onChange, disabled = false }) => {
  const marks = [
    { value: 0, label: "0%" },
    { value: 10, label: "10%" },
    { value: 20, label: "20%" },
    { value: 30, label: "30%" },
    { value: 50, label: "50%" },
  ];

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Typography id="buffer-slider" gutterBottom>
        Tolerans: {value}%
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Seçilen programın değer aralığını ne kadar genişletmek istersiniz?
      </Typography>
      <Slider
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        aria-labelledby="buffer-slider"
        valueLabelDisplay="auto"
        step={1}
        marks={marks}
        min={0}
        max={50}
        disabled={disabled}
      />
    </Box>
  );
};

export default BufferSlider;
