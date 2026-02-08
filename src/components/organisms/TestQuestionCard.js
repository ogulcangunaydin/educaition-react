/**
 * TestQuestionCard Organism
 *
 * Reusable question card with colored answer buttons.
 * Used across all public test pages that present one question at a time
 * (Personality Test, RIASEC, Dissonance, etc.).
 *
 * Features:
 * - Progress bar with "Question X of Y" counter
 * - Question text display
 * - Colored answer buttons (positive → negative, green → red)
 * - Previous / Next / Submit navigation
 * - Error alert display
 * - i18n throughout
 *
 * @example
 * <TestQuestionCard
 *   questions={questions}
 *   currentIndex={currentQuestionIndex}
 *   answers={answers}
 *   options={LIKERT_OPTIONS}
 *   onAnswer={handleAnswer}
 *   onPrevious={() => setIndex(i => i - 1)}
 *   onNext={() => setIndex(i => i + 1)}
 *   onSubmit={handleSubmit}
 *   submitting={submitting}
 *   error={error}
 * />
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Button from "../atoms/Button";

/**
 * Default 5-point Likert scale with colors (negative → positive).
 * Standard psychometric ordering: strongly disagree first.
 * Each test page can override with its own options array.
 */
export const LIKERT_5_OPTIONS = [
  { value: 1, labelKey: "tests.personality.scale.stronglyDisagree", color: "#f44336" },
  { value: 2, labelKey: "tests.personality.scale.disagree", color: "#ff5722" },
  { value: 3, labelKey: "tests.personality.scale.neutral", color: "#ff9800" },
  { value: 4, labelKey: "tests.personality.scale.agree", color: "#8bc34a" },
  { value: 5, labelKey: "tests.personality.scale.stronglyAgree", color: "#4caf50" },
];

function TestQuestionCard({
  questions,
  currentIndex,
  answers,
  options = LIKERT_5_OPTIONS,
  onAnswer,
  onPrevious,
  onNext,
  onSubmit,
  submitting = false,
  error,
  getQuestionText,
  questionMinHeight = 80, // Fixed height for question container to prevent layout shifts
}) {
  const { t } = useTranslation();

  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= totalQuestions - 1;
  const isComplete = answers.every((a) => a !== null && a !== undefined);
  const currentAnswer = answers[currentIndex];

  // Resolve question text — support both string arrays and object arrays
  const questionText = getQuestionText
    ? getQuestionText(currentQuestion, currentIndex)
    : typeof currentQuestion === "string"
      ? currentQuestion
      : currentQuestion?.text || "";

  return (
    <>
      {/* Progress */}
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("tests.questionOf", { current: currentIndex + 1, total: totalQuestions })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Question */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Fixed height container for question text to prevent layout shifts */}
          <Box
            sx={{
              minHeight: questionMinHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {questionText}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 3 }}>
            {options.map((option) => {
              const label = option.labelKey ? t(option.labelKey) : option.label;
              const isSelected =
                currentAnswer !== null &&
                currentAnswer !== undefined &&
                // eslint-disable-next-line eqeqeq
                currentAnswer == option.value;

              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => onAnswer(currentIndex, option.value)}
                  sx={{
                    py: 1.5,
                    borderColor: option.color,
                    color: isSelected ? "white" : option.color,
                    backgroundColor: isSelected ? option.color : "transparent",
                    "&:hover": {
                      backgroundColor: option.color,
                      color: "white",
                    },
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Button variant="outlined" onClick={onPrevious} disabled={currentIndex === 0}>
          {t("common.previous")}
        </Button>

        {!isLastQuestion ? (
          <Button
            variant="contained"
            onClick={onNext}
            disabled={currentAnswer === null || currentAnswer === undefined}
          >
            {t("common.next")}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={!isComplete || submitting}
            color="success"
          >
            {submitting ? <CircularProgress size={24} /> : t("common.submit")}
          </Button>
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </>
  );
}

TestQuestionCard.propTypes = {
  /** Array of questions (strings or objects with .text) */
  questions: PropTypes.array.isRequired,
  /** Current 0-based question index */
  currentIndex: PropTypes.number.isRequired,
  /** Array of answers (same length as questions, null = unanswered) */
  answers: PropTypes.array.isRequired,
  /** Answer options array with { value, label/labelKey, color } — ordered positive first */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      label: PropTypes.string,
      labelKey: PropTypes.string,
      color: PropTypes.string.isRequired,
    })
  ),
  /** Called with (questionIndex, value) when an option is clicked */
  onAnswer: PropTypes.func.isRequired,
  /** Go to previous question */
  onPrevious: PropTypes.func.isRequired,
  /** Go to next question */
  onNext: PropTypes.func.isRequired,
  /** Submit the test (shown on last question) */
  onSubmit: PropTypes.func.isRequired,
  /** Whether submission is in progress */
  submitting: PropTypes.bool,
  /** Error message to display below navigation */
  error: PropTypes.string,
  /** Custom function to extract question text: (question, index) => string */
  getQuestionText: PropTypes.func,
  /** Minimum height for question container to prevent layout shifts */
  questionMinHeight: PropTypes.number,
};

export default TestQuestionCard;
