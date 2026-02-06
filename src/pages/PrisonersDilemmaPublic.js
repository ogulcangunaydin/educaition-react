/**
 * PrisonersDilemmaPublic Page
 *
 * Public-facing Prisoner's Dilemma game page accessed via QR code.
 * Features:
 * - Device tracking to prevent duplicate registrations
 * - Player registration with name
 * - Personality test integration
 * - Tactic preparation
 * - Waiting for game session to start
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Chip,
  Radio,
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
} from "@mui/material";
import { Button } from "@components/atoms";
import { PageLayout } from "@components/templates";
import { FormField, StepIndicator } from "@components/molecules";
import { getTestRoomPublic, TestType, TEST_TYPE_CONFIG } from "@services/testRoomService";
import { PRISONERS_DILEMMA, ANSWER_SCALES } from "@data/testQuestions";
import bigFiveTestENQuestions from "./personality-test/BigFiveTestEN.txt";
import { API_BASE_URL } from "@config/env";

const BASE_URL = API_BASE_URL;

const STEPS = ["Join", "Personality Test", "Prepare Tactic", "Waiting"];

// Answer options for personality test
const ANSWER_OPTIONS = ANSWER_SCALES.likert5;

function PrisonersDilemmaPublic() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Room state
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Step state
  const [step, setStep] = useState(0);

  // Registration
  const [playerName, setPlayerName] = useState("");
  const [player, setPlayer] = useState(null);

  // Personality test
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Tactic
  const [tactic, setTactic] = useState("");

  // Submitting state
  const [submitting, setSubmitting] = useState(false);

  // Load room and questions
  useEffect(() => {
    const loadData = async () => {
      try {
        const roomData = await getTestRoomPublic(roomId);
        setRoom(roomData);

        // Load personality test questions
        const response = await fetch(bigFiveTestENQuestions);
        const text = await response.text();
        const questionsArray = text.split("\n").filter(Boolean);
        setQuestions(questionsArray);
        setAnswers(new Array(questionsArray.length).fill(null));

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load game room");
        setLoading(false);
      }
    };
    loadData();
  }, [roomId]);

  // Navigation
  const nextStep = useCallback(() => setStep((s) => s + 1), []);

  // Handle player registration
  const handleRegister = useCallback(async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("player_name", playerName.trim());
      formData.append("room_id", roomId);

      const response = await fetch(`${BASE_URL}/players`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to join game");
      }

      const data = await response.json();
      setPlayer(data.player);
      nextStep();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [playerName, roomId, nextStep]);

  // Handle answer selection
  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = parseInt(value, 10);
    setAnswers(newAnswers);

    // Auto-advance
    if (questionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(questionIndex + 1), 200);
    }
  };

  // Submit personality test
  const handleSubmitPersonality = useCallback(async () => {
    if (!player || answers.some((a) => a === null)) {
      setError("Please answer all questions");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("answers", answers.join(","));

      const response = await fetch(`${BASE_URL}/players/${player.id}/personality`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save personality results");
      }

      nextStep();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [player, answers, nextStep]);

  // Submit tactic
  const handleSubmitTactic = useCallback(async () => {
    if (!player || !tactic.trim()) {
      setError("Please describe your tactic");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("player_tactic", tactic.trim());

      const response = await fetch(`${BASE_URL}/players/${player.id}/tactic`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save tactic");
      }

      nextStep();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [player, tactic, roomId, nextStep]);

  // Progress
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);
  const personalityProgress = useMemo(
    () => ((currentQuestionIndex + 1) / questions.length) * 100,
    [currentQuestionIndex, questions.length]
  );
  const answeredCount = answers.filter((a) => a !== null).length;
  const isPersonalityComplete = answers.every((a) => a !== null);

  // Loading state
  if (loading) {
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
        <Typography color="text.secondary">Loading game room...</Typography>
      </Box>
    );
  }

  // Error state on initial load
  if (error && step === 0 && !room) {
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

  const config = TEST_TYPE_CONFIG[TestType.PRISONERS_DILEMMA];

  return (
    <PageLayout title="Prisoner's Dilemma" maxWidth="md">
      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          Step {step + 1} of {STEPS.length}
        </Typography>
      </Box>

      {/* Steps */}
      <StepIndicator steps={STEPS} activeStep={step} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Step 0: Join Game */}
      {step === 0 && (
        <Card sx={{ borderTop: 4, borderColor: config?.color || "primary.main" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {PRISONERS_DILEMMA.welcome.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {PRISONERS_DILEMMA.welcome.description}
            </Typography>

            {room && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Room: <strong>{room.name}</strong>
              </Typography>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                How to play:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {PRISONERS_DILEMMA.welcome.instructions.map((instruction, i) => (
                  <li key={i}>
                    <Typography variant="body2" color="text.secondary">
                      {instruction}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Box>

            {/* Payoff explanation */}
            <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Scoring:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {PRISONERS_DILEMMA.payoffs.bothCooperate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {PRISONERS_DILEMMA.payoffs.bothDefect}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {PRISONERS_DILEMMA.payoffs.cooperateVsDefect}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {PRISONERS_DILEMMA.payoffs.defectVsCooperate}
              </Typography>
            </Box>

            <FormField
              label={PRISONERS_DILEMMA.registration.nameLabel}
              value={playerName}
              onChange={setPlayerName}
              placeholder={PRISONERS_DILEMMA.registration.namePlaceholder}
              required
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handleRegister}
              disabled={!playerName.trim() || submitting}
              sx={{ mt: 2 }}
            >
              {submitting ? (
                <CircularProgress size={24} />
              ) : (
                PRISONERS_DILEMMA.registration.joinButton
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Personality Test */}
      {step === 1 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {PRISONERS_DILEMMA.personalityTest.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {PRISONERS_DILEMMA.personalityTest.description}
            </Typography>

            {/* Question progress */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {answeredCount} answered
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={personalityProgress}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>

            {/* Current question */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {questions[currentQuestionIndex]}
              </Typography>

              <MuiRadioGroup
                value={answers[currentQuestionIndex] || ""}
                onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
              >
                {ANSWER_OPTIONS.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={<Radio />}
                    label={opt.label}
                    sx={{
                      py: 1,
                      px: 2,
                      my: 0.5,
                      borderRadius: 1,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  />
                ))}
              </MuiRadioGroup>
            </Box>

            {/* Navigation */}
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
                  color="success"
                  onClick={handleSubmitPersonality}
                  disabled={!isPersonalityComplete || submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : "Continue"}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Prepare Tactic */}
      {step === 2 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {PRISONERS_DILEMMA.tactics.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {PRISONERS_DILEMMA.tactics.description}
            </Typography>

            <FormField
              label={PRISONERS_DILEMMA.tactics.tacticLabel}
              value={tactic}
              onChange={setTactic}
              placeholder={PRISONERS_DILEMMA.tactics.tacticPlaceholder}
              multiline
              rows={4}
              required
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmitTactic}
              disabled={!tactic.trim() || submitting}
              sx={{ mt: 2 }}
            >
              {submitting ? <CircularProgress size={24} /> : PRISONERS_DILEMMA.tactics.saveButton}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Waiting */}
      {step === 3 && (
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Chip label={PRISONERS_DILEMMA.ready} color="success" sx={{ mb: 3 }} />

            <Typography variant="h5" gutterBottom>
              You're all set, {player?.player_name}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {PRISONERS_DILEMMA.waiting}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <CircularProgress size={24} />
              <Typography color="text.secondary">
                {PRISONERS_DILEMMA.registration.waitingMessage}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
              The game master will start a session when all players are ready.
              <br />
              You can close this page - you'll be notified when it's time to play.
            </Typography>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default PrisonersDilemmaPublic;
