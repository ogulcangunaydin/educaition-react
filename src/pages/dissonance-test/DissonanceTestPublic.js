/**
 * DissonanceTestPublic Page
 *
 * Public-facing cognitive dissonance test page accessed via QR code.
 * Features:
 * - Device tracking to prevent retaking
 * - Multi-step form with demographics and taxi service questions
 * - Cognitive dissonance experiment with fake averages display
 * - i18n translations for all UI text
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent, Alert, LinearProgress } from "@mui/material";
import {
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "@components/atoms";
import { PageLayout, PageLoading, PageError } from "@components/templates";
import {
  FormField,
  SelectField,
  SliderField,
  StepIndicator,
  TestCompletionMessage,
} from "@components/molecules";
import { useAuth } from "@contexts/AuthContext";
import { getDeviceFingerprint } from "@utils/deviceFingerprint";
import { getTestRoomPublic, TestType, TEST_TYPE_CONFIG } from "@services/testRoomService";
import { getParticipant } from "@services/dissonanceTestService";
import { fetchEnums } from "@services/enumService";
import { API_BASE_URL } from "@config/env";
import DissonanceResultContent from "./DissonanceResultContent";

const BASE_URL = API_BASE_URL;

// Sentiment rating options (1-10)
const SENTIMENT_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1),
}));

function DissonanceTestPublic() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { t } = useTranslation();

  // Step labels from i18n
  const STEPS = useMemo(
    () => [
      t("tests.dissonance.steps.welcome"),
      t("tests.dissonance.steps.personalInfo"),
      t("tests.dissonance.steps.taxiQuestions"),
      t("tests.dissonance.steps.processing"),
      t("tests.dissonance.steps.verification"),
      t("tests.dissonance.steps.complete"),
    ],
    [t]
  );

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
    fullName: "",
    studentNumber: "",
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

  // Device fingerprint
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    getDeviceFingerprint().then(setDeviceId);
  }, []);

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
        setError(err.message || t("common.error"));
        setLoading(false);
      }
    };
    loadData();
  }, [roomId, t]);

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
          full_name: formData.fullName,
          student_number: formData.studentNumber,
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
          student_user_id: userId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          throw new Error(t("tests.participantInfo.alreadyCompleted"));
        }
        throw new Error(data.detail || t("tests.submissionFailed"));
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
  }, [formData, roomId, deviceId, userId, getRandomAverage, nextStep, t]);

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
        throw new Error(t("tests.submissionFailed"));
      }

      // Re-fetch full participant to get computed results (personality traits, etc.)
      try {
        const fullData = await getParticipant(participant.id);
        setParticipant(fullData);
      } catch {
        // If fetch fails, keep the existing participant — results will show what's available
      }

      nextStep();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [participant, formData, averages, nextStep, t]);

  // Validation helpers
  const isStep0Valid = formData.sentiment !== null;
  const isStep1Valid =
    formData.fullName && formData.studentNumber && formData.age && formData.education;
  const isStep2Valid = formData.comfortFirst > 0 && formData.fareFirst > 0;
  const isStep4Valid = formData.comfortSecond > 0 && formData.fareSecond > 0;

  // Progress percentage
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step, STEPS.length]);

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
    return <PageLoading title={t("tests.dissonance.title")} maxWidth="sm" />;
  }

  // Error state (initial load)
  if (error && step === 0 && !room) {
    return (
      <PageError
        title={t("tests.dissonance.title")}
        message={error}
        onBack={() => navigate(-1)}
        maxWidth="sm"
      />
    );
  }

  const config = TEST_TYPE_CONFIG[TestType.DISSONANCE_TEST];

  return (
    <PageLayout title={t("tests.dissonance.title")} maxWidth="md">
      {/* Progress indicator */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {t("tests.dissonance.steps.welcome")} {step + 1} / {STEPS.length}
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
              {t("tests.dissonance.subtitle")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {t("tests.dissonance.description")}
            </Typography>

            {room && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("common.room")}: <strong>{room.name}</strong>
              </Typography>
            )}

            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("tests.dissonance.welcome.taxiProblemQuestion")}
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
              {t("common.next")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t("tests.dissonance.personalInfo.title")}
            </Typography>

            <FormField
              label={t("tests.dissonance.personalInfo.fullName")}
              value={formData.fullName}
              onChange={(v) => updateField("fullName", v)}
              required
            />

            <FormField
              label={t("tests.dissonance.personalInfo.studentNumber")}
              value={formData.studentNumber}
              onChange={(v) => updateField("studentNumber", v)}
              required
            />

            <FormField
              label={t("tests.dissonance.personalInfo.age")}
              type="number"
              value={formData.age}
              onChange={(v) => updateField("age", v)}
              required
            />

            <FormField
              label={t("tests.dissonance.personalInfo.gender")}
              value={formData.gender}
              onChange={(v) => updateField("gender", v)}
            />

            <SelectField
              label={t("tests.dissonance.personalInfo.education")}
              value={formData.education}
              onChange={(v) => updateField("education", v)}
              options={enums.educations}
              required
            />

            <SelectField
              label={t("tests.dissonance.personalInfo.starSign")}
              value={formData.starSign}
              onChange={(v) => updateField("starSign", v)}
              options={enums.starSigns}
            />

            <SelectField
              label={t("tests.dissonance.personalInfo.risingSign")}
              value={formData.risingSign}
              onChange={(v) => updateField("risingSign", v)}
              options={enums.starSigns}
            />

            <SliderField
              label={t("tests.dissonance.personalInfo.workload")}
              value={formData.workload}
              onChange={(v) => updateField("workload", v)}
              min={1}
              max={10}
              marks={[
                { value: 1, label: t("tests.dissonance.personalInfo.workloadMin") },
                { value: 10, label: t("tests.dissonance.personalInfo.workloadMax") },
              ]}
            />

            <SliderField
              label={t("tests.dissonance.personalInfo.careerStart")}
              value={formData.careerStart}
              onChange={(v) => updateField("careerStart", v)}
              min={1}
              max={10}
              marks={[
                { value: 1, label: t("tests.dissonance.personalInfo.careerStartMin") },
                { value: 10, label: t("tests.dissonance.personalInfo.careerStartMax") },
              ]}
            />

            <SliderField
              label={t("tests.dissonance.personalInfo.flexibility")}
              value={formData.flexibility}
              onChange={(v) => updateField("flexibility", v)}
              min={1}
              max={10}
              marks={[
                { value: 1, label: t("tests.dissonance.personalInfo.flexibilityMin") },
                { value: 10, label: t("tests.dissonance.personalInfo.flexibilityMax") },
              ]}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={prevStep}>
                {t("common.back")}
              </Button>
              <Button variant="contained" onClick={nextStep} disabled={!isStep1Valid} fullWidth>
                {t("common.next")}
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
              {t("tests.dissonance.taxiQuestions.title")}
            </Typography>

            <SliderField
              label={t("tests.dissonance.taxiQuestions.comfortQuestion")}
              value={formData.comfortFirst}
              onChange={(v) => updateField("comfortFirst", v)}
              min={1}
              max={10}
              marks
            />

            <SliderField
              label={t("tests.dissonance.taxiQuestions.fareQuestion")}
              value={formData.fareFirst}
              onChange={(v) => updateField("fareFirst", v)}
              min={1}
              max={10}
              marks
            />

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={prevStep}>
                {t("common.back")}
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateParticipant}
                disabled={!isStep2Valid || submitting}
                fullWidth
              >
                {submitting ? <Spinner size={24} /> : t("common.save")}
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
              {t("tests.dissonance.processingStep.thankYou")}
            </Typography>

            <Box sx={{ my: 4, p: 3, bgcolor: "primary.light", borderRadius: 2 }}>
              <Typography variant="h6" color="primary.contrastText" gutterBottom>
                {t("tests.dissonance.processingStep.averageResults")}
              </Typography>
              <Typography variant="h5" color="primary.contrastText">
                {t("tests.dissonance.processingStep.taxiComfortAverage")}: {averages.comfort} (102{" "}
                {t("tests.dissonance.processingStep.votes")})
              </Typography>
              <Typography variant="h5" color="primary.contrastText">
                {t("tests.dissonance.processingStep.taxiFaresAverage")}: {averages.fare} (102{" "}
                {t("tests.dissonance.processingStep.votes")})
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <Spinner size={20} />
              <Typography color="text.secondary">
                {t("tests.dissonance.processingStep.saving")}
              </Typography>
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
                  <Typography variant="h6">
                    {t("tests.dissonance.verificationStep.errorTitle")}
                  </Typography>
                  <Typography variant="body2">Timestamp: {new Date().toLocaleString()}</Typography>
                  <Typography variant="body2">
                    Request ID: {Math.random().toString(36).substring(7)}
                  </Typography>
                </Alert>
                <Typography variant="h6">
                  {t("tests.dissonance.verificationStep.errorMessage")}
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Spinner size={24} />
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="h5" gutterBottom>
                  {t("tests.dissonance.verificationStep.answerAgain")}
                </Typography>

                <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("tests.dissonance.verificationStep.average")}: {averages.comfort} (102{" "}
                    {t("tests.dissonance.processingStep.votes")})
                  </Typography>
                </Box>
                <SliderField
                  label={t("tests.dissonance.taxiQuestions.comfortQuestion")}
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
                    {t("tests.dissonance.verificationStep.average")}: {averages.fare} (102{" "}
                    {t("tests.dissonance.processingStep.votes")})
                  </Typography>
                </Box>
                <SliderField
                  label={t("tests.dissonance.taxiQuestions.fareQuestion")}
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
                  {submitting ? <Spinner size={24} /> : t("common.submit")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Result */}
      {step === 5 && (
        <Card sx={{ mt: 4 }}>
          <TestCompletionMessage />

          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t("tests.dissonance.roomDetail.resultsTitle")}
            </Typography>

            {participant && (
              <DissonanceResultContent
                participant={{
                  ...participant,
                  comfort_question_second_answer: formData.comfortSecond,
                  fare_question_second_answer: formData.fareSecond,
                  comfort_question_displayed_average: parseFloat(averages.comfort),
                  fare_question_displayed_average: parseFloat(averages.fare),
                }}
              />
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate(`/personality-test/${roomId}`)}
              sx={{ mt: 3 }}
            >
              {t("tests.dissonance.completeStep.nextStep")}
            </Button>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default DissonanceTestPublic;
