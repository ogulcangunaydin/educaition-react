import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const UniversityTypeSelector = ({
  universityType,
  onChange,
  disabled = false,
}) => {
  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel>Tür Seçin</InputLabel>
      <Select
        value={universityType}
        label="Tür Seçin"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <MenuItem value="all">Tümü</MenuItem>
        <MenuItem value="Vakıf">Vakıf</MenuItem>
        <MenuItem value="Devlet">Devlet</MenuItem>
        <MenuItem value="KKTC">KKTC</MenuItem>
      </Select>
    </FormControl>
  );
};

export default UniversityTypeSelector;
