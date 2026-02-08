/**
 * ProgramSuggestionTest — Main orchestrator page
 *
 * Uses the common TestRegistrationCard for registration (same pattern
 * as PersonalityTestPublic, DissonanceTest, etc.).
 *
 * After registration, renders a multi-step form:
 *   Step 0: Personal Info
 *   Step 1: Education Info
 *   Step 2: Score Expectation
 *   Step 3: Preferences
 *   Step 4: RIASEC Career Test
 */

import React from "react";
import { Box, Paper, Typography, Alert, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Button } from "@components/atoms";
import { StepIndicator } from "@components/molecules";
import { PageLayout, PageLoading } from "@components/templates";
import { TestRegistrationCard, TestQuestionCard } from "@components/organisms";
import { TestType } from "@services/testRoomService";
import useProgramSuggestionFlow from "@hooks/program-suggestion/useProgramSuggestionFlow";

import PersonalInfoStep from "./components/PersonalInfoStep";
import EducationInfoStep from "./components/EducationInfoStep";
import ScoreExpectationStep from "./components/ScoreExpectationStep";
import PreferencesStep from "./components/PreferencesStep";

/**
 * RIASEC answer options (strongly_like → strongly_dislike)
 * Values are the numeric scores sent to the backend (-2 to 2).
 */
const RIASEC_OPTIONS = [
  { value: 2, labelKey: "tests.programSuggestion.riasec.stronglyLike", color: "#4caf50" },
  { value: 1, labelKey: "tests.programSuggestion.riasec.like", color: "#8bc34a" },
  { value: 0, labelKey: "tests.programSuggestion.riasec.unsure", color: "#ff9800" },
  { value: -1, labelKey: "tests.programSuggestion.riasec.dislike", color: "#ff5722" },
  { value: -2, labelKey: "tests.programSuggestion.riasec.stronglyDislike", color: "#f44336" },
];

function ProgramSuggestionTest() {
  const { t } = useTranslation();
  const flow = useProgramSuggestionFlow();

  // Loading stage
  if (flow.stage === "loading") {
    return <PageLoading title={t("tests.programSuggestion.title")} maxWidth="sm" />;
  }

  // Registration stage (TestRegistrationCard — same as other tests)
  if (flow.stage === "registration") {
    return (
      <PageLayout title={t("tests.programSuggestion.title")} maxWidth="sm">
        <TestRegistrationCard
          testType={TestType.PROGRAM_SUGGESTION}
          title={t("tests.programSuggestion.subtitle")}
          description={t("tests.programSuggestion.description")}
          registrationUrl={flow.registrationUrl}
          roomId={flow.roomId}
          deviceId={flow.deviceId}
          userId={flow.userId}
          onSuccess={flow.handleRegistrationSuccess}
          getExtraPayload={() => ({ test_room_id: parseInt(flow.roomId) })}
        />
      </PageLayout>
    );
  }

  // Test stage — multi-step form
  const {
    activeStep,
    loading,
    error,
    formData,
    updateFormData,
    universities,
    enums,
    riasecQuestionsList,
    riasecAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    handleRiasecAnswer,
    handleRiasecSubmit,
    riasecSubmitting,
    steps,
    isStepValid,
    handleNext,
    handleBack,
    estimateRanking,
    getScoreBounds,
    formatRanking,
  } = flow;

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} />;
      case 1:
        return (
          <EducationInfoStep formData={formData} updateFormData={updateFormData} enums={enums} />
        );
      case 2:
        return (
          <ScoreExpectationStep
            formData={formData}
            updateFormData={updateFormData}
            enums={enums}
            estimateRanking={estimateRanking}
            getScoreBounds={getScoreBounds}
            formatRanking={formatRanking}
          />
        );
      case 3:
        return (
          <PreferencesStep
            formData={formData}
            updateFormData={updateFormData}
            enums={enums}
            universities={universities}
          />
        );
      case 4:
        return (
          <TestQuestionCard
            questions={riasecQuestionsList}
            currentIndex={currentQuestionIndex}
            answers={riasecAnswers}
            options={RIASEC_OPTIONS}
            onAnswer={handleRiasecAnswer}
            onPrevious={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
            onNext={() =>
              setCurrentQuestionIndex((i) => Math.min(riasecQuestionsList.length - 1, i + 1))
            }
            onSubmit={handleRiasecSubmit}
            submitting={riasecSubmitting}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 4 }}>
      <Paper sx={{ maxWidth: 700, margin: "0 auto", p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 4 }}>
          {t("tests.programSuggestion.title")}
        </Typography>

        <StepIndicator steps={steps} activeStep={activeStep} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => flow.setError(null)}>
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
                <Button variant="outlined" disabled={activeStep === 0} onClick={handleBack}>
                  {t("common.previous")}
                </Button>
                <Button variant="contained" onClick={handleNext} disabled={!isStepValid()}>
                  {activeStep === 3 ? t("tests.programSuggestion.startRiasec") : t("common.next")}
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
