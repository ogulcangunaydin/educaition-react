/**
 * DissonanceTestPublic Page
 *
 * Public-facing cognitive dissonance test page accessed via QR code.
 * Features:
 * - Device tracking to prevent retaking
 * - Multi-step form with demographics and taxi service questions
 * - Cognitive dissonance experiment with fake averages display
 * - GPT-powered dissonance analysis and job recommendation
 * - i18n translations for all UI text
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Card, CardContent, Alert, LinearProgress } from "@mui/material";

import { useTranslation } from "react-i18next";
import { Button, Spinner } from "@components/atoms";
import { PageLayout, PageLoading, PageError } from "@components/templates";
import {
  SelectField,
  SliderField,
  StepIndicator,
  TestCompletionMessage,
  MarkdownSection,
} from "@components/molecules";
import { TestRegistrationCard } from "@components/organisms";
import { useAuth } from "@contexts/AuthContext";
import { getDeviceFingerprint } from "@utils/deviceFingerprint";
import { getTestRoomPublic, TestType, TEST_TYPE_CONFIG } from "@services/testRoomService";
import { getParticipant } from "@services/dissonanceTestService";
import { fetchEnums } from "@services/enumService";
import { API_BASE_URL } from "@config/env";

const BASE_URL = API_BASE_URL;

function DissonanceTestPublic() {
  const { roomId } = useParams();
  const { userId } = useAuth();
  const { t } = useTranslation();

  // Step labels from i18n (no welcome step)
  const STEPS = useMemo(
    () => [
      t("tests.dissonance.steps.registration"),
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
  const [enums, setEnums] = useState({ classYears: [], genders: [], starSigns: [] });

  // Form data (no age, no sentiment)
  const [formData, setFormData] = useState({
    classYear: "",
    gender: "",
    starSign: "",
    risingSign: "",
    workload: 0,
    careerStart: 0,
    flexibility: 0,
    comfortFirst: 0,
    fareFirst: 0,
    comfortSecond: 0,
    fareSecond: 0,
  });

  // Track which slider fields have been interacted with
  const [touchedSliders, setTouchedSliders] = useState(new Set());

  // Averages (calculated/fake for experiment)
  const [averages, setAverages] = useState({ comfort: "", fare: "" });

  // Participant created
  const [participant, setParticipant] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Step 3 auto-advance and step 4 fake error
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

        // Sort star signs alphabetically by label
        const sortedStarSigns = [...(enumData.starSigns || [])].sort((a, b) =>
          (a.label || "").localeCompare(b.label || "", "tr")
        );

        setEnums({
          classYears: enumData.classYears || [],
          genders: enumData.genders || [],
          starSigns: sortedStarSigns,
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

  // Slider change: update value + mark as touched
  const handleSliderChange = useCallback(
    (field, value) => {
      updateField(field, value);
      setTouchedSliders((prev) => new Set(prev).add(field));
    },
    [updateField]
  );

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

  // Step 2 submission: update participant with demographics + first taxi answers
  const handleSubmitFirstAnswers = useCallback(async () => {
    if (!participant) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/dissonance_test_participants/${participant.id}/first-answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            gender: formData.gender || null,
            education: formData.classYear || null,
            comfort_question_first_answer: formData.comfortFirst,
            fare_question_first_answer: formData.fareFirst,
            workload: formData.workload || null,
            career_start: formData.careerStart || null,
            flexibility: formData.flexibility || null,
            star_sign: formData.starSign || null,
            rising_sign: formData.risingSign || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(t("tests.submissionFailed"));
      }

      const data = await response.json();
      setParticipant(data);

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
  }, [participant, formData, getRandomAverage, nextStep, t]);

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

  // Step 4 submission (second answers) — triggers GPT analysis on backend
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

      // Re-fetch full participant to get GPT job recommendation
      try {
        const fullData = await getParticipant(participant.id);
        setParticipant(fullData);
      } catch {
        // If fetch fails, keep the existing participant
      }

      nextStep();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [participant, formData, averages, nextStep, t]);

  // Validation helpers
  // Step 1: Required demographics + all sliders must be interacted with
  const isStep1Valid =
    formData.classYear &&
    touchedSliders.has("workload") &&
    touchedSliders.has("careerStart") &&
    touchedSliders.has("flexibility");
  // Step 2: Taxi sliders must be interacted with
  const isStep2Valid = touchedSliders.has("comfortFirst") && touchedSliders.has("fareFirst");
  // Step 4: Second round sliders must be interacted with
  const isStep4Valid = touchedSliders.has("comfortSecond") && touchedSliders.has("fareSecond");

  // Progress percentage
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step, STEPS.length]);

  // Loading state
  if (loading) {
    return <PageLoading title={t("tests.dissonance.title")} maxWidth="sm" />;
  }

  // Error state (initial load)
  if (error && step === 0 && !room) {
    return <PageError title={t("tests.dissonance.title")} message={error} maxWidth="sm" />;
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
          {step + 1} / {STEPS.length}
        </Typography>
      </Box>

      {/* Step indicator */}
      <StepIndicator steps={STEPS} activeStep={step} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Step 0: Registration */}
      {step === 0 && (
        <TestRegistrationCard
          testType={TestType.DISSONANCE_TEST}
          title={t("tests.dissonance.subtitle")}
          description={t("tests.dissonance.description")}
          roomName={room?.name}
          registrationUrl={`${BASE_URL}/dissonance_test_participants`}
          roomId={roomId}
          deviceId={deviceId}
          userId={userId}
          getExtraPayload={() => ({ user_id: parseInt(roomId, 10) })}
          onSuccess={(data) => {
            setParticipant(data.participant);
            nextStep();
          }}
        />
      )}

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <Card sx={{ borderTop: 4, borderColor: config?.color || "primary.main" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t("tests.dissonance.personalInfo.title")}
            </Typography>

            <SelectField
              label={t("tests.dissonance.personalInfo.classYear")}
              value={formData.classYear}
              onChange={(v) => updateField("classYear", v)}
              options={enums.classYears}
              required
            />

            <SelectField
              label={t("tests.dissonance.personalInfo.gender")}
              value={formData.gender}
              onChange={(v) => updateField("gender", v)}
              options={enums.genders}
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
              onChange={(v) => handleSliderChange("workload", v)}
              min={0}
              max={10}
              marks={[
                { value: 1, label: t("tests.dissonance.personalInfo.workloadMin") },
                { value: 10, label: t("tests.dissonance.personalInfo.workloadMax") },
              ]}
            />

            <SliderField
              label={t("tests.dissonance.personalInfo.careerStart")}
              value={formData.careerStart}
              onChange={(v) => handleSliderChange("careerStart", v)}
              min={0}
              max={10}
              marks={[
                { value: 1, label: t("tests.dissonance.personalInfo.careerStartMin") },
                { value: 10, label: t("tests.dissonance.personalInfo.careerStartMax") },
              ]}
            />

            <SliderField
              label={t("tests.dissonance.personalInfo.flexibility")}
              value={formData.flexibility}
              onChange={(v) => handleSliderChange("flexibility", v)}
              min={0}
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

            {/* Taxi image */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                component="img"
                src="/assets/images/taxi.png"
                alt="Istanbul Taxi"
                sx={{
                  maxWidth: "100%",
                  height: "auto",
                  maxHeight: 200,
                  borderRadius: 2,
                }}
              />
            </Box>

            <SliderField
              label={t("tests.dissonance.taxiQuestions.comfortQuestion")}
              value={formData.comfortFirst}
              onChange={(v) => handleSliderChange("comfortFirst", v)}
              min={0}
              max={10}
              marks
            />

            <SliderField
              label={t("tests.dissonance.taxiQuestions.fareQuestion")}
              value={formData.fareFirst}
              onChange={(v) => handleSliderChange("fareFirst", v)}
              min={0}
              max={10}
              marks
            />

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={prevStep}>
                {t("common.back")}
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitFirstAnswers}
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
                  onChange={(v) => handleSliderChange("comfortSecond", v)}
                  min={0}
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
                  onChange={(v) => handleSliderChange("fareSecond", v)}
                  min={0}
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

      {/* Step 5: Result (GPT Analysis) */}
      {step === 5 && (
        <Card sx={{ mt: 4 }}>
          <TestCompletionMessage />

          <CardContent sx={{ p: 4 }}>
            {participant?.job_recommendation ? (
              <MarkdownSection
                title={t("tests.dissonance.jobRecommendation")}
                content={participant.job_recommendation}
              />
            ) : (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  {t("tests.dissonance.completeStep.thankYou")}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default DissonanceTestPublic;
