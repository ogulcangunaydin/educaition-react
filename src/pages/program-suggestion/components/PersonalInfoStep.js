/**
 * PersonalInfoStep — Step 1: Birth Year, Gender
 * (Name is already collected during registration via TestRegistrationCard)
 */

import React from "react";
import { Box, Typography, RadioGroup, FormControlLabel, Radio, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

function PersonalInfoStep({ formData, updateFormData }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6">{t("tests.programSuggestion.steps.personalInfo")}</Typography>

      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          {t("tests.programSuggestion.personalInfo.birthYear")} *
        </Typography>
        <TextField
          type="number"
          value={formData.birthYear}
          onChange={(e) => {
            const val = e.target.value;
            updateFormData({ birthYear: val ? parseInt(val) : "" });
          }}
          placeholder={t("tests.programSuggestion.personalInfo.birthYearPlaceholder")}
          inputProps={{ min: 1990, max: 2025 }}
          fullWidth
        />
      </Box>

      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          {t("tests.programSuggestion.personalInfo.gender")} *
        </Typography>
        <RadioGroup
          value={formData.gender}
          onChange={(e) => updateFormData({ gender: e.target.value })}
        >
          <FormControlLabel
            value="erkek"
            control={<Radio />}
            label={t("tests.programSuggestion.personalInfo.male")}
          />
          <FormControlLabel
            value="kadın"
            control={<Radio />}
            label={t("tests.programSuggestion.personalInfo.female")}
          />
          <FormControlLabel
            value="belirtilmedi"
            control={<Radio />}
            label={t("tests.programSuggestion.personalInfo.notSpecified")}
          />
        </RadioGroup>
      </Box>
    </Box>
  );
}

export default PersonalInfoStep;
