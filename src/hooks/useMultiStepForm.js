/**
 * useMultiStepForm Hook
 *
 * A hook for managing multi-step form state and navigation.
 */

import { useState, useCallback, useMemo } from "react";

function useMultiStepForm(steps, options = {}) {
  const { initialStep = 0, validateStep, onStepChange, onComplete } = options;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepErrors, setStepErrors] = useState({});

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Get current step info
  const currentStepInfo = useMemo(
    () => ({
      index: currentStep,
      label:
        typeof steps[currentStep] === "string" ? steps[currentStep] : steps[currentStep]?.label,
      data:
        typeof steps[currentStep] === "object" ? steps[currentStep] : { label: steps[currentStep] },
    }),
    [currentStep, steps]
  );

  // Validate current step
  const validateCurrentStep = useCallback(async () => {
    if (!validateStep) return true;

    try {
      const error = await validateStep(currentStep);
      if (error) {
        setStepErrors((prev) => ({ ...prev, [currentStep]: error }));
        return false;
      }

      setStepErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[currentStep];
        return newErrors;
      });
      return true;
    } catch (err) {
      setStepErrors((prev) => ({
        ...prev,
        [currentStep]: err.message || "Doğrulama hatası",
      }));
      return false;
    }
  }, [currentStep, validateStep]);

  // Go to next step
  const goNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return false;

    if (isLastStep) {
      if (onComplete) {
        await onComplete();
      }
      return true;
    }

    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setCurrentStep((prev) => prev + 1);
    onStepChange?.(currentStep + 1, currentStep);

    return true;
  }, [currentStep, isLastStep, validateCurrentStep, onComplete, onStepChange]);

  // Go to previous step
  const goBack = useCallback(() => {
    if (isFirstStep) return false;

    setCurrentStep((prev) => prev - 1);
    onStepChange?.(currentStep - 1, currentStep);

    return true;
  }, [currentStep, isFirstStep, onStepChange]);

  // Go to specific step
  const goToStep = useCallback(
    async (step, skipValidation = false) => {
      if (step < 0 || step >= totalSteps) return false;

      // If going forward, validate current step first
      if (step > currentStep && !skipValidation) {
        const isValid = await validateCurrentStep();
        if (!isValid) return false;
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      }

      setCurrentStep(step);
      onStepChange?.(step, currentStep);

      return true;
    },
    [currentStep, totalSteps, validateCurrentStep, onStepChange]
  );

  // Reset to initial step
  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    setCompletedSteps(new Set());
    setStepErrors({});
  }, [initialStep]);

  // Check if a step is completed
  const isStepCompleted = useCallback(
    (step) => {
      return completedSteps.has(step);
    },
    [completedSteps]
  );

  // Check if a step has errors
  const hasStepError = useCallback(
    (step) => {
      return Boolean(stepErrors[step]);
    },
    [stepErrors]
  );

  // Get step error
  const getStepError = useCallback(
    (step) => {
      return stepErrors[step];
    },
    [stepErrors]
  );

  // Get steps with status for stepper component
  const stepsWithStatus = useMemo(() => {
    return steps.map((step, index) => ({
      label: typeof step === "string" ? step : step.label,
      completed: completedSteps.has(index),
      error: Boolean(stepErrors[index]),
      optional: typeof step === "object" ? step.optional : undefined,
    }));
  }, [steps, completedSteps, stepErrors]);

  return {
    // Current state
    currentStep,
    currentStepInfo,
    totalSteps,
    progress,

    // Navigation flags
    isFirstStep,
    isLastStep,

    // Navigation methods
    goNext,
    goBack,
    goToStep,
    reset,

    // Step status
    completedSteps: Array.from(completedSteps),
    stepErrors,
    isStepCompleted,
    hasStepError,
    getStepError,

    // For stepper component
    stepsWithStatus,
  };
}

export default useMultiStepForm;
