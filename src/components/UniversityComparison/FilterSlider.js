import React, { useState } from "react";
import { Box, Typography, Slider, IconButton, Tooltip } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const FilterSlider = ({
  value,
  onChange,
  disabled = false,
  label,
  frequencyData = null,
  type = "seçenek",
  isPercentage = false, // For fulfillment rate slider
  isReversed = false, // External reverse state
  onReversedChange = null, // Callback to notify parent of reverse toggle
}) => {
  // Use internal state if no external control provided
  const [internalReversed, setInternalReversed] = useState(false);
  const reversed = onReversedChange ? isReversed : internalReversed;

  // Fixed preset values for filtering
  const baseValues = isPercentage
    ? [0, 30, 50, 75, 90, 100]
    : [0, 5, 10, 30, 50, 100];

  // In reverse mode: [0, max, ...descending...]
  let displayValues;
  if (reversed) {
    displayValues = [0, ...baseValues.slice(1).slice().reverse()];
  } else {
    displayValues = baseValues;
  }

  // Map value <-> index based on display order
  const valueToIndex = (val) => {
    const idx = displayValues.indexOf(val);
    return idx >= 0 ? idx : 0;
  };
  const indexToValue = (idx) => displayValues[idx] || 0;
  const currentIndex = valueToIndex(value);

  // Generate marks using display order
  const marks = displayValues.map((val, idx) => ({
    value: idx,
    label: val === 0 ? "Tümü" : isPercentage ? `%${val}` : `${val}`,
  }));
  const maxIndex = displayValues.length - 1;

  // Toggle reverse mode
  const handleToggleReverse = () => {
    const newReversed = !reversed;
    if (onReversedChange) {
      onReversedChange(newReversed);
    } else {
      setInternalReversed(newReversed);
    }
    // Reset to "All" when toggling
    onChange(0);
  };

  // Calculate frequency distribution for visualization (if frequency data provided)
  const getFrequencyBars = () => {
    if (!frequencyData || frequencyData.length === 0) return null;

    // Create ranges matching display order (bars)
    const barValues = reversed ? [...displayValues].reverse() : displayValues;
    const ranges = [];
    for (let i = 0; i < barValues.length - 1; i++) {
      const min = barValues[i];
      const max = barValues[i + 1];
      const isLast = i === barValues.length - 2;
      const [rangeMin, rangeMax] = min < max ? [min, max] : [max, min];
      ranges.push({
        min: rangeMin,
        max: isLast ? Infinity : rangeMax,
        label: isLast ? `${rangeMin}+` : `${rangeMin}-${rangeMax}`,
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

    // Determine if a bar should be grayed out (excluded from filter)
    const isBarExcluded = (item) => {
      if (value === 0) return false; // All included
      if (reversed) {
        // In reverse: show values <= tick
        // Exclude bars where the max is greater than the selected value
        return item.max > value;
      } else {
        // Normal: show values >= tick
        return item.max !== Infinity && item.max <= value;
      }
    };

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
        {(reversed ? [...distribution].reverse() : distribution).map(
          (item, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                height:
                  maxCount > 0 ? `${(item.count / maxCount) * 100}%` : "2px",
                minHeight: "2px",
                bgcolor: isBarExcluded(item)
                  ? "rgba(25, 118, 210, 0.3)"
                  : "primary.main",
                borderRadius: "2px 2px 0 0",
                transition: "all 0.3s ease",
                mr: index < distribution.length - 1 ? "1px" : 0, // Small gap between bars
              }}
              title={`$${
                isPercentage
                  ? `%${item.min}-$${
                      item.max === Infinity ? "100+" : "%" + item.max
                    }`
                  : item.label
              }: ${item.count} ${type}`}
            />
          )
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography gutterBottom sx={{ mb: 0 }}>
          {label(value, reversed)}
        </Typography>
        <Tooltip
          title={reversed ? "En az filtresine geç" : "En fazla filtresine geç"}
        >
          <IconButton
            size="small"
            onClick={handleToggleReverse}
            disabled={disabled || !frequencyData || frequencyData.length === 0}
            sx={{
              bgcolor: reversed ? "primary.main" : "transparent",
              color: reversed ? "white" : "primary.main",
              "&:hover": {
                bgcolor: reversed ? "primary.dark" : "rgba(25, 118, 210, 0.1)",
              },
              ml: 1,
            }}
          >
            <SwapHorizIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* No data message */}
      {(!frequencyData || frequencyData.length === 0) && (
        <Box
          sx={{
            height: 40,
            mb: 1,
            mt: 1,
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
      {frequencyData && frequencyData.length > 0 && (
        <Box sx={{ mt: 1 }}>{getFrequencyBars()}</Box>
      )}

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
            : reversed
            ? `${
                frequencyData.filter(([_, freq]) => freq <= value).length
              } ${type} dahil (toplam ${frequencyData.length})`
            : `${
                frequencyData.filter(([_, freq]) => freq >= value).length
              } ${type} dahil (toplam ${frequencyData.length})`}
        </Typography>
      )}
    </Box>
  );
};

export default FilterSlider;
