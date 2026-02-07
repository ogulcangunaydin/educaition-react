/**
 * PersonalityTestPublic Page
 *
 * Public-facing personality test page accessed via QR code.
 * Features:
 * - Device tracking to prevent retaking
 * - Anonymous participant creation
 * - Big Five personality test (60 questions)
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Button } from "@components/atoms";
import { TestRegistrationCard } from "@components/organisms";
import { PageLayout, PageLoading, PageError } from "@components/templates";
import { useAuth } from "@contexts/AuthContext";
import { getDeviceFingerprint } from "@utils/deviceFingerprint";
import { validateStudentRegistration } from "@utils/validation";
import { getTestRoomPublic, TestType } from "@services/testRoomService";
import bigFiveTestENQuestions from "./BigFiveTestEN.txt";

const ANSWER_LABELS = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

import { API_BASE_URL } from "@config/env";

const BASE_URL = API_BASE_URL;

function PersonalityTestPublic() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { t } = useTranslation();

  // Room and test state
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);

  // Test flow state
  const [stage, setStage] = useState("loading"); // loading, registration, test, result
  const [fullName, setFullName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [participantId, setParticipantId] = useState(null);

  // Device fingerprint (async — resolved on mount)
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    getDeviceFingerprint().then(setDeviceId);
  }, []);

  // --- Progress persistence helpers ---
  const storageKey = `personality_test_progress_${roomId}`;

  const saveProgress = useCallback(
    (data) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            participantId: data.participantId ?? participantId,
            answers: data.answers ?? answers,
            currentQuestionIndex: data.currentQuestionIndex ?? currentQuestionIndex,
            fullName: data.fullName ?? fullName,
            studentNumber: data.studentNumber ?? studentNumber,
          })
        );
      } catch {
        // localStorage full or unavailable — non-critical
      }
    },
    [storageKey, participantId, answers, currentQuestionIndex, fullName, studentNumber]
  );

  const clearProgress = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const loadProgress = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  // Load room and questions (wait for deviceId to be ready)
  useEffect(() => {
    if (!deviceId) return;

    const loadRoomAndQuestions = async () => {
      try {
        // Fetch room info
        const roomData = await getTestRoomPublic(roomId);
        setRoom(roomData);

        // Fetch questions
        const response = await fetch(bigFiveTestENQuestions);
        const text = await response.text();
        const questionsArray = text.split("\n").filter(Boolean);
        setQuestions(questionsArray);

        // Try to restore saved progress
        const saved = loadProgress();
        if (saved?.participantId) {
          // Re-register with the backend to get a fresh session token cookie.
          // The backend will recognise the device_fingerprint + room and
          // return the existing in-progress participant (no duplicate).
          try {
            const regResponse = await fetch(`${BASE_URL}/personality-test/participants`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                test_room_id: parseInt(roomId, 10),
                full_name: saved.fullName || "",
                student_number: saved.studentNumber || "",
                device_fingerprint: deviceId,
                student_user_id: userId || null,
              }),
            });

            if (regResponse.ok) {
              const regData = await regResponse.json();
              setParticipantId(regData.participant.id);
            } else {
              // Token refresh failed — use saved ID and hope the cookie is still valid
              setParticipantId(saved.participantId);
            }
          } catch {
            setParticipantId(saved.participantId);
          }

          setAnswers(saved.answers || new Array(questionsArray.length).fill(null));
          setCurrentQuestionIndex(saved.currentQuestionIndex || 0);
          if (saved.fullName) setFullName(saved.fullName);
          if (saved.studentNumber) setStudentNumber(saved.studentNumber);
          setStage("test");
        } else {
          setAnswers(new Array(questionsArray.length).fill(null));
          setStage("registration");
        }
      } catch (err) {
        setError(err.message || "Failed to load test");
        setStage("error");
      }
    };

    loadRoomAndQuestions();
  }, [roomId, deviceId]);

  // Handle participant registration
  const handleRegister = useCallback(async () => {
    const { valid, errors: validationErrors } = validateStudentRegistration(
      fullName,
      studentNumber,
      t
    );
    if (!valid) {
      setFieldErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    try {
      const response = await fetch(`${BASE_URL}/personality-test/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          test_room_id: parseInt(roomId, 10),
          full_name: fullName.trim(),
          student_number: studentNumber.trim(),
          device_fingerprint: deviceId,
          student_user_id: userId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          // Device already completed - this shouldn't happen since TestPageGuard checks
          throw new Error("You have already completed this test on this device.");
        }
        throw new Error(data.detail || "Registration failed");
      }

      const data = await response.json();
      setParticipantId(data.participant.id);
      saveProgress({
        participantId: data.participant.id,
        answers: answers,
        currentQuestionIndex: 0,
        fullName: fullName.trim(),
        studentNumber: studentNumber.trim(),
      });
      setStage("test");
    } catch (err) {
      setFieldErrors({ general: err.message });
    } finally {
      setSubmitting(false);
    }
  }, [fullName, studentNumber, roomId, deviceId, t]);

  // Handle answer selection
  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = parseInt(value, 10);
    setAnswers(newAnswers);

    const nextIndex = questionIndex < questions.length - 1 ? questionIndex + 1 : questionIndex;

    // Persist progress
    saveProgress({ answers: newAnswers, currentQuestionIndex: nextIndex });

    // Auto-advance to next question
    if (questionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(nextIndex), 200);
    }
  };

  // Handle test submission
  const handleSubmit = useCallback(async () => {
    if (answers.some((a) => a === null)) {
      setError("Please answer all questions");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/personality-test/participants/${participantId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ answers }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Submission failed");
      }

      const resultData = await response.json();
      setResult(resultData);

      // Clear saved progress
      clearProgress();

      setStage("result");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [answers, participantId, roomId]);

  // Loading state
  if (stage === "loading") {
    return <PageLoading title={t("tests.personality.title")} maxWidth="sm" />;
  }

  // Error state
  if (stage === "error") {
    return (
      <PageError
        title={t("tests.personality.title")}
        message={error}
        onBack={() => navigate(-1)}
        maxWidth="sm"
      />
    );
  }

  // Registration stage
  if (stage === "registration") {
    return (
      <PageLayout title={t("tests.personality.title")} maxWidth="sm">
        <TestRegistrationCard
          testType={TestType.PERSONALITY_TEST}
          title={t("tests.personality.subtitle")}
          description={t("tests.personality.description")}
          roomName={room?.name}
          fullName={fullName}
          studentNumber={studentNumber}
          onFullNameChange={setFullName}
          onStudentNumberChange={setStudentNumber}
          fieldErrors={fieldErrors}
          submitting={submitting}
          onSubmit={handleRegister}
        />
      </PageLayout>
    );
  }

  // Test stage
  if (stage === "test") {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const currentQuestion = questions[currentQuestionIndex];
    const isComplete = answers.every((a) => a !== null);

    return (
      <PageLayout title="Personality Test" maxWidth="md">
        <Box sx={{ mt: 2, mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}% complete
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              {currentQuestion}
            </Typography>

            <RadioGroup
              value={answers[currentQuestionIndex] || ""}
              onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
            >
              {ANSWER_LABELS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  sx={{
                    py: 1,
                    px: 2,
                    my: 0.5,
                    borderRadius: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                />
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={() => setCurrentQuestionIndex((i) => i + 1)}
              disabled={answers[currentQuestionIndex] === null}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isComplete || submitting}
              color="success"
            >
              {submitting ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </PageLayout>
    );
  }

  // Result stage
  if (stage === "result" && result) {
    return (
      <PageLayout title="Your Results" maxWidth="md">
        <Card sx={{ mt: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Your Personality Profile
            </Typography>

            <Box sx={{ mt: 3 }}>
              {Object.entries(result.traits || {}).map(([trait, score]) => (
                <Box key={trait} sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body1" sx={{ textTransform: "capitalize" }}>
                      {trait.replace(/_/g, " ")}
                    </Typography>
                    <Typography variant="body1" color="primary.main">
                      {Math.round(score * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={score * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              ))}
            </Box>

            {result.job_recommendation && (
              <Box sx={{ mt: 4, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Career Recommendation
                </Typography>
                <Typography variant="body1">{result.job_recommendation}</Typography>
              </Box>
            )}

            {result.compatibility_analysis && (
              <Box sx={{ mt: 3, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Compatibility Analysis
                </Typography>
                <Typography variant="body1">{result.compatibility_analysis}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Thank you for completing the personality test!
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  return null;
}

export default PersonalityTestPublic;
