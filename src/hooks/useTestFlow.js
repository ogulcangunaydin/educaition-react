/**
 * useTestFlow Hook
 *
 * Shared hook for all public-facing test pages.
 * Manages the common test lifecycle: loading → registration → test → result.
 *
 * Encapsulates:
 * - Stage management
 * - Device fingerprint resolution
 * - Auth context (userId)
 * - Room state
 * - Participant & result state
 * - Questions, answers, and current index
 * - Progress persistence (localStorage merge-based)
 * - Auto-advancing answer handler
 * - Test submission with configurable URL / body
 *
 * @param {Object} config
 * @param {string} config.testKey - Unique key for localStorage (e.g. "personality_test")
 * @param {(participantId: string|number) => string} [config.getSubmitUrl]
 *   Function that returns the submit URL given the participantId.
 * @param {(answers: any[]) => Object} [config.buildSubmitBody]
 *   Function that builds the request body from answers. Defaults to `{ answers }`.
 *
 * @example
 * const {
 *   handleSubmit,
 *   handleAnswerChange,
 *   stage, setStage,
 *   ...
 * } = useTestFlow({
 *   testKey: "personality_test",
 *   getSubmitUrl: (pid) => `${API_BASE_URL}/personality-test/participants/${pid}/submit`,
 * });
 */

import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@contexts/AuthContext";
import { getDeviceFingerprint } from "@utils/deviceFingerprint";

export default function useTestFlow({ testKey, getSubmitUrl, buildSubmitBody }) {
  const { t } = useTranslation();
  const { roomId } = useParams();
  const { userId } = useAuth();

  // ── Stage ──────────────────────────────────────────────
  const [stage, setStage] = useState("loading"); // loading | registration | test | result | error
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Device fingerprint (async — resolved on mount) ────
  const [deviceId, setDeviceId] = useState(null);
  useEffect(() => {
    getDeviceFingerprint().then(setDeviceId);
  }, []);

  // ── Room ───────────────────────────────────────────────
  const [room, setRoom] = useState(null);

  // ── Participant ────────────────────────────────────────
  const [participantId, setParticipantId] = useState(null);
  const [result, setResult] = useState(null);

  // ── Questions & answers ────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ── Progress persistence (merge-based) ─────────────────
  const storageKey = `${testKey}_progress_${roomId}`;

  const loadProgress = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const saveProgress = useCallback(
    (data) => {
      try {
        const existing = loadProgress() || {};
        localStorage.setItem(storageKey, JSON.stringify({ ...existing, ...data }));
      } catch {
        // localStorage full or unavailable — non-critical
      }
    },
    [storageKey, loadProgress]
  );

  const clearProgress = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // ── Answer handling (auto-advance) ─────────────────────
  const handleAnswerChange = useCallback(
    (questionIndex, value) => {
      const newAnswers = [...answers];
      newAnswers[questionIndex] = value;
      setAnswers(newAnswers);

      const nextIndex = questionIndex < questions.length - 1 ? questionIndex + 1 : questionIndex;

      // Persist
      saveProgress({ answers: newAnswers, currentQuestionIndex: nextIndex });

      // Auto-advance after a short delay
      if (questionIndex < questions.length - 1) {
        setTimeout(() => setCurrentQuestionIndex(nextIndex), 200);
      }
    },
    [answers, questions.length, saveProgress]
  );

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (answers.some((a) => a === null || a === undefined)) {
      setError(t("tests.answerAllQuestions"));
      return;
    }

    if (!getSubmitUrl) return;

    setSubmitting(true);
    setError(null);

    try {
      const url = getSubmitUrl(participantId);
      const body = buildSubmitBody ? buildSubmitBody(answers) : { answers };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t("tests.submissionFailed"));
      }

      const resultData = await response.json();
      setResult(resultData);
      clearProgress();
      setStage("result");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [answers, participantId, getSubmitUrl, buildSubmitBody, clearProgress, t]);

  return {
    // IDs
    roomId,
    userId,
    deviceId,

    // Stage
    stage,
    setStage,
    error,
    setError,
    submitting,
    setSubmitting,

    // Room
    room,
    setRoom,

    // Participant
    participantId,
    setParticipantId,
    result,
    setResult,

    // Questions & answers
    questions,
    setQuestions,
    answers,
    setAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    handleAnswerChange,

    // Submit
    handleSubmit,

    // Progress
    saveProgress,
    loadProgress,
    clearProgress,
  };
}
