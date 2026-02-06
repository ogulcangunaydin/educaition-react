import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  TextField,
  Autocomplete,
  Checkbox,
  FormGroup,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Alert,
} from "@mui/material";
import riasecQuestions from "./RiasecTest/riasecQuestions.json";
import {
  saveParticipantSession,
  getParticipantSession,
  clearParticipantSession,
  SESSION_TYPES,
} from "../services/participantSessionService";
import { fetchUniversityMapping, fetchScoreRankingDistribution } from "../services/liseService";
import { fetchEnums } from "../services/enumService";
import { markTestCompleted } from "@components/atoms/TestPageGuard";
import { TEST_TYPES } from "@config/permissions";
import programSuggestionService from "@services/programSuggestionService";

const steps = [
  "Kişisel Bilgiler",
  "Eğitim Bilgileri",
  "Puan Beklentisi",
  "Tercihler",
  "RIASEC Testi",
];

const BIRTH_YEARS = Array.from({ length: 20 }, (_, i) => 2010 - i);

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Flatten and shuffle RIASEC questions
const getAllQuestions = () => {
  const allQuestions = [];
  Object.values(riasecQuestions).forEach((categoryQuestions) => {
    allQuestions.push(...categoryQuestions);
  });
  return shuffleArray(allQuestions);
};

function ProgramSuggestionTest() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Ref to prevent creating new student when navigating away
  const isNavigatingRef = useRef(false);

  const [activeStep, setActiveStep] = useState(0);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [error, setError] = useState(null);
  const [pendingUniversityNames, setPendingUniversityNames] = useState(null);
  const [scoreDistribution, setScoreDistribution] = useState(null);

  // Enum values from API
  const [enums, setEnums] = useState({
    scoreAreas: [],
    classYears: [],
    preferredLanguages: [],
    cities: [],
    genders: [],
    riasecScoreMap: {},
  });

  // Form data
  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    name: "",
    birthYear: "",
    gender: "",

    // Step 2 - Education Info
    classYear: "",
    willTakeExam: true,
    averageGrade: "",
    area: "",
    wantsForeignLanguage: false,

    // Step 3 - Score Expectations
    expectedScoreRange: [200, 400],
    expectedDistribution: "medium",
    alternativeArea: "",
    alternativeScoreRange: [200, 400],
    alternativeDistribution: "medium",

    // Step 4 - Preferences
    preferredLanguage: "",
    desiredUniversities: [],
    desiredCities: [],
  });

  // RIASEC answers
  const [riasecAnswers, setRiasecAnswers] = useState({});
  const [riasecQuestionsList] = useState(() => getAllQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Load enums from API
  useEffect(() => {
    const loadEnums = async () => {
      try {
        const data = await fetchEnums();
        setEnums({
          scoreAreas: data.scoreAreas || [],
          classYears: data.classYears || [],
          preferredLanguages: data.preferredLanguages || [],
          cities: data.cities || [],
          genders: data.genders || [],
          riasecScoreMap: data.riasecScoreMap || {},
        });
      } catch (error) {
        console.error("Error loading enums:", error);
      }
    };
    loadEnums();
  }, []);

  // Load university list from API
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const data = await fetchUniversityMapping();
        const uniList = Object.keys(data).map((name) => ({
          name,
          code: data[name],
        }));
        setUniversities(uniList);
      } catch (error) {
        console.error("Error loading universities:", error);
      }
    };
    loadUniversities();
  }, []);

  // Load score-ranking distribution data from API
  useEffect(() => {
    const loadScoreDistribution = async () => {
      try {
        const data = await fetchScoreRankingDistribution();
        setScoreDistribution(data);
      } catch (error) {
        console.error("Error loading score distribution:", error);
      }
    };
    loadScoreDistribution();
  }, []);

  // Resolve pending university names once universities are loaded
  useEffect(() => {
    if (universities.length > 0 && pendingUniversityNames) {
      const matchedUniversities = pendingUniversityNames
        .map((name) => universities.find((u) => u.name === name))
        .filter(Boolean);
      setFormData((prev) => ({
        ...prev,
        desiredUniversities: matchedUniversities,
      }));
      setPendingUniversityNames(null);
    }
  }, [universities, pendingUniversityNames]);

  // Create student when component mounts OR restore existing student
  useEffect(() => {
    const sessionType = SESSION_TYPES.PROGRAM_SUGGESTION;

    const fetchExistingStudent = async (existingStudentId, hasValidToken) => {
      try {
        const data = await programSuggestionService.getStudent(existingStudentId);

        // Check if test is already completed
        if (data.status === "completed") {
          // Set flag to prevent creating new student
          isNavigatingRef.current = true;
          // Clear session so next student can start fresh
          clearParticipantSession(sessionType);
          // Navigate to results
          navigate(`/program-test-result/${existingStudentId}`);
          return;
        }

        setStudentId(existingStudentId);

        // Restore form data from existing student
        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          birthYear: data.birth_year || "",
          gender: data.gender || "",
          classYear: data.class_year || "",
          willTakeExam: data.will_take_exam ?? true,
          averageGrade: data.average_grade || "",
          area: data.area || "",
          wantsForeignLanguage: data.wants_foreign_language || false,
          expectedScoreRange: [data.expected_score_min || 200, data.expected_score_max || 400],
          expectedDistribution: data.expected_score_distribution || "medium",
          alternativeArea: data.alternative_area || "",
          alternativeScoreRange: [
            data.alternative_score_min || 200,
            data.alternative_score_max || 400,
          ],
          alternativeDistribution: data.alternative_score_distribution || "medium",
          preferredLanguage: data.preferred_language || "",
          desiredCities: data.desired_cities || [],
        }));

        // Store university names to be resolved once universities are loaded
        if (data.desired_universities && data.desired_universities.length > 0) {
          setPendingUniversityNames(data.desired_universities);
        }

        // Restore RIASEC answers if any
        if (data.riasec_answers) {
          setRiasecAnswers(data.riasec_answers);
          // Find where they left off
          const answeredCount = Object.keys(data.riasec_answers).length;
          if (answeredCount > 0 && answeredCount < riasecQuestionsList.length) {
            setCurrentQuestionIndex(answeredCount);
          }
        }

        // Determine which step to resume from based on status
        const statusToStep = {
          started: 0,
          step1_completed: 1,
          step2_completed: 2,
          step3_completed: 3,
          step4_completed: 4,
          riasec_started: 4,
        };

        const resumeStep = statusToStep[data.status] ?? 0;
        setActiveStep(resumeStep);
      } catch (error) {
        console.error("Error fetching student:", error);
        // Student not found or session invalid, clear and create new
        clearParticipantSession(sessionType);
        createNewStudent();
      }
    };

    const createNewStudent = async () => {
      // Don't create if we're navigating away
      if (isNavigatingRef.current) return;

      try {
        const data = await programSuggestionService.createStudent(roomId);

        // New API returns session_token and student object
        if (data.session_token && data.student) {
          setStudentId(data.student.id);
          // Save session with token for future requests
          saveParticipantSession(sessionType, data);
        } else {
          // Fallback for old API format
          setStudentId(data.id);
        }
      } catch (error) {
        console.error("Error creating student:", error);
        setError("Test başlatılamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
      }
    };

    if (roomId && !isNavigatingRef.current) {
      // Check for existing session token
      const existingSession = getParticipantSession(sessionType);
      if (existingSession && existingSession.participantId) {
        fetchExistingStudent(existingSession.participantId, true);
      } else {
        // Fallback: check old localStorage format for backward compatibility
        const storageKey = `program_suggestion_student_${roomId}`;
        const oldStudentId = localStorage.getItem(storageKey);
        if (oldStudentId) {
          // Migrate: try to fetch without token (will fail if routes require auth)
          fetchExistingStudent(parseInt(oldStudentId), false);
          // Clean up old storage
          localStorage.removeItem(storageKey);
        } else {
          createNewStudent();
        }
      }
    }
  }, [roomId, navigate, riasecQuestionsList.length]);

  // Estimate ranking based on score for a given area
  const estimateRanking = useMemo(() => {
    return (score, area) => {
      if (!scoreDistribution || !area) return null;

      const areaData = scoreDistribution[area.toLowerCase()];
      if (!areaData || !areaData.distribution) return null;

      const distribution = areaData.distribution;

      // Find the closest score bucket
      let closestIdx = 0;
      let minDiff = Infinity;

      for (let i = 0; i < distribution.length; i++) {
        const diff = Math.abs(distribution[i].score - score);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }

      return distribution[closestIdx].avgRanking;
    };
  }, [scoreDistribution]);

  // Format ranking with thousands separator
  const formatRanking = (ranking) => {
    if (!ranking) return "—";
    return ranking.toLocaleString("tr-TR");
  };

  // Get min/max scores for area
  const getScoreBounds = useMemo(() => {
    return (area) => {
      if (!scoreDistribution || !area) return { min: 100, max: 560 };
      const areaData = scoreDistribution[area.toLowerCase()];
      if (!areaData) return { min: 100, max: 560 };
      return { min: areaData.minScore, max: areaData.maxScore };
    };
  }, [scoreDistribution]);

  const handleNext = async () => {
    setLoading(true);
    setError(null);
    const sessionType = SESSION_TYPES.PROGRAM_SUGGESTION;

    try {
      if (activeStep === 0) {
        // Save Step 1
        await programSuggestionService.updateStep1(studentId, {
          name: formData.name,
          birth_year: parseInt(formData.birthYear),
          gender: formData.gender,
        });
      } else if (activeStep === 1) {
        // Save Step 2
        await programSuggestionService.updateStep2(studentId, {
          class_year: formData.classYear,
          will_take_exam: formData.willTakeExam,
          average_grade: formData.averageGrade ? parseFloat(formData.averageGrade) : null,
          area: formData.area,
          wants_foreign_language: formData.wantsForeignLanguage,
        });
      } else if (activeStep === 2) {
        // Save Step 3
        await programSuggestionService.updateStep3(studentId, {
          expected_score_min: formData.expectedScoreRange[0],
          expected_score_max: formData.expectedScoreRange[1],
          expected_score_distribution: formData.expectedDistribution,
          alternative_area: formData.alternativeArea || null,
          alternative_score_min: formData.alternativeArea
            ? formData.alternativeScoreRange[0]
            : null,
          alternative_score_max: formData.alternativeArea
            ? formData.alternativeScoreRange[1]
            : null,
          alternative_score_distribution: formData.alternativeArea
            ? formData.alternativeDistribution
            : null,
        });
      } else if (activeStep === 3) {
        // Save Step 4
        // Add Haliç Üniversitesi as default (always included but not shown)
        const universitiesWithDefault = [
          ...formData.desiredUniversities.map((u) => u.name),
          "HALİÇ ÜNİVERSİTESİ",
        ];
        // Remove duplicates
        const uniqueUniversities = [...new Set(universitiesWithDefault)];

        await programSuggestionService.updateStep4(studentId, {
          preferred_language: formData.preferredLanguage,
          desired_universities: uniqueUniversities,
          desired_cities: formData.desiredCities,
        });
      }

      setActiveStep((prevStep) => prevStep + 1);
    } catch (error) {
      console.error("Error saving step:", error);
      setError("Veriler kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleRiasecAnswer = async (questionId, answer) => {
    const newAnswers = { ...riasecAnswers, [questionId]: enums.riasecScoreMap[answer] };
    setRiasecAnswers(newAnswers);
    const sessionType = SESSION_TYPES.PROGRAM_SUGGESTION;

    // Move to next question or finish
    if (currentQuestionIndex < riasecQuestionsList.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered - submit and get results
      setLoading(true);
      try {
        await programSuggestionService.submitRiasec(studentId, { riasec_answers: newAnswers });

        // Mark test as completed (prevents retaking on same device)
        await markTestCompleted(TEST_TYPES.PROGRAM_SUGGESTION, roomId);
        // Set flag to prevent creating new student during navigation
        isNavigatingRef.current = true;
        // Clear session so next student can start fresh
        clearParticipantSession(sessionType);
        // Navigate to results
        navigate(`/program-test-result/${studentId}`);
      } catch (error) {
        console.error("Error submitting RIASEC:", error);
        setError("Sonuçlar gönderilirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.name && formData.birthYear && formData.gender;
      case 1:
        return formData.classYear && formData.area;
      case 2:
        return formData.expectedScoreRange[0] < formData.expectedScoreRange[1];
      case 3:
        return formData.preferredLanguage && formData.desiredCities.length > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6">1.1 Kişisel Bilgiler</Typography>

            <FormControl component="fieldset">
              <FormLabel>Ad Soyad</FormLabel>
              <TextField
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Adınızı ve soyadınızı girin"
                fullWidth
              />
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel>Doğum Yılı</FormLabel>
              <Autocomplete
                options={BIRTH_YEARS}
                value={formData.birthYear || null}
                onChange={(e, value) => setFormData({ ...formData, birthYear: value })}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Doğum yılınızı seçin" />
                )}
                getOptionLabel={(option) => option.toString()}
              />
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel>Cinsiyet</FormLabel>
              <RadioGroup
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <FormControlLabel value="erkek" control={<Radio />} label="Erkek" />
                <FormControlLabel value="kadın" control={<Radio />} label="Kadın" />
                <FormControlLabel
                  value="belirtilmedi"
                  control={<Radio />}
                  label="Belirtmek İstemiyorum"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6">1.2 Eğitim Bilgileri</Typography>

            <FormControl component="fieldset">
              <FormLabel>Sınıf</FormLabel>
              <RadioGroup
                value={formData.classYear}
                onChange={(e) => setFormData({ ...formData, classYear: e.target.value })}
              >
                {enums.classYears.map((cy) => (
                  <FormControlLabel
                    key={cy.value}
                    value={cy.value}
                    control={<Radio />}
                    label={cy.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel>Üniversite sınavına girecek misiniz?</FormLabel>
              <RadioGroup
                value={formData.willTakeExam ? "yes" : "no"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    willTakeExam: e.target.value === "yes",
                  })
                }
              >
                <FormControlLabel value="yes" control={<Radio />} label="Evet" />
                <FormControlLabel value="no" control={<Radio />} label="Hayır" />
              </RadioGroup>
            </FormControl>

            <TextField
              label="Ortalama Başarı Notu (Opsiyonel)"
              type="number"
              value={formData.averageGrade}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
                  setFormData({ ...formData, averageGrade: value });
                }
              }}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              helperText="0-100 arası not ortalamanız"
            />

            <FormControl component="fieldset" required>
              <FormLabel>Alan Seçimi</FormLabel>
              <RadioGroup
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              >
                {enums.scoreAreas.map((area) => (
                  <FormControlLabel
                    key={area.value}
                    value={area.value}
                    control={<Radio />}
                    label={area.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 2:
        const scoreBounds = getScoreBounds(formData.area);
        const midScore = Math.round(
          (formData.expectedScoreRange[0] + formData.expectedScoreRange[1]) / 2
        );
        const estimatedRanking = estimateRanking(midScore, formData.area);
        const altScoreBounds = formData.alternativeArea
          ? getScoreBounds(formData.alternativeArea)
          : { min: 100, max: 560 };
        const altMidScore = Math.round(
          (formData.alternativeScoreRange[0] + formData.alternativeScoreRange[1]) / 2
        );
        const altEstimatedRanking = formData.alternativeArea
          ? estimateRanking(altMidScore, formData.alternativeArea)
          : null;

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6">1.3 Puan Beklentisi</Typography>

            <Box>
              <FormLabel>Beklediğiniz Puan Aralığı ({formData.area.toUpperCase()})</FormLabel>
              <Slider
                value={formData.expectedScoreRange}
                onChange={(e, value) => setFormData({ ...formData, expectedScoreRange: value })}
                min={scoreBounds.min}
                max={scoreBounds.max}
                step={5}
                valueLabelDisplay="on"
                marks={[
                  { value: scoreBounds.min, label: String(scoreBounds.min) },
                  {
                    value: Math.round((scoreBounds.min + scoreBounds.max) / 2),
                    label: String(Math.round((scoreBounds.min + scoreBounds.max) / 2)),
                  },
                  { value: scoreBounds.max, label: String(scoreBounds.max) },
                ]}
                sx={{ mt: 4, mb: 2 }}
              />

              {/* Show estimated ranking below the slider */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 1,
                  bgcolor: "primary.50",
                  border: "1px solid",
                  borderColor: "primary.200",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tahmini Sıralama (Orta puan: {midScore})
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  {formatRanking(estimatedRanking)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Bu sıralama, geçen yılın verilerine göre seçtiğiniz puan aralığının ortasına denk
                  gelen tahmini sıralamadır.
                </Typography>
              </Paper>
            </Box>

            <FormControl component="fieldset">
              <FormLabel>Alternatif bir alanda tercih yapmak ister misiniz?</FormLabel>
              <RadioGroup
                value={formData.alternativeArea}
                onChange={(e) => setFormData({ ...formData, alternativeArea: e.target.value })}
              >
                <FormControlLabel value="" control={<Radio />} label="Hayır" />
                {enums.scoreAreas
                  .filter((a) => a.value !== formData.area)
                  .map((area) => (
                    <FormControlLabel
                      key={area.value}
                      value={area.value}
                      control={<Radio />}
                      label={area.label}
                    />
                  ))}
              </RadioGroup>
            </FormControl>

            {formData.alternativeArea && (
              <Box>
                <FormLabel>
                  Alternatif Alan Puan Aralığı ({formData.alternativeArea.toUpperCase()})
                </FormLabel>
                <Slider
                  value={formData.alternativeScoreRange}
                  onChange={(e, value) =>
                    setFormData({ ...formData, alternativeScoreRange: value })
                  }
                  min={altScoreBounds.min}
                  max={altScoreBounds.max}
                  step={5}
                  valueLabelDisplay="on"
                  marks={[
                    {
                      value: altScoreBounds.min,
                      label: String(altScoreBounds.min),
                    },
                    {
                      value: Math.round((altScoreBounds.min + altScoreBounds.max) / 2),
                      label: String(Math.round((altScoreBounds.min + altScoreBounds.max) / 2)),
                    },
                    {
                      value: altScoreBounds.max,
                      label: String(altScoreBounds.max),
                    },
                  ]}
                  sx={{ mt: 4, mb: 2 }}
                />

                {/* Show estimated ranking for alternative area */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mt: 1,
                    bgcolor: "secondary.50",
                    border: "1px solid",
                    borderColor: "secondary.200",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tahmini Sıralama (Orta puan: {altMidScore})
                  </Typography>
                  <Typography variant="h5" color="secondary.main" fontWeight="bold">
                    {formatRanking(altEstimatedRanking)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bu sıralama, geçen yılın verilerine göre seçtiğiniz puan aralığının ortasına
                    denk gelen tahmini sıralamadır.
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6">1.4 Tercihler</Typography>

            <FormControl component="fieldset" required>
              <FormLabel>Tercih ettiğiniz eğitim dili</FormLabel>
              <RadioGroup
                value={formData.preferredLanguage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredLanguage: e.target.value,
                  })
                }
              >
                {enums.preferredLanguages.map((lang) => (
                  <FormControlLabel
                    key={lang.value}
                    value={lang.value}
                    control={<Radio />}
                    label={lang.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Autocomplete
              multiple
              options={universities}
              getOptionLabel={(option) => option.name}
              value={formData.desiredUniversities}
              onChange={(e, value) => setFormData({ ...formData, desiredUniversities: value })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tercih ettiğiniz üniversiteler (Opsiyonel)"
                  placeholder="Üniversite ara..."
                />
              )}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLocaleLowerCase("tr-TR");
                return options
                  .filter((option) => option.name.toLocaleLowerCase("tr-TR").includes(searchTerm))
                  .slice(0, 30);
              }}
            />

            <FormControl component="fieldset" required>
              <FormLabel>Tercih ettiğiniz şehirler</FormLabel>
              <FormGroup>
                {enums.cities.map((city) => (
                  <FormControlLabel
                    key={city.value}
                    control={
                      <Checkbox
                        checked={formData.desiredCities.includes(city.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              desiredCities: [...formData.desiredCities, city.value],
                            });
                          } else {
                            setFormData({
                              ...formData,
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
            </FormControl>
          </Box>
        );

      case 4:
        const currentQuestion = riasecQuestionsList[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / riasecQuestionsList.length) * 100;

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6">RIASEC Kariyer Testi</Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Soru {currentQuestionIndex + 1} / {riasecQuestionsList.length}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Card sx={{ p: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
                  {currentQuestion.text}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    mt: 3,
                  }}
                >
                  {[
                    {
                      value: "strongly_like",
                      label: "Çok Severim",
                      color: "#4caf50",
                    },
                    { value: "like", label: "Severim", color: "#8bc34a" },
                    { value: "unsure", label: "Kararsızım", color: "#ff9800" },
                    { value: "dislike", label: "Sevmem", color: "#ff5722" },
                    {
                      value: "strongly_dislike",
                      label: "Hiç Sevmem",
                      color: "#f44336",
                    },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant="outlined"
                      onClick={() => handleRiasecAnswer(currentQuestion.id, option.value)}
                      sx={{
                        py: 1.5,
                        borderColor: option.color,
                        color: option.color,
                        "&:hover": {
                          backgroundColor: option.color,
                          color: "white",
                        },
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!studentId && !error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Test hazırlanıyor...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        py: 4,
      }}
    >
      <Paper sx={{ maxWidth: 700, margin: "0 auto", p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 4 }}>
          Program Öneri Testi
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {renderStep()}

            {activeStep < 4 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Geri
                </Button>
                <Button variant="contained" onClick={handleNext} disabled={!isStepValid()}>
                  {activeStep === 3 ? "RIASEC Testine Başla" : "Devam Et"}
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}

export default ProgramSuggestionTest;
