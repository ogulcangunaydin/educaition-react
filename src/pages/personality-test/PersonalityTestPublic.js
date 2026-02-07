/**
 * PersonalityTestPublic Page
 *
 * Public-facing personality test page accessed via QR code.
 *
 * Uses shared useTestFlow hook + TestRegistrationCard + TestQuestionCard
 * for the common test lifecycle. Only test-specific config and result
 * rendering remain here.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Card, CardContent } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TestRegistrationCard, RadarChart, TestQuestionCard } from "@components/organisms";
import { PageLayout, PageLoading, PageError } from "@components/templates";
import { MarkdownSection, TestCompletionMessage } from "@components/molecules";
import { useTestFlow } from "@hooks";
import { TestType } from "@services/testRoomService";

function PersonalityTestPublic() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    roomId,
    userId,
    deviceId,
    registrationUrl,
    stage,
    error,
    submitting,
    room,
    result,
    questions,
    answers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    handleAnswerChange,
    handleSubmit,
    handleRegistrationSuccess,
  } = useTestFlow({
    testKey: "personality_test",
    testType: TestType.PERSONALITY_TEST,
    questionsKey: "questions.personality",
  });

  // ── Loading ────────────────────────────────────────────
  if (stage === "loading") {
    return <PageLoading title={t("tests.personality.title")} maxWidth="sm" />;
  }

  // ── Error ──────────────────────────────────────────────
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

  // ── Registration ───────────────────────────────────────
  if (stage === "registration") {
    return (
      <PageLayout title={t("tests.personality.title")} maxWidth="sm">
        <TestRegistrationCard
          testType={TestType.PERSONALITY_TEST}
          title={t("tests.personality.subtitle")}
          description={t("tests.personality.description")}
          roomName={room?.name}
          registrationUrl={registrationUrl}
          roomId={roomId}
          deviceId={deviceId}
          userId={userId}
          onSuccess={handleRegistrationSuccess}
        />
      </PageLayout>
    );
  }

  // ── Test ───────────────────────────────────────────────
  if (stage === "test") {
    return (
      <PageLayout title={t("tests.personality.title")} maxWidth="md">
        <TestQuestionCard
          questions={questions}
          currentIndex={currentQuestionIndex}
          answers={answers}
          onAnswer={handleAnswerChange}
          onPrevious={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
          onNext={() => setCurrentQuestionIndex((i) => i + 1)}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
        />
      </PageLayout>
    );
  }

  // ── Result ─────────────────────────────────────────────
  if (stage === "result" && result) {
    const traits = result.traits || {};

    const personalityLabels = [
      t("tests.personality.traits.extraversion"),
      t("tests.personality.traits.agreeableness"),
      t("tests.personality.traits.conscientiousness"),
      t("tests.personality.traits.neuroticism"),
      t("tests.personality.traits.openness"),
    ];

    const radarDatasets = [
      {
        label: t("tests.personality.roomDetail.traitsLabel"),
        data: [
          (traits.extroversion ?? traits.extraversion ?? 0) * 100,
          (traits.agreeableness ?? 0) * 100,
          (traits.conscientiousness ?? 0) * 100,
          (traits.negative_emotionality ?? traits.neuroticism ?? 0) * 100,
          (traits.open_mindedness ?? traits.openness ?? 0) * 100,
        ],
      },
    ];

    return (
      <PageLayout title={t("tests.personality.roomDetail.resultsTitle")} maxWidth="md">
        <Card sx={{ mt: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t("tests.personality.resultsReady")}
            </Typography>

            <RadarChart labels={personalityLabels} datasets={radarDatasets} sx={{ mb: 3 }} />

            <MarkdownSection
              title={t("tests.personality.roomDetail.jobRecommendations")}
              content={result.job_recommendation}
            />
          </CardContent>
        </Card>

        <TestCompletionMessage />
      </PageLayout>
    );
  }

  return null;
}

export default PersonalityTestPublic;
