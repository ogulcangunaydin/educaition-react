import React from "react";
import { Box, Typography, Slider } from "@mui/material";

const FilterSlider = ({
  value,
  onChange,
  disabled = false,
  label,
  frequencyData = null,
  type = "seçenek",
  isPercentage = false, // For fulfillment rate slider
}) => {
  // Fixed preset values for filtering
  const presetValues = isPercentage
    ? [0, 30, 50, 75, 90, 100] // Percentage values for fulfillment
    : [0, 5, 10, 30, 50, 100]; // Absolute values for other filters

  // Find current value's index in preset values
  const valueToIndex = (val) => {
    const idx = presetValues.indexOf(val);
    return idx >= 0 ? idx : 0;
  };

  // Convert index back to actual value
  const indexToValue = (idx) => presetValues[idx] || 0;

  // Current index for the slider
  const currentIndex = valueToIndex(value);

  // Generate marks using indices (0-5) for even spacing
  const marks = presetValues.map((val, idx) => ({
    value: idx,
    label: val === 0 ? "Tümü" : isPercentage ? `%${val}` : `${val}`,
  }));

  const maxIndex = presetValues.length - 1;

  // Calculate frequency distribution for visualization (if frequency data provided)
  const getFrequencyBars = () => {
    if (!frequencyData || frequencyData.length === 0) return null;

    // Create ranges matching slider preset values
    const ranges = [];
    for (let i = 0; i < presetValues.length - 1; i++) {
      const min = presetValues[i];
      const max = presetValues[i + 1];
      const isLast = i === presetValues.length - 2;
      ranges.push({
        min: min,
        max: isLast ? Infinity : max,
        label: isLast ? `${min}+` : `${min}-${max}`,
      });
    }

    const distribution = ranges.map((range) => {
      const count = frequencyData.filter(
        ([_, freq]) =>
          freq >= range.min &&
          (range.max === Infinity ? true : freq < range.max)
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
                value > 0 && value > item.min
                  ? "rgba(25, 118, 210, 0.3)"
                  : "primary.main",
              borderRadius: "2px 2px 0 0",
              transition: "all 0.3s ease",
              mr: index < distribution.length - 1 ? "1px" : 0, // Small gap between bars
            }}
            title={`${
              isPercentage
                ? `%${item.min}-${
                    item.max === Infinity ? "100+" : "%" + item.max
                  }`
                : item.label
            }: ${item.count} ${type}`}
          />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Typography gutterBottom>{label(value)}</Typography>

      {/* No data message */}
      {(!frequencyData || frequencyData.length === 0) && (
        <Box
          sx={{
            height: 40,
            mb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0, 0, 0, 0.04)",
            borderRadius: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Veri bulunamadı
          </Typography>
        </Box>
      )}

      {/* Frequency visualization (when data exists) */}
      {frequencyData && frequencyData.length > 0 && getFrequencyBars()}

      <Slider
        value={currentIndex}
        onChange={(e, newIndex) => onChange(indexToValue(newIndex))}
        min={0}
        max={maxIndex}
        step={1}
        marks={marks}
        valueLabelDisplay="auto"
        valueLabelFormat={(idx) => {
          const val = indexToValue(idx);
          return isPercentage ? `%${val}` : val;
        }}
        disabled={disabled || !frequencyData || frequencyData.length === 0}
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
              } ${type} dahil (toplam ${frequencyData.length})`}
        </Typography>
      )}
    </Box>
  );
};

export default FilterSlider;
