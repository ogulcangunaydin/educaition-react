/**
 * PersonalityTestPublic Page
 *
 * Public-facing personality test page accessed via QR code.
 * Features:
 * - Device tracking to prevent retaking
 * - Anonymous participant creation
 * - Big Five personality test (60 questions)
 *
 * Uses shared useTestFlow hook + TestRegistrationCard + TestQuestionCard
 * for the common test lifecycle. Only test-specific logic (question loading,
 * result rendering, API endpoints) remains here.
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Card, CardContent } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TestRegistrationCard, RadarChart, TestQuestionCard } from "@components/organisms";
import { PageLayout, PageLoading, PageError } from "@components/templates";
import { MarkdownSection, TestCompletionMessage } from "@components/molecules";
import { useTestFlow } from "@hooks";
import { getTestRoomPublic, TestType } from "@services/testRoomService";
import bigFiveTestENQuestions from "./BigFiveTestEN.txt";
import { API_BASE_URL } from "@config/env";

const REGISTRATION_URL = `${API_BASE_URL}/personality-test/participants`;
const getSubmitUrl = (participantId) =>
  `${API_BASE_URL}/personality-test/participants/${participantId}/submit`;

function PersonalityTestPublic() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    roomId,
    userId,
    deviceId,
    stage,
    setStage,
    error,
    setError,
    submitting,
    setSubmitting,
    room,
    setRoom,
    participantId,
    setParticipantId,
    result,
    setResult,
    questions,
    setQuestions,
    answers,
    setAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    handleAnswerChange,
    saveProgress,
    loadProgress,
    clearProgress,
  } = useTestFlow({ testKey: "personality_test", getSubmitUrl });

  // ── Initialisation (load room + questions + restore progress) ──
  useEffect(() => {
    if (!deviceId) return;

    const init = async () => {
      try {
        const roomData = await getTestRoomPublic(roomId);
        setRoom(roomData);

        const response = await fetch(bigFiveTestENQuestions);
        const text = await response.text();
        const questionsArray = text.split("\n").filter(Boolean);
        setQuestions(questionsArray);

        // Try to restore saved progress
        const saved = loadProgress();
        if (saved?.participantId) {
          // Re-register to refresh the session cookie. The backend
          // recognises device_fingerprint + room and returns the
          // existing in-progress participant (no duplicate).
          try {
            const regResponse = await fetch(REGISTRATION_URL, {
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
              setParticipantId(saved.participantId);
            }
          } catch {
            setParticipantId(saved.participantId);
          }

          setAnswers(saved.answers || new Array(questionsArray.length).fill(null));
          setCurrentQuestionIndex(saved.currentQuestionIndex || 0);
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

    init();
  }, [roomId, deviceId]); // eslint-disable-line react-hooks/exhaustive-deps

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
          registrationUrl={REGISTRATION_URL}
          roomId={roomId}
          deviceId={deviceId}
          userId={userId}
          onSuccess={(data) => {
            setParticipantId(data.participant.id);
            saveProgress({
              participantId: data.participant.id,
              fullName: data.fullName,
              studentNumber: data.studentNumber,
              answers,
              currentQuestionIndex: 0,
            });
            setStage("test");
          }}
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
