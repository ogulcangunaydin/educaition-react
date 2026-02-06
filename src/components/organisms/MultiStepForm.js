/**
 * MultiStepForm Organism
 *
 * A multi-step form with navigation.
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import PropTypes from "prop-types";
import Button from "../atoms/Button";
import StepIndicator from "../molecules/StepIndicator";

function MultiStepForm({
  steps = [],
  activeStep = 0,
  onNext,
  onBack,
  onSubmit,
  children,
  isLoading = false,
  isNextDisabled = false,
  nextLabel = "Devam",
  backLabel = "Geri",
  submitLabel = "Gönder",
  showStepIndicator = true,
  elevation = 1,
  ...props
}) {
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onSubmit?.();
    } else {
      onNext?.();
    }
  };

  return (
    <Paper elevation={elevation} sx={{ p: 4 }} {...props}>
      {showStepIndicator && <StepIndicator steps={steps} activeStep={activeStep} />}

      <Box sx={{ minHeight: 200, mb: 4 }}>{children}</Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Button variant="outlined" onClick={onBack} disabled={isFirstStep || isLoading}>
          {backLabel}
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={isNextDisabled || isLoading}
          loading={isLoading}
        >
          {isLastStep ? submitLabel : nextLabel}
        </Button>
      </Box>
    </Paper>
  );
}

MultiStepForm.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeStep: PropTypes.number,
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  onSubmit: PropTypes.func,
  children: PropTypes.node,
  isLoading: PropTypes.bool,
  isNextDisabled: PropTypes.bool,
  nextLabel: PropTypes.string,
  backLabel: PropTypes.string,
  submitLabel: PropTypes.string,
  showStepIndicator: PropTypes.bool,
  elevation: PropTypes.number,
};

export default MultiStepForm;
