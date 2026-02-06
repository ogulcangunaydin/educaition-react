/**
 * CreateTestRoomModal Molecule
 *
 * Modal for creating new test rooms with type-specific settings.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  MenuItem,
  CircularProgress,
  Alert,
  Autocomplete,
} from "@mui/material";
import Button from "../atoms/Button";
import TextField from "../atoms/TextField";
import { TestType, TEST_TYPE_CONFIG } from "../../services/testRoomService";
import { fetchLiseMapping } from "../../services/liseService";

function CreateTestRoomModal({
  open,
  onClose,
  onSubmit,
  testType: fixedTestType,
  loading = false,
  error = null,
}) {
  const [name, setName] = useState("");
  const [selectedTestType, setSelectedTestType] = useState(fixedTestType || "");
  const [settings, setSettings] = useState({});

  // High school selection for program_suggestion
  const [highSchools, setHighSchools] = useState([]);
  const [selectedHighSchool, setSelectedHighSchool] = useState(null);
  const [highSchoolsLoading, setHighSchoolsLoading] = useState(false);

  // Load high schools when modal opens for program_suggestion type
  useEffect(() => {
    const loadHighSchools = async () => {
      if (
        open &&
        (fixedTestType === TestType.PROGRAM_SUGGESTION ||
          selectedTestType === TestType.PROGRAM_SUGGESTION)
      ) {
        setHighSchoolsLoading(true);
        try {
          const mapping = await fetchLiseMapping("2025");
          const schools = Object.entries(mapping)
            .map(([liseId, info]) => ({
              name: info.lise_adi || "",
              city: info.sehir || "",
              code: liseId,
            }))
            .filter((hs) => hs.name);
          setHighSchools(schools);
        } catch (err) {
          console.error("Error loading high schools:", err);
        } finally {
          setHighSchoolsLoading(false);
        }
      }
    };

    loadHighSchools();
  }, [open, fixedTestType, selectedTestType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const activeTestType = fixedTestType || selectedTestType;

    // For program_suggestion, use high school name as room name
    let roomName = name.trim();
    let roomSettings = { ...settings };

    if (activeTestType === TestType.PROGRAM_SUGGESTION) {
      if (!selectedHighSchool) {
        return;
      }
      roomName = selectedHighSchool.name;
      roomSettings = {
        ...roomSettings,
        high_school_code: selectedHighSchool.code,
        high_school_city: selectedHighSchool.city,
      };
    } else if (!roomName) {
      return;
    }

    const roomData = {
      name: roomName,
      test_type: activeTestType,
      settings: roomSettings,
    };

    try {
      await onSubmit(roomData);
      handleClose();
    } catch (err) {
      // Error is handled by parent
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedTestType(fixedTestType || "");
    setSettings({});
    setSelectedHighSchool(null);
    onClose();
  };

  const testTypeOptions = Object.entries(TEST_TYPE_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  const activeTestType = fixedTestType || selectedTestType;
  const isProgramSuggestion = activeTestType === TestType.PROGRAM_SUGGESTION;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        {fixedTestType
          ? `Yeni ${TEST_TYPE_CONFIG[fixedTestType]?.label || "Test"} Odası Oluştur`
          : "Yeni Test Odası Oluştur"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}

          {!fixedTestType && (
            <TextField
              label="Test Türü"
              select
              value={selectedTestType}
              onChange={(e) => setSelectedTestType(e.target.value)}
              required
              fullWidth
            >
              {testTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Program Suggestion - High School Selector */}
          {isProgramSuggestion && (
            <Autocomplete
              options={highSchools}
              getOptionLabel={(option) => `${option.name} (${option.city})`}
              value={selectedHighSchool}
              onChange={(_, newValue) => setSelectedHighSchool(newValue)}
              loading={highSchoolsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Lise Seçin"
                  required
                  placeholder="Lise adını yazarak arayın..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {highSchoolsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              noOptionsText="Lise bulunamadı"
              loadingText="Yükleniyor..."
            />
          )}

          {/* Room Name - for all types except program_suggestion (which uses high school name) */}
          {!isProgramSuggestion && (
            <TextField
              label="Oda Adı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              fullWidth
              placeholder="Örn: Sınıf 12-A, Dönem Sonu Testi"
            />
          )}

          {/* Prisoners Dilemma - Round Settings */}
          {activeTestType === TestType.PRISONERS_DILEMMA && (
            <TextField
              label="Tur Sayısı"
              type="number"
              value={settings.rounds || 10}
              onChange={(e) => setSettings({ ...settings, rounds: parseInt(e.target.value, 10) })}
              inputProps={{ min: 1, max: 50 }}
              fullWidth
            />
          )}

          {activeTestType === TestType.PERSONALITY_TEST && (
            <Alert severity="info">
              Kişilik testi 60 soru içerir ve Big Five modelini kullanır.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={handleClose} disabled={loading}>
          İptal
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={
            loading ||
            (!fixedTestType && !selectedTestType) ||
            (isProgramSuggestion ? !selectedHighSchool : !name.trim())
          }
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Oluşturuluyor..." : "Oluştur"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CreateTestRoomModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  testType: PropTypes.oneOf(Object.values(TestType)),
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default CreateTestRoomModal;
