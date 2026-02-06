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
  TextField,
} from "@mui/material";
import { Button } from "@components/atoms";
import { PageLayout } from "@components/templates";
import { markTestCompleted, getOrCreateDeviceId } from "@components/atoms/TestPageGuard";
import { getTestRoomPublic, TEST_TYPE_CONFIG, TestType } from "../services/testRoomService";
import bigFiveTestENQuestions from "./PersonalityTest/BigFiveTestEN.txt";

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

  // Room and test state
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);

  // Test flow state
  const [stage, setStage] = useState("loading"); // loading, registration, test, result
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [participantId, setParticipantId] = useState(null);

  // Device ID for fingerprinting
  const deviceId = getOrCreateDeviceId();

  // Load room and questions
  useEffect(() => {
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
        setAnswers(new Array(questionsArray.length).fill(null));

        setStage("registration");
      } catch (err) {
        setError(err.message || "Failed to load test");
        setStage("error");
      }
    };

    loadRoomAndQuestions();
  }, [roomId]);

  // Handle participant registration
  const handleRegister = useCallback(async () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }

    setSubmitting(true);
    setEmailError("");

    try {
      const response = await fetch(`${BASE_URL}/personality-test/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          test_room_id: parseInt(roomId, 10),
          email: email.trim(),
          device_fingerprint: deviceId,
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
      setStage("test");
    } catch (err) {
      setEmailError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [email, roomId, deviceId]);

  // Handle answer selection
  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = parseInt(value, 10);
    setAnswers(newAnswers);

    // Auto-advance to next question
    if (questionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(questionIndex + 1), 200);
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

      // Mark as completed (both localStorage and backend)
      await markTestCompleted(TestType.PERSONALITY_TEST, roomId);

      setStage("result");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [answers, participantId, roomId]);

  // Loading state
  if (stage === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Loading personality test...</Typography>
      </Box>
    );
  }

  // Error state
  if (stage === "error") {
    return (
      <PageLayout title="Error" maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </PageLayout>
    );
  }

  // Registration stage
  if (stage === "registration") {
    const config = TEST_TYPE_CONFIG[TestType.PERSONALITY_TEST];

    return (
      <PageLayout title="Personality Test" maxWidth="sm">
        <Card sx={{ mt: 4, borderTop: 4, borderColor: config?.color || "primary.main" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Welcome to the Personality Test
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This test contains 60 questions based on the Big Five personality model. It takes
              approximately 10-15 minutes to complete.
            </Typography>

            {room && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Room: <strong>{room.name}</strong>
              </Typography>
            )}

            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              fullWidth
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handleRegister}
              disabled={submitting}
              sx={{ py: 1.5 }}
            >
              {submitting ? <CircularProgress size={24} /> : "Start Test"}
            </Button>
          </CardContent>
        </Card>
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
