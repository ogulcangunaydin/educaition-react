import React from "react";
import { Box, Typography, Slider } from "@mui/material";

const FilterSlider = ({
  value,
  onChange,
  disabled = false,
  label,
  frequencyData = null,
  type = "seçenek",
}) => {
  const marks = [
    { value: 0, label: "Tümü" },
    { value: 2, label: "2" },
    { value: 4, label: "4" },
    { value: 6, label: "6" },
    { value: 8, label: "8" },
    { value: 10, label: "10+" },
  ];

  // Calculate frequency distribution for visualization (if frequency data provided)
  const getFrequencyBars = () => {
    if (!frequencyData || frequencyData.length === 0) return null;

    // Create ranges matching slider increments
    const ranges = [
      { min: 0, max: 2, label: "0-2" },
      { min: 2, max: 4, label: "3-4" },
      { min: 4, max: 6, label: "5-6" },
      { min: 6, max: 8, label: "7-8" },
      { min: 8, max: Infinity, label: "9+" },
    ];

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
                value > 0 &&
                (value >= item.max || (item.max === Infinity && value > 9))
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
      <Typography gutterBottom>{label(value)}</Typography>

      {/* Frequency visualization (optional) */}
      {frequencyData && getFrequencyBars()}

      <Slider
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        min={0}
        max={10}
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
          {value === 0
            ? `Toplam ${frequencyData.length} farklı ${type}`
            : `${
                frequencyData.filter(([_, freq]) => freq >= value).length
              } farklı ${type} dahil (toplam ${frequencyData.length})`}
        </Typography>
      )}
    </Box>
  );
};

export default FilterSlider;
