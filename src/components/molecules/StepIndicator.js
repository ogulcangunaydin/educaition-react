/**
 * StepIndicator Molecule
 *
 * A step indicator for multi-step forms.
 */

import React from "react";
import { Stepper, Step, StepLabel, Box, useMediaQuery, useTheme } from "@mui/material";
import PropTypes from "prop-types";

function StepIndicator({
  steps = [],
  activeStep = 0,
  orientation,
  alternativeLabel = true,
  nonLinear = false,
  onStepClick,
  ...props
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Use vertical orientation on mobile if not specified
  const finalOrientation = orientation || (isMobile ? "vertical" : "horizontal");

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Stepper
        activeStep={activeStep}
        orientation={finalOrientation}
        alternativeLabel={finalOrientation === "horizontal" && alternativeLabel}
        nonLinear={nonLinear}
        {...props}
      >
        {steps.map((step, index) => {
          const label = typeof step === "string" ? step : step.label;
          const optional = typeof step === "object" ? step.optional : undefined;
          const completed = typeof step === "object" ? step.completed : undefined;
          const error = typeof step === "object" ? step.error : undefined;

          return (
            <Step
              key={label}
              completed={completed}
              sx={onStepClick ? { cursor: "pointer" } : {}}
              onClick={onStepClick ? () => onStepClick(index) : undefined}
            >
              <StepLabel optional={optional} error={error}>
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}

StepIndicator.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        optional: PropTypes.node,
        completed: PropTypes.bool,
        error: PropTypes.bool,
      }),
    ])
  ).isRequired,
  activeStep: PropTypes.number,
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
  alternativeLabel: PropTypes.bool,
  nonLinear: PropTypes.bool,
  onStepClick: PropTypes.func,
};

export default StepIndicator;
