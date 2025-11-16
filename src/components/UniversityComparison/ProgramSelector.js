import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { formatProgramName } from "../../utils/dataFilters";

const ProgramSelector = ({ programs, value, onChange, disabled = false }) => {
  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel id="program-select-label">
        Haliç Üniversitesi Programı Seçiniz
      </InputLabel>
      <Select
        labelId="program-select-label"
        id="program-select"
        value={value || ""}
        label="Haliç Üniversitesi Programı Seçiniz"
        onChange={(e) => {
          const selected = programs.find((p) => p.yop_kodu === e.target.value);
          onChange(selected);
        }}
        disabled={disabled || !programs || programs.length === 0}
      >
        <MenuItem value="">
          <em>Program Seçin</em>
        </MenuItem>
        {programs &&
          programs.map((program) => (
            <MenuItem key={program.yop_kodu} value={program.yop_kodu}>
              {formatProgramName(program)}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

export default ProgramSelector;
