import React from "react";
import { Box, Typography, Slider } from "@mui/material";

const MinProgramCountSlider = ({
  value,
  onChange,
  disabled = false,
  frequencyData = [],
}) => {
  const marks = [
    { value: 0, label: "0" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
  ];

  // Calculate frequency distribution for visualization
  const getFrequencyBars = () => {
    if (!frequencyData || frequencyData.length === 0) return null;

    // Create ranges matching slider increments (every 5)
    const ranges = [];
    for (let i = 0; i <= 50; i += 5) {
      const min = i;
      const max = i + 4;
      ranges.push({
        min,
        max: i === 50 ? Infinity : max,
        label: i === 50 ? `${min}+` : `${min}-${max}`,
      });
    }

    const distribution = ranges.map((range) => {
      const count = frequencyData.filter(
        ([_, freq]) => freq >= range.min && freq <= range.max
      ).length;
      return { ...range, count };
    });

    const maxCount = Math.max(...distribution.map((d) => d.count));

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 0,
          height: 40,
          mb: 1,
          px: "6px", // Match slider thumb radius to align bars with track
        }}
      >
        {distribution.map((item, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              height:
                maxCount > 0 ? `${(item.count / maxCount) * 100}%` : "2px",
              minHeight: "2px",
              bgcolor:
                value > 0 && value > item.max
                  ? "rgba(25, 118, 210, 0.3)"
                  : "primary.main",
              borderRadius: "2px 2px 0 0",
              transition: "all 0.3s ease",
              mr: index < distribution.length - 1 ? "1px" : 0, // Small gap between bars
            }}
            title={`${item.label}: ${item.count} program${
              item.count !== 1 ? "lar" : ""
            }`}
          />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Typography gutterBottom>
        Program Minimum Tercih Sayısı: {value === 0 ? "Tümü" : value}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1, display: "block" }}
      >
        {value === 0
          ? "Tüm programlar dahil"
          : `En az ${value} kez tercih edilen programlar`}
      </Typography>

      {/* Frequency visualization */}
      {getFrequencyBars()}

      <Slider
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        min={0}
        max={50}
        marks={marks}
        valueLabelDisplay="auto"
        disabled={disabled}
      />

      {frequencyData && frequencyData.length > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          Toplam {frequencyData.length} farklı program
        </Typography>
      )}
    </Box>
  );
};

export default MinProgramCountSlider;
