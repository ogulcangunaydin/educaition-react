/**
 * PreferencesStep — Step 4: Language, Universities, Cities
 */

import React from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useTranslation } from "react-i18next";

function PreferencesStep({ formData, updateFormData, enums, universities }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6">{t("tests.programSuggestion.steps.preferences")}</Typography>

      {/* Preferred Language */}
      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          {t("tests.programSuggestion.preferences.language")} *
        </Typography>
        <RadioGroup
          value={formData.preferredLanguage}
          onChange={(e) => updateFormData({ preferredLanguage: e.target.value })}
        >
          {(enums.preferredLanguages || []).map((lang) => (
            <FormControlLabel
              key={lang.value}
              value={lang.value}
              control={<Radio />}
              label={lang.label}
            />
          ))}
        </RadioGroup>
      </Box>

      {/* Desired Universities */}
      <Autocomplete
        multiple
        options={universities}
        getOptionLabel={(option) => option.name}
        value={formData.desiredUniversities}
        onChange={(_, value) => updateFormData({ desiredUniversities: value })}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("tests.programSuggestion.preferences.universities")}
            placeholder={t("tests.programSuggestion.preferences.universitiesPlaceholder")}
          />
        )}
        filterOptions={(options, { inputValue }) => {
          const term = inputValue.toLocaleLowerCase("tr-TR");
          return options
            .filter((option) => option.name.toLocaleLowerCase("tr-TR").includes(term))
            .slice(0, 30);
        }}
      />

      {/* Desired Cities */}
      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          {t("tests.programSuggestion.preferences.cities")} *
        </Typography>
        <FormGroup>
          {(enums.cities || []).map((city) => (
            <FormControlLabel
              key={city.value}
              control={
                <Checkbox
                  checked={formData.desiredCities.includes(city.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFormData({ desiredCities: [...formData.desiredCities, city.value] });
                    } else {
                      updateFormData({
                        desiredCities: formData.desiredCities.filter((c) => c !== city.value),
                      });
                    }
                  }}
                />
              }
              label={city.label}
            />
          ))}
        </FormGroup>
      </Box>
    </Box>
  );
}

export default PreferencesStep;
