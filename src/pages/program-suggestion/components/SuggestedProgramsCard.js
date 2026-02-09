/**
 * SuggestedProgramsCard — Displays university program recommendations
 *
 * Features:
 * - Filters: Vakıf/Devlet, Şehir, score range
 * - Pagination (Top 200, lazy load)
 * - Google search button for each program
 * - Basket functionality ("Sepete Ekle")
 * - Side panel for department details
 * - Haliç Üniversitesi priority badge
 * - Click logging for analytics
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
  TextField,
  Button,
  IconButton,
  Drawer,
  Tooltip,
  Badge,
  Pagination,
  Slider,
  Grid,
  Stack,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import InfoIcon from "@mui/icons-material/Info";
import StarIcon from "@mui/icons-material/Star";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import jobTranslations from "@data/riasec/job_translations.json";

const normalizeForComparison = (str) =>
  str
    .toLocaleLowerCase("en-US")
    .replace(/[,\-–—]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const translateJob = (englishName) => {
  const normalizedInput = normalizeForComparison(englishName);
  const translation = jobTranslations.find(
    (job) => normalizeForComparison(job.en) === normalizedInput
  );
  return translation ? translation.tr : englishName;
};

// Priority universities for special badge display
const PRIORITY_UNIVERSITIES = ["Haliç Üniversitesi", "Halic Universitesi"];

// Items per page
const ITEMS_PER_PAGE = 20;
const MAX_PROGRAMS = 200;

function SuggestedProgramsCard({ suggestedPrograms, onProgramClick }) {
  const { t } = useTranslation();

  // Filter states
  const [universityType, setUniversityType] = useState("all"); // all, devlet, vakif
  const [selectedCity, setSelectedCity] = useState("");
  const [scoreRange, setScoreRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  // Basket state
  const [basket, setBasket] = useState([]);
  const [basketDrawerOpen, setBasketDrawerOpen] = useState(false);

  // Side panel for program details
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  // Extract unique cities from programs
  const uniqueCities = useMemo(() => {
    if (!suggestedPrograms) return [];
    const cities = new Set(suggestedPrograms.map((p) => p.city).filter(Boolean));
    return Array.from(cities).sort();
  }, [suggestedPrograms]);

  // Get score range from programs
  const scoreMinMax = useMemo(() => {
    if (!suggestedPrograms || suggestedPrograms.length === 0) return [0, 500];
    const scores = suggestedPrograms
      .map((p) => p.taban_score)
      .filter((s) => s && !isNaN(parseFloat(s)));
    if (scores.length === 0) return [0, 500];
    return [Math.floor(Math.min(...scores)), Math.ceil(Math.max(...scores))];
  }, [suggestedPrograms]);

  // Check if university is Vakıf using backend data (university_type field)
  const isVakif = (program) => {
    // Use the university_type field from backend if available
    const uniType = program?.university_type?.toLowerCase() || "";
    return uniType === "vakıf" || uniType === "vakif";
  };

  // Check if program is from Haliç University
  const isHalicUniversity = (program) => {
    const university = program?.university || "";
    // Check for Turkish uppercase and lowercase variations
    return (
      university.includes("HALİÇ") ||
      university.includes("Haliç") ||
      university.includes("haliç") ||
      university.includes("HALIC") ||
      university.includes("Halic") ||
      university.includes("halic")
    );
  };

  // Filter and limit programs
  const filteredPrograms = useMemo(() => {
    if (!suggestedPrograms) return [];

    // STEP 1: Separate Haliç programs from others
    const halicPrograms = suggestedPrograms.filter((p) => isHalicUniversity(p));
    const otherPrograms = suggestedPrograms.filter((p) => !isHalicUniversity(p));

    // STEP 2: Combine: Haliç first, then others (preserving original order within each group)
    const sortedPrograms = [...halicPrograms, ...otherPrograms];

    // STEP 3: Limit to MAX_PROGRAMS
    let filtered = sortedPrograms.slice(0, MAX_PROGRAMS);

    // STEP 4: Apply filters
    // University type filter - use backend's university_type field
    if (universityType === "devlet") {
      filtered = filtered.filter((p) => !isVakif(p));
    } else if (universityType === "vakif") {
      filtered = filtered.filter((p) => isVakif(p));
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter((p) => p.city === selectedCity);
    }

    // Score range filter
    if (scoreRange[0] > 0 || scoreRange[1] < 500) {
      filtered = filtered.filter((p) => {
        const score = parseFloat(p.taban_score);
        if (isNaN(score)) return true; // Keep programs without scores
        return score >= scoreRange[0] && score <= scoreRange[1];
      });
    }

    return filtered;
  }, [suggestedPrograms, universityType, selectedCity, scoreRange]);

  // Paginate
  const paginatedPrograms = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredPrograms.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPrograms, page]);

  const totalPages = Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE);

  // Log click for analytics
  const logProgramClick = useCallback(
    (program, action) => {
      console.log("[Analytics] Program action:", {
        action,
        program: program.program,
        university: program.university,
        city: program.city,
        taban_score: program.taban_score,
        timestamp: new Date().toISOString(),
      });

      // Call external callback if provided
      if (onProgramClick) {
        onProgramClick(program, action);
      }
    },
    [onProgramClick]
  );

  // Google search handler
  const handleGoogleSearch = (program) => {
    logProgramClick(program, "google_search");
    const query = encodeURIComponent(`${program.program} ${program.university}`);
    window.open(`https://www.google.com/search?q=${query}`, "_blank");
  };

  // Basket handlers
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

  // Open detail panel
  const openDetailPanel = (program) => {
    setSelectedProgram(program);
    setDetailDrawerOpen(true);
    logProgramClick(program, "view_details");
  };

  // Check if priority university
  const isPriorityUniversity = (university) =>
    PRIORITY_UNIVERSITIES.some((pu) => university?.toLowerCase().includes(pu.toLowerCase()));

  // Count Haliç programs in filtered list for proper indexing of other programs
  const halicCount = useMemo(() => {
    return filteredPrograms.filter((p) => isHalicUniversity(p)).length;
  }, [filteredPrograms]);

  const getBorderColor = (globalIndex, program) => {
    // Haliç programs always get gold
    if (isHalicUniversity(program)) return "#ffc107";

    // For other programs, calculate their index within the non-Haliç group
    const nonHalicIndex = globalIndex - halicCount;
    if (nonHalicIndex < 3) return "#4caf50";
    if (nonHalicIndex < 6) return "#2196f3";
    return "#9c27b0";
  };

  if (!suggestedPrograms || suggestedPrograms.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        {t("tests.programSuggestion.result.suggestedPrograms.noResults", {
          defaultValue: "Program önerileri hesaplanıyor veya kriterlere uygun program bulunamadı.",
        })}
      </Alert>
    );
  }

  const renderFilters = () => (
    <Box sx={{ mb: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>
              {t("tests.programSuggestion.result.suggestedPrograms.universityType", {
                defaultValue: "Üniversite Türü",
              })}
            </InputLabel>
            <Select
              value={universityType}
              label={t("tests.programSuggestion.result.suggestedPrograms.universityType", {
                defaultValue: "Üniversite Türü",
              })}
              onChange={(e) => {
                setUniversityType(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="all">
                {t("tests.programSuggestion.result.suggestedPrograms.allTypes", {
                  defaultValue: "Tümü",
                })}
              </MenuItem>
              <MenuItem value="devlet">
                {t("tests.programSuggestion.result.suggestedPrograms.devlet", {
                  defaultValue: "Devlet",
                })}
              </MenuItem>
              <MenuItem value="vakif">
                {t("tests.programSuggestion.result.suggestedPrograms.vakif", {
                  defaultValue: "Vakıf",
                })}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>
              {t("tests.programSuggestion.result.suggestedPrograms.city", {
                defaultValue: "Şehir",
              })}
            </InputLabel>
            <Select
              value={selectedCity}
              label={t("tests.programSuggestion.result.suggestedPrograms.city", {
                defaultValue: "Şehir",
              })}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">
                {t("tests.programSuggestion.result.suggestedPrograms.allCities", {
                  defaultValue: "Tüm Şehirler",
                })}
              </MenuItem>
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
            {t("tests.programSuggestion.result.suggestedPrograms.scoreRange", {
              defaultValue: "Puan Aralığı",
            })}
            : {scoreRange[0]} - {scoreRange[1]}
          </Typography>
          <Slider
            value={scoreRange}
            onChange={(_, newValue) => setScoreRange(newValue)}
            onChangeCommitted={() => setPage(1)}
            min={scoreMinMax[0]}
            max={scoreMinMax[1]}
            valueLabelDisplay="auto"
            size="small"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary">
          {t("tests.programSuggestion.result.suggestedPrograms.showingCount", {
            count: filteredPrograms.length,
            total: Math.min(suggestedPrograms.length, MAX_PROGRAMS),
            defaultValue: `${filteredPrograms.length} / ${Math.min(suggestedPrograms.length, MAX_PROGRAMS)} program gösteriliyor`,
          })}
        </Typography>
        <Button
          size="small"
          onClick={() => {
            setUniversityType("all");
            setSelectedCity("");
            setScoreRange([scoreMinMax[0], scoreMinMax[1]]);
            setPage(1);
          }}
        >
          {t("tests.programSuggestion.result.suggestedPrograms.clearFilters", {
            defaultValue: "Filtreleri Temizle",
          })}
        </Button>
      </Box>
    </Box>
  );

  const renderBasketDrawer = () => (
    <Drawer anchor="right" open={basketDrawerOpen} onClose={() => setBasketDrawerOpen(false)}>
      <Box sx={{ width: 350, p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">
            <ShoppingBasketIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            {t("tests.programSuggestion.result.suggestedPrograms.basket", {
              defaultValue: "Sepetim",
            })}
            ({basket.length})
          </Typography>
          <IconButton onClick={() => setBasketDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {basket.length === 0 ? (
          <Typography color="text.secondary">
            {t("tests.programSuggestion.result.suggestedPrograms.emptyBasket", {
              defaultValue: "Sepetiniz boş",
            })}
          </Typography>
        ) : (
          <Stack spacing={1}>
            {basket.map((program, idx) => (
              <Paper key={idx} sx={{ p: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {program.program}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {program.university}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <IconButton size="small" onClick={() => toggleBasket(program)}>
                    <RemoveShoppingCartIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );

  const renderDetailDrawer = () => (
    <Drawer anchor="right" open={detailDrawerOpen} onClose={() => setDetailDrawerOpen(false)}>
      <Box sx={{ width: 400, p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">
            {t("tests.programSuggestion.result.suggestedPrograms.programDetails", {
              defaultValue: "Program Detayları",
            })}
          </Typography>
          <IconButton onClick={() => setDetailDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {selectedProgram && (
          <Box>
            {isPriorityUniversity(selectedProgram.university) && (
              <Alert severity="info" icon={<StarIcon />} sx={{ mb: 2 }}>
                {t("tests.programSuggestion.result.suggestedPrograms.priorityUniversity", {
                  defaultValue: "Öne Çıkan Üniversite",
                })}
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
                    {t("tests.programSuggestion.result.suggestedPrograms.faculty", {
                      defaultValue: "Fakülte",
                    })}
                  </Typography>
                  <Typography variant="body2">{selectedProgram.faculty}</Typography>
                </Box>
              )}

              {selectedProgram.city && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("tests.programSuggestion.result.suggestedPrograms.city", {
                      defaultValue: "Şehir",
                    })}
                  </Typography>
                  <Typography variant="body2">{selectedProgram.city}</Typography>
                </Box>
              )}

              {selectedProgram.taban_score && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("tests.programSuggestion.result.suggestedPrograms.baseScore", {
                      defaultValue: "Taban Puan",
                    })}
                  </Typography>
                  <Typography variant="body2">{selectedProgram.taban_score}</Typography>
                </Box>
              )}

              {selectedProgram.scholarship && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("tests.programSuggestion.result.suggestedPrograms.scholarship", {
                      defaultValue: "Burs Durumu",
                    })}
                  </Typography>
                  <Typography variant="body2">{selectedProgram.scholarship}</Typography>
                </Box>
              )}

              {selectedProgram.job && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("tests.programSuggestion.result.suggestedPrograms.relatedJob", {
                      defaultValue: "İlgili Meslek",
                    })}
                  </Typography>
                  <Typography variant="body2">{translateJob(selectedProgram.job)}</Typography>
                </Box>
              )}

              {selectedProgram.reason && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("tests.programSuggestion.result.suggestedPrograms.reason", {
                      defaultValue: "Öneri Sebebi",
                    })}
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
                {t("tests.programSuggestion.result.suggestedPrograms.googleSearch", {
                  defaultValue: "Google'da Ara",
                })}
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
                {isInBasket(selectedProgram)
                  ? t("tests.programSuggestion.result.suggestedPrograms.removeFromBasket", {
                      defaultValue: "Sepetten Çıkar",
                    })
                  : t("tests.programSuggestion.result.suggestedPrograms.addToBasket", {
                      defaultValue: "Sepete Ekle",
                    })}
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Drawer>
  );

  return (
    <>
      <Card>
        <CardContent>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
          >
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                <SchoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                {t("tests.programSuggestion.result.suggestedPrograms.title", {
                  defaultValue: "Önerilen Programlar",
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("tests.programSuggestion.result.suggestedPrograms.subtitle", {
                  defaultValue: "Profilinize ve tercihlerinize uygun üniversite programları",
                })}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip
                title={t("tests.programSuggestion.result.suggestedPrograms.filters", {
                  defaultValue: "Filtreler",
                })}
              >
                <IconButton onClick={() => setShowFilters(!showFilters)}>
                  <FilterListIcon color={showFilters ? "primary" : "inherit"} />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={t("tests.programSuggestion.result.suggestedPrograms.basket", {
                  defaultValue: "Sepetim",
                })}
              >
                <IconButton onClick={() => setBasketDrawerOpen(true)}>
                  <Badge badgeContent={basket.length} color="primary">
                    <ShoppingBasketIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {showFilters && renderFilters()}

          {paginatedPrograms.map((program, index) => {
            const globalIndex = (page - 1) * ITEMS_PER_PAGE + index;

            return (
              <Paper
                key={globalIndex}
                elevation={isPriorityUniversity(program.university) ? 3 : 1}
                sx={{
                  p: 2,
                  mb: 2,
                  borderLeft: `4px solid ${getBorderColor(globalIndex, program)}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateX(4px)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => openDetailPanel(program)}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        {globalIndex + 1}. {program.program}
                      </Typography>
                      {isPriorityUniversity(program.university) && (
                        <Tooltip
                          title={t(
                            "tests.programSuggestion.result.suggestedPrograms.priorityUniversity",
                            {
                              defaultValue: "Öne Çıkan Üniversite",
                            }
                          )}
                        >
                          <StarIcon sx={{ color: "#ffc107", fontSize: 18 }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {program.university}
                    </Typography>
                    {program.faculty && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {program.faculty}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {program.taban_score && (
                      <Chip
                        label={`${t("tests.programSuggestion.result.suggestedPrograms.baseScore", {
                          defaultValue: "Taban",
                        })}: ${program.taban_score}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}

                    <Tooltip
                      title={t("tests.programSuggestion.result.suggestedPrograms.googleSearch", {
                        defaultValue: "Google'da Ara",
                      })}
                    >
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

                    <Tooltip
                      title={
                        isInBasket(program)
                          ? t("tests.programSuggestion.result.suggestedPrograms.removeFromBasket", {
                              defaultValue: "Sepetten Çıkar",
                            })
                          : t("tests.programSuggestion.result.suggestedPrograms.addToBasket", {
                              defaultValue: "Sepete Ekle",
                            })
                      }
                    >
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

                    <Tooltip
                      title={t("tests.programSuggestion.result.suggestedPrograms.details", {
                        defaultValue: "Detaylar",
                      })}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailPanel(program);
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {program.city && (
                    <Chip
                      icon={<LocationOnIcon />}
                      label={program.city}
                      size="small"
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
                  {program.job && (
                    <Chip
                      label={`${t("tests.programSuggestion.result.suggestedJobs.title", {
                        defaultValue: "Meslek",
                      })}: ${translateJob(program.job)}`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  {isVakif(program) && (
                    <Chip
                      label={t("tests.programSuggestion.result.suggestedPrograms.vakif", {
                        defaultValue: "Vakıf",
                      })}
                      size="small"
                      variant="outlined"
                      color="warning"
                    />
                  )}
                </Box>

                {program.reason && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                    💡 {program.reason}
                  </Typography>
                )}
              </Paper>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center", mt: 2 }}
          >
            {t("tests.programSuggestion.result.suggestedPrograms.maxPrograms", {
              max: MAX_PROGRAMS,
              defaultValue: `En fazla ${MAX_PROGRAMS} program gösterilmektedir.`,
            })}
          </Typography>
        </CardContent>
      </Card>

      {renderBasketDrawer()}
      {renderDetailDrawer()}
    </>
  );
}

export default SuggestedProgramsCard;
