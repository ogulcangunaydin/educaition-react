/**
 * useTestFlow Hook
 *
 * Shared hook for all public-facing test pages.
 * Manages the complete test lifecycle: loading → registration → test → result.
 *
 * Encapsulates:
 * - Room loading & question resolution (from i18n)
 * - Stage management
 * - Device fingerprint resolution
 * - Auth context (userId)
 * - Progress persistence (localStorage) + auto-restore on reload
 * - Auto-advancing answer handler
 * - Test submission with configurable URL / body
 *
 * @param {Object} config
 * @param {string} config.testKey    - Unique key for localStorage (e.g. "personality_test")
 * @param {string} config.testType   - TestType enum value — used to resolve endpoints
 * @param {string} config.questionsKey - i18n key for the questions array (e.g. "questions.personality")
 * @param {(answers: any[]) => Object} [config.buildSubmitBody]
 *   Builds the request body from answers. Defaults to `{ answers }`.
 *
 * @example
 * const flow = useTestFlow({
 *   testKey: "personality_test",
 *   testType: TestType.PERSONALITY_TEST,
 *   questionsKey: "questions.personality",
 * });
 */

import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@contexts/AuthContext";
import { getDeviceFingerprint } from "@utils/deviceFingerprint";
import { getTestRoomPublic, getTestEndpoints } from "@services/testRoomService";

export default function useTestFlow({ testKey, testType, questionsKey, buildSubmitBody }) {
  const { t } = useTranslation();
  const { roomId } = useParams();
  const { userId } = useAuth();

  // ── Endpoints (derived from testType) ──────────────────
  const { registrationUrl, getSubmitUrl } = getTestEndpoints(testType);

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

  // ── Initialisation (load room + questions + restore progress) ──
  useEffect(() => {
    if (!deviceId) return;

    const init = async () => {
      try {
        // 1. Load room
        const roomData = await getTestRoomPublic(roomId);
        setRoom(roomData);

        // 2. Load questions from i18n
        const questionsArray = t(questionsKey, { returnObjects: true });
        if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
          throw new Error("Questions not found");
        }
        setQuestions(questionsArray);

        // 3. Try to restore saved progress
        const saved = loadProgress();
        if (saved?.participantId) {
          // Re-register to refresh the session cookie.
          // Backend recognises device_fingerprint + room → returns existing participant.
          try {
            const regResponse = await fetch(registrationUrl, {
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
          // 4. Fresh start
          setAnswers(new Array(questionsArray.length).fill(null));
          setStage("registration");
        }
      } catch (err) {
        setError(err.message || t("tests.submissionFailed"));
        setStage("error");
      }
    };

    init();
  }, [roomId, deviceId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Registration success handler ───────────────────────
  const handleRegistrationSuccess = useCallback(
    (data) => {
      setParticipantId(data.participant.id);
      saveProgress({
        participantId: data.participant.id,
        fullName: data.fullName,
        studentNumber: data.studentNumber,
        answers,
        currentQuestionIndex: 0,
      });
      setStage("test");
    },
    [answers, saveProgress]
  );

  return {
    // IDs
    roomId,
    userId,
    deviceId,

    // Endpoints
    registrationUrl,

    // Stage
    stage,
    setStage,
    error,
    submitting,

    // Room
    room,

    // Participant
    participantId,
    result,

    // Questions & answers
    questions,
    answers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    handleAnswerChange,

    // Submit
    handleSubmit,

    // Registration
    handleRegistrationSuccess,

    // Progress
    saveProgress,
  };
}
