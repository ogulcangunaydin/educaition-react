/**
 * SuggestedProgramsCard — v3 — Three-level accordion
 *
 * Structure:
 *   Level 1: Job name (accordion)
 *     Level 2: Program name (accordion)
 *       Level 3: University programs (cards, Haliç first)
 *
 * Data source: flat suggestedPrograms array grouped client-side.
 * Area separation: suggestedJobs / alternativeJobs determine which
 *   programs belong to main vs alternative area.
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Drawer,
  Tooltip,
  Badge,
  Slider,
  Grid,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import StarIcon from "@mui/icons-material/Star";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WorkIcon from "@mui/icons-material/Work";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useTranslation } from "react-i18next";
import jobTranslations from "@data/riasec/job_translations.json";

const normalizeForComparison = (str) =>
  str
    .toLocaleLowerCase("en-US")
    .replace(/[,\-–—]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const translateJob = (englishName) => {
  if (!englishName) return "";
  const normalizedInput = normalizeForComparison(englishName);
  const translation = jobTranslations.find(
    (job) => normalizeForComparison(job.en) === normalizedInput
  );
  return translation ? translation.tr : englishName;
};

// Check if university is Haliç
const isHalicUniversity = (program) => {
  const university = (program?.university || "").toLocaleLowerCase("tr");
  return university.includes("haliç") || university.includes("halic");
};

// Check if university is Vakıf
const isVakif = (program) => {
  const uniType = (program?.university_type || "").toLowerCase();
  return uniType === "vakıf" || uniType === "vakif";
};

/**
 * Build a three-level grouping from a flat program list:
 *   [ { jobName, programNameGroups: [ { programName, programs[], hasHalic } ] } ]
 *
 * Programs within each program-name group are sorted so Haliç comes first.
 */
const buildThreeLevelGroups = (programs) => {
  // Level 1 — group by job
  const jobMap = new Map();
  for (const p of programs) {
    const jobName = p.job || "Genel";
    if (!jobMap.has(jobName)) jobMap.set(jobName, []);
    jobMap.get(jobName).push(p);
  }

  const result = [];
  for (const [jobName, jobPrograms] of jobMap) {
    // Level 2 — group by program name
    const progMap = new Map();
    for (const p of jobPrograms) {
      const progName = p.program || "Diğer";
      if (!progMap.has(progName)) progMap.set(progName, []);
      progMap.get(progName).push(p);
    }

    const programNameGroups = [];
    for (const [progName, progs] of progMap) {
      // Sort Haliç first, then by taban_score descending
      const sorted = [...progs].sort((a, b) => {
        const aH = isHalicUniversity(a) ? 0 : 1;
        const bH = isHalicUniversity(b) ? 0 : 1;
        if (aH !== bH) return aH - bH;
        return (parseFloat(b.taban_score) || 0) - (parseFloat(a.taban_score) || 0);
      });
      programNameGroups.push({
        programName: progName,
        programs: sorted,
        hasHalic: sorted.some(isHalicUniversity),
      });
    }

    // Sort program-name groups: those with Haliç first
    programNameGroups.sort((a, b) => (b.hasHalic ? 1 : 0) - (a.hasHalic ? 1 : 0));

    result.push({ jobName, programNameGroups });
  }

  return result;
};

const AREA_LABELS = {
  say: "Sayısal",
  ea: "Eşit Ağırlık",
  söz: "Sözel",
  dil: "Yabancı Dil",
};

const AREA_COLORS = {
  say: { bg: "#e3f2fd", header: "#1976d2", border: "#1976d2", text: "#1565c0" },
  ea: { bg: "#f3e5f5", header: "#7b1fa2", border: "#9c27b0", text: "#7b1fa2" },
  söz: { bg: "#e8f5e9", header: "#2e7d32", border: "#4caf50", text: "#2e7d32" },
  dil: { bg: "#fff3e0", header: "#e65100", border: "#ff9800", text: "#e65100" },
};

function SuggestedProgramsCard({
  suggestedPrograms,
  suggestedJobs,
  area,
  alternativeArea,
  onProgramClick,
}) {
  const { t } = useTranslation();

  // Area tab
  const [areaTab, setAreaTab] = useState(0);

  // Filter states
  const [universityType, setUniversityType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("");
  const [scoreRange, setScoreRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  // Basket state
  const [basket, setBasket] = useState([]);
  const [basketDrawerOpen, setBasketDrawerOpen] = useState(false);

  // Detail drawer
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  // ---- Area separation using job.area field ----
  const jobAreaMap = useMemo(() => {
    // Build a map: job name (lowercase) -> area code
    const map = new Map();
    for (const j of suggestedJobs || []) {
      const jobKey = (j.job || "").toLowerCase().trim();
      if (jobKey && j.area) map.set(jobKey, j.area);
    }
    return map;
  }, [suggestedJobs]);

  const hasAlternative =
    alternativeArea && [...jobAreaMap.values()].some((a) => a === alternativeArea);

  // Split programs by area
  const { mainPrograms, altPrograms } = useMemo(() => {
    const all = suggestedPrograms || [];
    if (!alternativeArea || jobAreaMap.size === 0) {
      return { mainPrograms: all, altPrograms: [] };
    }
    const main = [];
    const alt = [];
    for (const p of all) {
      const jobKey = (p.job || "").toLowerCase().trim();
      const jobArea = jobAreaMap.get(jobKey);
      if (jobArea === alternativeArea) {
        alt.push(p);
      } else {
        main.push(p);
      }
    }
    return { mainPrograms: main, altPrograms: alt };
  }, [suggestedPrograms, jobAreaMap, alternativeArea]);

  const activePrograms = areaTab === 1 && hasAlternative ? altPrograms : mainPrograms;
  const activeArea = areaTab === 1 && hasAlternative ? alternativeArea : area;
  const areaColors = AREA_COLORS[activeArea] || AREA_COLORS.say;

  // ---- Filters ----
  const passesFilter = useCallback(
    (program) => {
      if (universityType === "devlet" && isVakif(program)) return false;
      if (universityType === "vakif" && !isVakif(program)) return false;
      if (selectedCity && program.city !== selectedCity) return false;
      if (scoreRange[0] > 0 || scoreRange[1] < 500) {
        const score = parseFloat(program.taban_score);
        if (!isNaN(score) && (score < scoreRange[0] || score > scoreRange[1])) return false;
      }
      return true;
    },
    [universityType, selectedCity, scoreRange]
  );

  const filteredPrograms = useMemo(
    () => activePrograms.filter(passesFilter),
    [activePrograms, passesFilter]
  );

  // Build three-level grouping from filtered programs
  const jobGroups = useMemo(() => buildThreeLevelGroups(filteredPrograms), [filteredPrograms]);

  // Unique cities (from active area, unfiltered)
  const uniqueCities = useMemo(() => {
    const cities = new Set(activePrograms.map((p) => p.city).filter(Boolean));
    return Array.from(cities).sort();
  }, [activePrograms]);

  // Score min/max (from active area, unfiltered)
  const scoreMinMax = useMemo(() => {
    const scores = activePrograms
      .map((p) => p.taban_score)
      .filter((s) => s && !isNaN(parseFloat(s)));
    if (scores.length === 0) return [0, 500];
    return [Math.floor(Math.min(...scores)), Math.ceil(Math.max(...scores))];
  }, [activePrograms]);

  // Total counts
  const totalShown = filteredPrograms.length;
  const totalProgramNames = useMemo(
    () => jobGroups.reduce((sum, jg) => sum + jg.programNameGroups.length, 0),
    [jobGroups]
  );

  // ---- Actions ----
  const logProgramClick = useCallback(
    (program, action) => {
      if (onProgramClick) onProgramClick(program, action);
    },
    [onProgramClick]
  );

  const handleGoogleSearch = (program) => {
    logProgramClick(program, "google_search");
    const query = encodeURIComponent(`${program.program} ${program.university}`);
    window.open(`https://www.google.com/search?q=${query}`, "_blank");
  };

  const isInBasket = (program) =>
    basket.some((p) => p.program === program.program && p.university === program.university);

  const toggleBasket = (program) => {
    if (isInBasket(program)) {
      setBasket((prev) =>
        prev.filter((p) => !(p.program === program.program && p.university === program.university))
      );
      logProgramClick(program, "remove_from_basket");
    } else {
      setBasket((prev) => [...prev, program]);
      logProgramClick(program, "add_to_basket");
    }
  };

  const openDetailPanel = (program) => {
    setSelectedProgram(program);
    setDetailDrawerOpen(true);
    logProgramClick(program, "view_details");
  };

  // ---- Render helpers ----

  /** Level 3: single program card */
  const renderProgramRow = (program) => {
    const isHalic = isHalicUniversity(program);
    return (
      <Paper
        key={`${program.yop_kodu || ""}-${program.university}`}
        elevation={isHalic ? 3 : 1}
        sx={{
          p: 1.5,
          mb: 1,
          borderLeft: `4px solid ${isHalic ? "#ffc107" : "#2196f3"}`,
          cursor: "pointer",
          transition: "all 0.2s",
          backgroundColor: isHalic ? "#fffde7" : "inherit",
          "&:hover": { transform: "translateX(4px)", boxShadow: 3 },
        }}
        onClick={() => openDetailPanel(program)}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }} noWrap>
                {program.university}
              </Typography>
              {isHalic && (
                <Tooltip title="Haliç Üniversitesi - Öne Çıkan">
                  <StarIcon sx={{ color: "#ffc107", fontSize: 16 }} />
                </Tooltip>
              )}
            </Box>
            {program.faculty && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {program.faculty}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            {program.taban_score && (
              <Chip
                label={`Taban: ${parseFloat(program.taban_score).toFixed(2)}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {program.scholarship && (
              <Chip
                label={program.scholarship}
                size="small"
                color={program.scholarship === "Burslu" ? "success" : "default"}
              />
            )}
            <Tooltip title="Google'da Ara">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoogleSearch(program);
                }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isInBasket(program) ? "Sepetten Çıkar" : "Sepete Ekle"}>
              <IconButton
                size="small"
                color={isInBasket(program) ? "error" : "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBasket(program);
                }}
              >
                {isInBasket(program) ? (
                  <RemoveShoppingCartIcon fontSize="small" />
                ) : (
                  <AddShoppingCartIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
          {program.city && (
            <Chip
              icon={<LocationOnIcon />}
              label={program.city}
              size="small"
              variant="outlined"
              sx={{ height: 22, "& .MuiChip-label": { fontSize: "0.7rem" } }}
            />
          )}
          {isVakif(program) && (
            <Chip
              label="Vakıf"
              size="small"
              variant="outlined"
              color="warning"
              sx={{ height: 22, "& .MuiChip-label": { fontSize: "0.7rem" } }}
            />
          )}
        </Box>
      </Paper>
    );
  };

  const renderFilters = () => (
    <Box sx={{ mb: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Üniversite Türü</InputLabel>
            <Select
              value={universityType}
              label="Üniversite Türü"
              onChange={(e) => setUniversityType(e.target.value)}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="devlet">Devlet</MenuItem>
              <MenuItem value="vakif">Vakıf</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Şehir</InputLabel>
            <Select
              value={selectedCity}
              label="Şehir"
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <MenuItem value="">Tüm Şehirler</MenuItem>
              {uniqueCities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" gutterBottom display="block">
            Puan Aralığı: {scoreRange[0]} - {scoreRange[1]}
          </Typography>
          <Slider
            value={scoreRange}
            onChange={(_, newValue) => setScoreRange(newValue)}
            min={scoreMinMax[0]}
            max={scoreMinMax[1]}
            valueLabelDisplay="auto"
            size="small"
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary">
          {totalShown} program gösteriliyor ({jobGroups.length} meslek, {totalProgramNames} program
          adı)
        </Typography>
        <Button
          size="small"
          onClick={() => {
            setUniversityType("all");
            setSelectedCity("");
            setScoreRange([scoreMinMax[0], scoreMinMax[1]]);
          }}
        >
          Filtreleri Temizle
        </Button>
      </Box>
    </Box>
  );

  const renderBasketDrawer = () => (
    <Drawer anchor="right" open={basketDrawerOpen} onClose={() => setBasketDrawerOpen(false)}>
      <Box sx={{ width: 350, p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            <ShoppingBasketIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Sepetim ({basket.length})
          </Typography>
          <IconButton onClick={() => setBasketDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {basket.length === 0 ? (
          <Typography color="text.secondary">Sepetiniz boş</Typography>
        ) : (
          <Stack spacing={1}>
            {basket.map((program, idx) => (
              <Accordion
                key={idx}
                disableGutters
                elevation={1}
                sx={{
                  "&:before": { display: "none" },
                  borderLeft: `4px solid ${isHalicUniversity(program) ? "#ffc107" : "#2196f3"}`,
                  backgroundColor: isHalicUniversity(program) ? "#fffde7" : "inherit",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ px: 1.5, py: 0, minHeight: 48 }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }} noWrap>
                        {program.program}
                      </Typography>
                      {isHalicUniversity(program) && (
                        <StarIcon sx={{ color: "#ffc107", fontSize: 14 }} />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {program.university}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}>
                  <Divider sx={{ mb: 1 }} />
                  <Stack spacing={1}>
                    {program.faculty && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Fakülte
                        </Typography>
                        <Typography variant="body2">{program.faculty}</Typography>
                      </Box>
                    )}
                    {program.city && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Şehir
                        </Typography>
                        <Typography variant="body2">{program.city}</Typography>
                      </Box>
                    )}
                    {program.taban_score && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Taban Puan
                        </Typography>
                        <Typography variant="body2">
                          {parseFloat(program.taban_score).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    {program.tavan_score && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Tavan Puan
                        </Typography>
                        <Typography variant="body2">
                          {parseFloat(program.tavan_score).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    {program.scholarship && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Burs Durumu
                        </Typography>
                        <Chip
                          label={program.scholarship}
                          size="small"
                          color={program.scholarship === "Burslu" ? "success" : "default"}
                        />
                      </Box>
                    )}
                    {program.job && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          İlgili Meslek
                        </Typography>
                        <Typography variant="body2">{translateJob(program.job)}</Typography>
                      </Box>
                    )}
                    {program.reason && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Öneri Sebebi
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                          💡 {program.reason}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SearchIcon />}
                      onClick={() => handleGoogleSearch(program)}
                      sx={{ flex: 1 }}
                    >
                      Google
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<RemoveShoppingCartIcon />}
                      onClick={() => toggleBasket(program)}
                      sx={{ flex: 1 }}
                    >
                      Çıkar
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );

  const renderDetailDrawer = () => (
    <Drawer anchor="right" open={detailDrawerOpen} onClose={() => setDetailDrawerOpen(false)}>
      <Box sx={{ width: 400, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Program Detayları</Typography>
          <IconButton onClick={() => setDetailDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {selectedProgram && (
          <Box>
            {isHalicUniversity(selectedProgram) && (
              <Alert severity="info" icon={<StarIcon />} sx={{ mb: 2 }}>
                Haliç Üniversitesi - Öne Çıkan
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              {selectedProgram.program}
            </Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              {selectedProgram.university}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              {selectedProgram.faculty && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fakülte
                  </Typography>
                  <Typography variant="body2">{selectedProgram.faculty}</Typography>
                </Box>
              )}
              {selectedProgram.city && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Şehir
                  </Typography>
                  <Typography variant="body2">{selectedProgram.city}</Typography>
                </Box>
              )}
              {selectedProgram.taban_score && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Taban Puan
                  </Typography>
                  <Typography variant="body2">
                    {parseFloat(selectedProgram.taban_score).toFixed(2)}
                  </Typography>
                </Box>
              )}
              {selectedProgram.tavan_score && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tavan Puan
                  </Typography>
                  <Typography variant="body2">
                    {parseFloat(selectedProgram.tavan_score).toFixed(2)}
                  </Typography>
                </Box>
              )}
              {selectedProgram.scholarship && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Burs Durumu
                  </Typography>
                  <Typography variant="body2">{selectedProgram.scholarship}</Typography>
                </Box>
              )}
              {selectedProgram.job && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    İlgili Meslek
                  </Typography>
                  <Typography variant="body2">{translateJob(selectedProgram.job)}</Typography>
                </Box>
              )}
              {selectedProgram.reason && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Öneri Sebebi
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    💡 {selectedProgram.reason}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={() => handleGoogleSearch(selectedProgram)}
                fullWidth
              >
                Google'da Ara
              </Button>
              <Button
                variant={isInBasket(selectedProgram) ? "outlined" : "contained"}
                color={isInBasket(selectedProgram) ? "error" : "secondary"}
                startIcon={
                  isInBasket(selectedProgram) ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />
                }
                onClick={() => toggleBasket(selectedProgram)}
                fullWidth
              >
                {isInBasket(selectedProgram) ? "Sepetten Çıkar" : "Sepete Ekle"}
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Drawer>
  );

  // ---- Empty state ----
  if (!suggestedPrograms || suggestedPrograms.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Program önerileri hesaplanıyor veya kriterlere uygun program bulunamadı.
      </Alert>
    );
  }

  if (jobGroups.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Filtrelere uygun program bulunamadı. Filtreleri genişletmeyi deneyin.
      </Alert>
    );
  }

  // ---- Main render: three-level accordion ----
  return (
    <>
      <Card>
        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ mb: 0 }}>
                <SchoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Önerilen Programlar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Meslek eşleşmelerinize göre üniversite program önerileri
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Filtreler">
                <IconButton onClick={() => setShowFilters(!showFilters)}>
                  <FilterListIcon color={showFilters ? "primary" : "inherit"} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sepetim">
                <IconButton onClick={() => setBasketDrawerOpen(true)}>
                  <Badge badgeContent={basket.length} color="primary">
                    <ShoppingBasketIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Area tabs */}
          {hasAlternative && (
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              {[
                {
                  label: AREA_LABELS[area] || area,
                  idx: 0,
                  areaKey: area,
                  count: mainPrograms.length,
                },
                {
                  label: AREA_LABELS[alternativeArea] || alternativeArea,
                  idx: 1,
                  areaKey: alternativeArea,
                  count: altPrograms.length,
                },
              ].map(({ label, idx, areaKey, count }) => {
                const colors = AREA_COLORS[areaKey] || AREA_COLORS.say;
                const isActive = areaTab === idx;
                return (
                  <Chip
                    key={idx}
                    label={`${idx === 0 ? "Ana Alan" : "Alternatif Alan"}: ${label} (${count})`}
                    onClick={() => setAreaTab(idx)}
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                      py: 2.5,
                      backgroundColor: isActive ? colors.bg : "transparent",
                      border: `2px solid ${isActive ? colors.border : "#ccc"}`,
                      color: isActive ? colors.text : "text.secondary",
                      cursor: "pointer",
                    }}
                  />
                );
              })}
            </Box>
          )}

          {/* Area indicator */}
          {activeArea && (
            <Chip
              label={`${AREA_LABELS[activeArea] || activeArea} Alanı`}
              size="small"
              sx={{
                mb: 2,
                fontWeight: "bold",
                backgroundColor: areaColors.bg,
                color: areaColors.text,
                border: `1px solid ${areaColors.border}`,
              }}
            />
          )}

          {showFilters && renderFilters()}

          {/* === Level 1: Job accordion === */}
          {jobGroups.map(({ jobName, programNameGroups }, jobIdx) => (
            <Accordion
              key={jobName}
              defaultExpanded={false}
              sx={{
                mb: 2,
                "&:before": { display: "none" },
                boxShadow: 2,
                borderRadius: "8px !important",
                overflow: "hidden",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                sx={{
                  backgroundColor: areaColors.header,
                  color: "#fff",
                  "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1 },
                }}
              >
                <WorkIcon fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", flex: 1 }}>
                  {translateJob(jobName)}
                </Typography>
                <Chip
                  label={`${programNameGroups.length} program adı`}
                  size="small"
                  sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
                />
              </AccordionSummary>

              <AccordionDetails sx={{ p: 1, backgroundColor: "#f5f5f5" }}>
                {/* === Level 2: Program name accordion === */}
                {programNameGroups.map(({ programName, programs, hasHalic }, pnIdx) => (
                  <Accordion
                    key={`${jobName}-${programName}`}
                    defaultExpanded={false}
                    sx={{
                      mb: 1,
                      "&:before": { display: "none" },
                      boxShadow: 1,
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: hasHalic ? "#fffde7" : "#fafafa",
                        borderLeft: hasHalic ? "4px solid #ffc107" : "4px solid #42a5f5",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          width: "100%",
                        }}
                      >
                        <MenuBookIcon fontSize="small" color="action" />
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", flex: 1 }}>
                          {programName}
                        </Typography>
                        {hasHalic && (
                          <Chip
                            label="Haliç"
                            size="small"
                            icon={<StarIcon />}
                            sx={{
                              backgroundColor: "#ffc107",
                              color: "#000",
                              fontWeight: "bold",
                            }}
                          />
                        )}
                        <Chip
                          label={`${programs.length} üniversite`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 1 }}>
                      {/* Show the reason from the first program (they share the same job/reason) */}
                      {programs[0]?.reason && (
                        <Typography
                          variant="body2"
                          sx={{ fontStyle: "italic", mb: 1, color: "text.secondary" }}
                        >
                          💡 {programs[0].reason}
                        </Typography>
                      )}

                      {/* === Level 3: Program cards (Haliç first) === */}
                      {programs.map((program) => renderProgramRow(program))}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center", mt: 2 }}
          >
            Toplam {totalShown} program, {jobGroups.length} meslek, {totalProgramNames} farklı
            program alanından gösteriliyor.
          </Typography>
        </CardContent>
      </Card>

      {renderBasketDrawer()}
      {renderDetailDrawer()}
    </>
  );
}

export default SuggestedProgramsCard;
