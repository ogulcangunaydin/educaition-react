/**
 * EducationInfoStep — Step 2: Class Year, Exam, Grade, Area
 */

import React from "react";
import { Box, Typography, RadioGroup, FormControlLabel, Radio, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

function EducationInfoStep({ formData, updateFormData, enums }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6">{t("tests.programSuggestion.steps.educationInfo")}</Typography>

      {/* Class Year */}
      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          {t("tests.programSuggestion.educationInfo.classYear")} *
        </Typography>
        <RadioGroup
          value={formData.classYear}
          onChange={(e) => updateFormData({ classYear: e.target.value })}
        >
          {(enums.classYears || []).map((cy) => (
            <FormControlLabel
              key={cy.value}
              value={cy.value}
              control={<Radio />}
              label={cy.label}
            />
          ))}
        </RadioGroup>
      </Box>

      {/* Will Take Exam */}
      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          {t("tests.programSuggestion.educationInfo.willTakeExam")}
        </Typography>
        <RadioGroup
          value={formData.willTakeExam ? "yes" : "no"}
          onChange={(e) => updateFormData({ willTakeExam: e.target.value === "yes" })}
        >
          <FormControlLabel value="yes" control={<Radio />} label={t("common.yes")} />
          <FormControlLabel value="no" control={<Radio />} label={t("common.no")} />
        </RadioGroup>
      </Box>

      {/* Average Grade */}
      <TextField
        label={t("tests.programSuggestion.educationInfo.averageGrade")}
        type="number"
        value={formData.averageGrade}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
            updateFormData({ averageGrade: value });
          }
        }}
        inputProps={{ min: 0, max: 100, step: 0.1 }}
        helperText={t("tests.programSuggestion.educationInfo.averageGradeHelp")}
      />

      {/* Area Selection */}
      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          {t("tests.programSuggestion.educationInfo.area")} *
        </Typography>
        <RadioGroup
          value={formData.area}
          onChange={(e) => updateFormData({ area: e.target.value })}
        >
          {(enums.scoreAreas || []).map((area) => (
            <FormControlLabel
              key={area.value}
              value={area.value}
              control={<Radio />}
              label={area.label}
            />
          ))}
        </RadioGroup>
      </Box>
    </Box>
  );
}

export default EducationInfoStep;
