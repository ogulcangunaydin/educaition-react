import { Typography, Slider, Box } from "@mui/material";

const TopCitiesSlider = ({ value, onChange, disabled }) => {
  const marks = [
    { value: 1, label: "Tümü" },
    { value: 3, label: "3" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 20, label: "20" },
  ];

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Yerleşenlerin en az {value} defa tercih ettikleri illerdeki bölümler
        gösteriliyor.
      </Typography>
      <Box sx={{ px: 1 }}>
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
    </Box>
  );
};

export default TopCitiesSlider;
