import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { formatProgramName } from "@utils/dataFilters";
import { useUniversity } from "@contexts/UniversityContext";

const ProgramSelector = ({ programs, value, onChange, disabled = false }) => {
  const { university } = useUniversity();

  // Sort programs alphabetically by formatted name
  const sortedPrograms = programs
    ? [...programs].sort((a, b) => {
        const nameA = formatProgramName(a);
        const nameB = formatProgramName(b);
        return nameA.localeCompare(nameB, "tr");
      })
    : [];

  const labelText = `${university.displayName} Programı Seçiniz`;

  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel id="program-select-label">{labelText}</InputLabel>
      <Select
        labelId="program-select-label"
        id="program-select"
        value={value || ""}
        label={labelText}
        onChange={(e) => {
          const selected = sortedPrograms.find((p) => p.yop_kodu === e.target.value);
          onChange(selected);
        }}
        disabled={disabled || !sortedPrograms || sortedPrograms.length === 0}
      >
        <MenuItem value="">
          <em>Program Seçin</em>
        </MenuItem>
        {sortedPrograms.map((program) => (
          <MenuItem key={program.yop_kodu} value={program.yop_kodu}>
            {formatProgramName(program)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ProgramSelector;
