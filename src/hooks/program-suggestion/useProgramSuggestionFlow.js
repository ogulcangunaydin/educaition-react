/**
 * useProgramSuggestionFlow Hook
 *
 * Manages the complete program suggestion test lifecycle:
 * - Stage management: loading → registration → test
 * - Registration via TestRegistrationCard (same pattern as other tests)
 * - Session restoration for returning users
 * - Multi-step form navigation with validation
 * - RIASEC question flow with shuffled questions
 * - Step-by-step API persistence
 * - Navigation to results on completion
 *
 * Uses the common TestRegistrationCard + participantSessionService pattern
 * for registration (same as personality test, dissonance test, etc.).
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@contexts/AuthContext";
import { getDeviceFingerprint } from "@utils/deviceFingerprint";
import { getTestEndpoints, TestType } from "@services/testRoomService";
import riasecQuestions from "@data/riasec/riasecQuestions.json";
import {
  saveParticipantSession,
  getParticipantSession,
  clearParticipantSession,
  SESSION_TYPES,
} from "@services/participantSessionService";
import { fetchUniversityMapping, fetchScoreRankingDistribution } from "@services/liseService";
import useEnums from "@hooks/useEnums";
import programSuggestionService from "@services/programSuggestionService";

const SESSION_TYPE = SESSION_TYPES.PROGRAM_SUGGESTION;

// Fisher-Yates shuffle
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

const BIRTH_YEARS = Array.from({ length: 20 }, (_, i) => 2010 - i);

const INITIAL_FORM_DATA = {
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
};

const STATUS_TO_STEP = {
  started: 0,
  step1_completed: 1,
  step2_completed: 2,
  step3_completed: 3,
  step4_completed: 4,
  riasec_started: 4,
};

export default function useProgramSuggestionFlow() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userId } = useAuth();
  const isNavigatingRef = useRef(false);

  // ── Stage: loading → registration → test ───────────────
  const [stage, setStage] = useState("loading");

  // ── Device fingerprint (async — resolved on mount) ─────
  const [deviceId, setDeviceId] = useState(null);

  // ── Registration URL (from shared test config) ─────────
  const { registrationUrl } = getTestEndpoints(TestType.PROGRAM_SUGGESTION);

  // ── Core state ─────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Data state ─────────────────────────────────────────
  const [universities, setUniversities] = useState([]);
  const [pendingUniversityNames, setPendingUniversityNames] = useState(null);
  const [scoreDistribution, setScoreDistribution] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // ── RIASEC state (array-based for TestQuestionCard) ────
  const [riasecAnswers, setRiasecAnswers] = useState([]);
  const [riasecQuestionsList] = useState(() => getAllQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [riasecSubmitting, setRiasecSubmitting] = useState(false);

  // ── Enums via shared hook ──────────────────────────────
  const { enums: enumData, isReady: enumsReady } = useEnums([
    "scoreAreas",
    "classYears",
    "preferredLanguages",
    "cities",
    "genders",
    "riasecScoreMap",
  ]);

  // ── Resolve device fingerprint on mount ────────────────
  useEffect(() => {
    getDeviceFingerprint().then(setDeviceId);
  }, []);

  // ── Load university list ───────────────────────────────
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const data = await fetchUniversityMapping();
        const uniList = Object.keys(data).map((name) => ({ name, code: data[name] }));
        setUniversities(uniList);
      } catch (err) {
        console.error("Error loading universities:", err);
      }
    };
    loadUniversities();
  }, []);

  // ── Load score-ranking distribution ────────────────────
  useEffect(() => {
    const loadScoreDistribution = async () => {
      try {
        const data = await fetchScoreRankingDistribution();
        setScoreDistribution(data);
      } catch (err) {
        console.error("Error loading score distribution:", err);
      }
    };
    loadScoreDistribution();
  }, []);

  // ── Resolve pending university names once loaded ───────
  useEffect(() => {
    if (universities.length > 0 && pendingUniversityNames) {
      const matched = pendingUniversityNames
        .map((name) => universities.find((u) => u.name === name))
        .filter(Boolean);
      setFormData((prev) => ({ ...prev, desiredUniversities: matched }));
      setPendingUniversityNames(null);
    }
  }, [universities, pendingUniversityNames]);

  // ── Restore session or show registration ───────────────
  useEffect(() => {
    if (!deviceId) return; // Wait for device fingerprint

    const restoreStudent = async (existingStudentId) => {
      try {
        const data = await programSuggestionService.getStudent(existingStudentId);

        if (data.status === "completed") {
          isNavigatingRef.current = true;
          clearParticipantSession(SESSION_TYPE);
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

        if (data.desired_universities?.length > 0) {
          setPendingUniversityNames(data.desired_universities);
        }

        if (data.riasec_answers) {
          // Restore as array aligned to riasecQuestionsList order
          const restoredArr = riasecQuestionsList.map((q) => {
            const qId = String(q.id);
            return data.riasec_answers[qId] !== undefined ? data.riasec_answers[qId] : null;
          });
          setRiasecAnswers(restoredArr);
          const answeredCount = restoredArr.filter((a) => a !== null).length;
          if (answeredCount > 0 && answeredCount < riasecQuestionsList.length) {
            setCurrentQuestionIndex(answeredCount);
          }
        } else {
          setRiasecAnswers(new Array(riasecQuestionsList.length).fill(null));
        }

        setActiveStep(STATUS_TO_STEP[data.status] ?? 0);
        setStage("test");
      } catch (err) {
        console.error("Error restoring student:", err);
        clearParticipantSession(SESSION_TYPE);
        // Session invalid — show registration again
        setStage("registration");
      }
    };

    if (roomId && !isNavigatingRef.current) {
      const existingSession = getParticipantSession(SESSION_TYPE);
      if (existingSession?.participantId) {
        restoreStudent(existingSession.participantId);
      } else {
        // Fallback: check old localStorage format for backward compatibility
        const storageKey = `program_suggestion_student_${roomId}`;
        const oldStudentId = localStorage.getItem(storageKey);
        if (oldStudentId) {
          restoreStudent(parseInt(oldStudentId));
          localStorage.removeItem(storageKey);
        } else {
          // No existing session → show registration
          setStage("registration");
        }
      }
    }
  }, [roomId, deviceId, navigate, riasecQuestionsList.length, t]);

  // ── Form field update helper ───────────────────────────
  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // ── Registration success handler (from TestRegistrationCard) ──
  const handleRegistrationSuccess = useCallback((data) => {
    // Save session (participantSessionService handles both student/participant formats)
    saveParticipantSession(SESSION_TYPE, data);

    // Extract student ID from response
    const newStudentId = data.student?.id || data.participant?.id;
    setStudentId(newStudentId);

    // Pre-fill name from registration form
    if (data.fullName) {
      setFormData((prev) => ({ ...prev, name: data.fullName }));
    }

    // Initialize RIASEC answers array
    setRiasecAnswers(new Array(riasecQuestionsList.length).fill(null));

    setStage("test");
  }, []);

  // ── Score estimation helpers ───────────────────────────
  const estimateRanking = useMemo(() => {
    return (score, area) => {
      if (!scoreDistribution || !area) return null;
      const areaData = scoreDistribution[area.toLowerCase()];
      if (!areaData?.distribution) return null;
      const { distribution } = areaData;
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

  const getScoreBounds = useMemo(() => {
    return (area) => {
      if (!scoreDistribution || !area) return { min: 100, max: 560 };
      const areaData = scoreDistribution[area.toLowerCase()];
      if (!areaData) return { min: 100, max: 560 };
      return { min: areaData.minScore, max: areaData.maxScore };
    };
  }, [scoreDistribution]);

  const formatRanking = useCallback((ranking) => {
    if (!ranking) return "—";
    return ranking.toLocaleString("tr-TR");
  }, []);

  // ── Step validation ────────────────────────────────────
  const isStepValid = useCallback(() => {
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
  }, [activeStep, formData]);

  // ── Step navigation ────────────────────────────────────
  const handleNext = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeStep === 0) {
        await programSuggestionService.updateStep1(studentId, {
          name: formData.name,
          birth_year: parseInt(formData.birthYear),
          gender: formData.gender,
        });
      } else if (activeStep === 1) {
        await programSuggestionService.updateStep2(studentId, {
          class_year: formData.classYear,
          will_take_exam: formData.willTakeExam,
          average_grade: formData.averageGrade ? parseFloat(formData.averageGrade) : null,
          area: formData.area,
          wants_foreign_language: formData.wantsForeignLanguage,
        });
      } else if (activeStep === 2) {
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
        const universitiesWithDefault = [
          ...formData.desiredUniversities.map((u) => u.name),
          "HALİÇ ÜNİVERSİTESİ",
        ];
        await programSuggestionService.updateStep4(studentId, {
          preferred_language: formData.preferredLanguage,
          desired_universities: [...new Set(universitiesWithDefault)],
          desired_cities: formData.desiredCities,
        });
      }
      setActiveStep((prev) => prev + 1);
    } catch (err) {
      console.error("Error saving step:", err);
      setError(t("tests.programSuggestion.errors.saveFailed"));
    } finally {
      setLoading(false);
    }
  }, [activeStep, studentId, formData, t]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, []);

  // ── RIASEC answer handler (TestQuestionCard format) ────
  const handleRiasecAnswer = useCallback(
    (questionIndex, value) => {
      const newAnswers = [...riasecAnswers];
      newAnswers[questionIndex] = value;
      setRiasecAnswers(newAnswers);

      // Auto-advance after short delay
      if (questionIndex < riasecQuestionsList.length - 1) {
        setTimeout(() => setCurrentQuestionIndex(questionIndex + 1), 200);
      }
    },
    [riasecAnswers, riasecQuestionsList.length]
  );

  // ── RIASEC submit (called by TestQuestionCard's onSubmit) ──
  const handleRiasecSubmit = useCallback(async () => {
    setRiasecSubmitting(true);
    setError(null);
    try {
      // Convert array answers to {questionId: score} dict for backend
      const answersDict = {};
      riasecQuestionsList.forEach((q, idx) => {
        if (riasecAnswers[idx] !== null && riasecAnswers[idx] !== undefined) {
          answersDict[String(q.id)] = riasecAnswers[idx];
        }
      });
      await programSuggestionService.submitRiasec(studentId, { riasec_answers: answersDict });
      isNavigatingRef.current = true;
      clearParticipantSession(SESSION_TYPE);
      navigate(`/program-test-result/${studentId}`);
    } catch (err) {
      console.error("Error submitting RIASEC:", err);
      setError(t("tests.programSuggestion.errors.submitFailed"));
    } finally {
      setRiasecSubmitting(false);
    }
  }, [riasecAnswers, riasecQuestionsList, studentId, navigate, t]);

  // ── Step labels for StepIndicator ──────────────────────
  const steps = useMemo(
    () => [
      t("tests.programSuggestion.steps.personalInfo"),
      t("tests.programSuggestion.steps.educationInfo"),
      t("tests.programSuggestion.steps.scoreExpectation"),
      t("tests.programSuggestion.steps.riasecTest"),
    ],
    [t]
  );

  return {
    // Stage & Registration (for TestRegistrationCard)
    stage,
    deviceId,
    userId,
    roomId,
    registrationUrl,
    handleRegistrationSuccess,

    // Core state
    activeStep,
    studentId,
    loading,
    error,
    setError,
    formData,
    updateFormData,
    universities,
    scoreDistribution,

    // Enums
    enums: enumData,
    enumsReady,

    // RIASEC
    riasecAnswers,
    riasecQuestionsList,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    handleRiasecAnswer,
    handleRiasecSubmit,
    riasecSubmitting,

    // Navigation
    steps,
    isStepValid,
    handleNext,
    handleBack,

    // Helpers
    estimateRanking,
    getScoreBounds,
    formatRanking,
    BIRTH_YEARS,
  };
}
