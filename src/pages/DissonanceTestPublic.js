/**
 * DissonanceTestPublic Page
 *
 * Public-facing cognitive dissonance test page accessed via QR code.
 * Features:
 * - Device tracking to prevent retaking
 * - Multi-step form with demographics and taxi service questions
 * - Cognitive dissonance experiment with average display
 * - Consistent styling with other public test pages
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
} from "@mui/material";
import {
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
} from "@mui/icons-material";
import { Button } from "@components/atoms";
import { PageLayout } from "@components/templates";
import { FormField, SelectField, SliderField, StepIndicator } from "@components/molecules";
import { markTestCompleted, getOrCreateDeviceId } from "@components/atoms/TestPageGuard";
import { getTestRoomPublic, TestType, TEST_TYPE_CONFIG } from "@services/testRoomService";
import { fetchEnums } from "@services/enumService";
import { DISSONANCE_TEST } from "@data/testQuestions";
import { API_BASE_URL } from "@config/env";

const BASE_URL = API_BASE_URL;

const STEPS = [
  "Welcome",
  "Personal Info",
  "Taxi Questions",
  "Processing",
  "Verification",
  "Complete",
];

// Sentiment rating options with icons
const SENTIMENT_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1),
}));

function DissonanceTestPublic() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Room state
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form step (0-based internally, corresponds to STEPS)
  const [step, setStep] = useState(0);

  // Enum data from API
  const [enums, setEnums] = useState({ educations: [], starSigns: [] });

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    age: "",
    gender: "",
    education: "",
    starSign: "",
    risingSign: "",
    workload: 5,
    careerStart: 5,
    flexibility: 5,
    sentiment: null,
    comfortFirst: 5,
    fareFirst: 5,
    comfortSecond: 5,
    fareSecond: 5,
  });

  // Averages (calculated/fake for experiment)
  const [averages, setAverages] = useState({ comfort: "", fare: "" });

  // Participant created
  const [participant, setParticipant] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Step 4 auto-advance and step 5 fake error
  const [showFakeError, setShowFakeError] = useState(false);

  // Device ID
  const deviceId = getOrCreateDeviceId();

  // Load room and enums
  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomData, enumData] = await Promise.all([getTestRoomPublic(roomId), fetchEnums()]);
        setRoom(roomData);
        setEnums({
          educations: enumData.educations || [],
          starSigns: enumData.starSigns || [],
        });
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load test");
        setLoading(false);
      }
    };
    loadData();
  }, [roomId]);

  // Update form data helper
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Generate fake average for cognitive dissonance experiment
  const getRandomAverage = useCallback((answer) => {
    const ranges = {
      1: [4, 5, 6, 7],
      2: [5, 6, 7, 8],
      3: [6, 7, 8, 9],
      4: [7, 8, 9, 1],
      5: [8, 9, 1, 2],
      6: [9, 1, 2, 3],
      7: [1, 2, 3, 4],
      8: [2, 3, 4, 5],
      9: [3, 4, 5, 6],
      10: [4, 5, 6, 7],
    };
    const randomValue = ranges[answer]?.[Math.floor(Math.random() * 4)] || 5;
    const randomDigit = (Math.random() * 0.49 + 0.51).toFixed(2).slice(2);
    return `${randomValue}.${randomDigit}`;
  }, []);

  // Handle step navigation
  const nextStep = useCallback(() => setStep((s) => s + 1), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  // Step 3 submission (create participant)
  const handleCreateParticipant = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/dissonance_test_participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          education: formData.education,
          sentiment: formData.sentiment,
          comfort_question_first_answer: formData.comfortFirst,
          fare_question_first_answer: formData.fareFirst,
          user_id: parseInt(roomId, 10), // Legacy field
          test_room_id: parseInt(roomId, 10),
          workload: formData.workload,
          career_start: formData.careerStart,
          flexibility: formData.flexibility,
          star_sign: formData.starSign,
          rising_sign: formData.risingSign,
          device_fingerprint: deviceId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          throw new Error("You have already completed this test on this device.");
        }
        throw new Error(data.detail || "Failed to save answers");
      }

      const data = await response.json();
      setParticipant(data.participant);

      // Calculate fake averages for display
      setAverages({
        comfort: getRandomAverage(formData.comfortFirst),
        fare: getRandomAverage(formData.fareFirst),
      });

      nextStep(); // Go to step 3 (processing)
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [formData, roomId, deviceId, getRandomAverage, nextStep]);

  // Step 3 (processing) auto-advance
  useEffect(() => {
    if (step === 3 && participant) {
      const timer = setTimeout(nextStep, 4000);
      return () => clearTimeout(timer);
    }
  }, [step, participant, nextStep]);

  // Step 4 fake error then show real form
  useEffect(() => {
    if (step === 4 && !showFakeError) {
      const timer = setTimeout(() => setShowFakeError(true), 4000);
      return () => clearTimeout(timer);
    }
  }, [step, showFakeError]);

  // Step 4 submission (second answers)
  const handleSubmitSecondAnswers = useCallback(async () => {
    if (!participant) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/dissonance_test_participants/${participant.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          comfort_question_second_answer: formData.comfortSecond,
          fare_question_second_answer: formData.fareSecond,
          comfort_question_displayed_average: parseFloat(averages.comfort),
          fare_question_displayed_average: parseFloat(averages.fare),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save answers");
      }

      // Mark test as completed
      await markTestCompleted(TestType.DISSONANCE_TEST, roomId);
      nextStep();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [participant, formData, averages, roomId, nextStep]);

  // Validation helpers
  const isStep0Valid = formData.sentiment !== null;
  const isStep1Valid =
    formData.email && formData.age && formData.education && /\S+@\S+\.\S+/.test(formData.email);
  const isStep2Valid = formData.comfortFirst > 0 && formData.fareFirst > 0;
  const isStep4Valid = formData.comfortSecond > 0 && formData.fareSecond > 0;

  // Progress percentage
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  // Get sentiment icon based on value
  const getSentimentIcon = (value) => {
    if (value <= 2) return <SentimentVeryDissatisfied />;
    if (value <= 4) return <SentimentDissatisfied />;
    if (value <= 6) return <SentimentNeutral />;
    if (value <= 8) return <SentimentSatisfied />;
    return <SentimentVerySatisfied />;
  };

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
        <Typography color="text.secondary">Loading test...</Typography>
      </Box>
    );
  }

  // Error state
  if (error && step === 0) {
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

  const config = TEST_TYPE_CONFIG[TestType.DISSONANCE_TEST];

  return (
    <PageLayout title="Cognitive Dissonance Test" maxWidth="md">
      {/* Progress indicator */}
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

      {/* Step indicator */}
      <StepIndicator steps={STEPS} activeStep={step} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Step 0: Welcome & Initial Question */}
      {step === 0 && (
        <Card sx={{ borderTop: 4, borderColor: config?.color || "primary.main" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {DISSONANCE_TEST.welcome.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {DISSONANCE_TEST.welcome.description}
            </Typography>

            {room && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Room: <strong>{room.name}</strong>
              </Typography>
            )}

            <Typography variant="h6" sx={{ mb: 2 }}>
              {DISSONANCE_TEST.step1.taxiProblemQuestion}
            </Typography>

            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", mb: 3 }}
            >
              {SENTIMENT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={formData.sentiment === opt.value ? "contained" : "outlined"}
                  onClick={() => updateField("sentiment", opt.value)}
                  sx={{
                    minWidth: 56,
                    display: "flex",
                    flexDirection: "column",
                    py: 1.5,
                  }}
                >
                  {getSentimentIcon(opt.value)}
                  <Typography variant="caption">{opt.label}</Typography>
                </Button>
              ))}
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={nextStep}
              disabled={!isStep0Valid}
              sx={{ mt: 2 }}
            >
              {DISSONANCE_TEST.next}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Personal Information
            </Typography>

            <FormField
              label={DISSONANCE_TEST.step2.emailLabel}
              type="email"
              value={formData.email}
              onChange={(v) => updateField("email", v)}
              required
            />

            <FormField
              label={DISSONANCE_TEST.step2.ageLabel}
              type="number"
              value={formData.age}
              onChange={(v) => updateField("age", v)}
              required
            />

            <FormField
              label={DISSONANCE_TEST.step2.genderLabel}
              value={formData.gender}
              onChange={(v) => updateField("gender", v)}
            />

            <SelectField
              label={DISSONANCE_TEST.step2.educationLabel}
              value={formData.education}
              onChange={(v) => updateField("education", v)}
              options={enums.educations}
              required
            />

            <SelectField
              label={DISSONANCE_TEST.step2.starSignLabel}
              value={formData.starSign}
              onChange={(v) => updateField("starSign", v)}
              options={enums.starSigns}
            />

            <SelectField
              label={DISSONANCE_TEST.step2.risingSignLabel}
              value={formData.risingSign}
              onChange={(v) => updateField("risingSign", v)}
              options={enums.starSigns}
            />

            <SliderField
              label={DISSONANCE_TEST.step2.workloadLabel}
              value={formData.workload}
              onChange={(v) => updateField("workload", v)}
              min={1}
              max={10}
              marks={[
                { value: 1, label: DISSONANCE_TEST.step2.workloadMin },
                { value: 10, label: DISSONANCE_TEST.step2.workloadMax },
              ]}
            />

            <SliderField
              label={DISSONANCE_TEST.step2.careerStartLabel}
              value={formData.careerStart}
              onChange={(v) => updateField("careerStart", v)}
              min={1}
              max={10}
              marks={[
                { value: 1, label: DISSONANCE_TEST.step2.careerStartMin },
                { value: 10, label: DISSONANCE_TEST.step2.careerStartMax },
              ]}
            />

            <SliderField
              label={DISSONANCE_TEST.step2.flexibilityLabel}
              value={formData.flexibility}
              onChange={(v) => updateField("flexibility", v)}
              min={1}
              max={10}
              marks={[
                { value: 1, label: DISSONANCE_TEST.step2.flexibilityMin },
                { value: 10, label: DISSONANCE_TEST.step2.flexibilityMax },
              ]}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={prevStep}>
                Back
              </Button>
              <Button variant="contained" onClick={nextStep} disabled={!isStep1Valid} fullWidth>
                {DISSONANCE_TEST.next}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Taxi Questions (First Round) */}
      {step === 2 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Taxi Service Questions
            </Typography>

            <SliderField
              label={DISSONANCE_TEST.step3.taxiComfortQuestion}
              value={formData.comfortFirst}
              onChange={(v) => updateField("comfortFirst", v)}
              min={1}
              max={10}
              marks
            />

            <SliderField
              label={DISSONANCE_TEST.step3.taxiFaresQuestion}
              value={formData.fareFirst}
              onChange={(v) => updateField("fareFirst", v)}
              min={1}
              max={10}
              marks
            />

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={prevStep}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateParticipant}
                disabled={!isStep2Valid || submitting}
                fullWidth
              >
                {submitting ? <CircularProgress size={24} /> : DISSONANCE_TEST.save}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Processing (Auto-advance) */}
      {step === 3 && (
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>
              {DISSONANCE_TEST.step4.thankYou}
            </Typography>

            <Box sx={{ my: 4, p: 3, bgcolor: "primary.light", borderRadius: 2 }}>
              <Typography variant="h6" color="primary.contrastText" gutterBottom>
                {DISSONANCE_TEST.step4.averageResults}
              </Typography>
              <Typography variant="h5" color="primary.contrastText">
                {DISSONANCE_TEST.step4.taxiComfortAverage}: {averages.comfort} (102{" "}
                {DISSONANCE_TEST.step4.votes})
              </Typography>
              <Typography variant="h5" color="primary.contrastText">
                {DISSONANCE_TEST.step4.taxiFaresAverage}: {averages.fare} (102{" "}
                {DISSONANCE_TEST.step4.votes})
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <CircularProgress size={20} />
              <Typography color="text.secondary">{DISSONANCE_TEST.step4.processing}</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Verification (Fake Error then Real Questions) */}
      {step === 4 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            {!showFakeError ? (
              <Box sx={{ textAlign: "center" }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="h6">{DISSONANCE_TEST.step5.errorTitle}</Typography>
                  <Typography variant="body2">Timestamp: {new Date().toLocaleString()}</Typography>
                  <Typography variant="body2">
                    Request ID: {Math.random().toString(36).substring(7)}
                  </Typography>
                </Alert>
                <Typography variant="h6">{DISSONANCE_TEST.step5.errorMessage}</Typography>
                <Box sx={{ mt: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="h5" gutterBottom>
                  Please Answer Again
                </Typography>

                <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average: {averages.comfort} (102 votes)
                  </Typography>
                </Box>
                <SliderField
                  label={DISSONANCE_TEST.step3.taxiComfortQuestion}
                  value={formData.comfortSecond}
                  onChange={(v) => updateField("comfortSecond", v)}
                  min={1}
                  max={10}
                  marks={[
                    { value: parseFloat(averages.comfort), label: `Avg: ${averages.comfort}` },
                  ]}
                />

                <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average: {averages.fare} (102 votes)
                  </Typography>
                </Box>
                <SliderField
                  label={DISSONANCE_TEST.step3.taxiFaresQuestion}
                  value={formData.fareSecond}
                  onChange={(v) => updateField("fareSecond", v)}
                  min={1}
                  max={10}
                  marks={[{ value: parseFloat(averages.fare), label: `Avg: ${averages.fare}` }]}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSubmitSecondAnswers}
                  disabled={!isStep4Valid || submitting}
                  sx={{ mt: 3 }}
                >
                  {submitting ? <CircularProgress size={24} /> : DISSONANCE_TEST.submit}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Complete */}
      {step === 5 && (
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom color="success.main">
              ✓ {DISSONANCE_TEST.step6.success}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ my: 3 }}>
              Thank you for participating in this cognitive dissonance study.
            </Typography>

            <Button variant="contained" onClick={() => navigate(`/personality-test/${roomId}`)}>
              {DISSONANCE_TEST.step6.nextStep}
            </Button>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default DissonanceTestPublic;
