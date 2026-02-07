/**
 * TestRegistrationCard Organism
 *
 * Reusable registration card for all public-facing test pages.
 * Renders a styled Card with:
 * - Colored top border based on test type
 * - Title & description
 * - Room name display
 * - StudentRegistrationFields (fullName + studentNumber)
 * - Submit button with loading state
 * - General error alert
 *
 * @example
 * <TestRegistrationCard
 *   testType={TestType.PERSONALITY_TEST}
 *   title={t("tests.personality.subtitle")}
 *   description={t("tests.personality.description")}
 *   roomName={room?.name}
 *   fullName={fullName}
 *   studentNumber={studentNumber}
 *   onFullNameChange={setFullName}
 *   onStudentNumberChange={setStudentNumber}
 *   fieldErrors={fieldErrors}
 *   submitting={submitting}
 *   onSubmit={handleRegister}
 * />
 */

import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography, Alert, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Button } from "@components/atoms";
import { StudentRegistrationFields } from "@components/molecules";
import { TEST_TYPE_CONFIG } from "@services/testRoomService";

function TestRegistrationCard({
  testType,
  title,
  description,
  roomName,
  fullName,
  studentNumber,
  onFullNameChange,
  onStudentNumberChange,
  fieldErrors = {},
  submitting = false,
  onSubmit,
  submitLabel,
  children,
}) {
  const { t } = useTranslation();

  const config = testType ? TEST_TYPE_CONFIG[testType] : null;
  const borderColor = config?.color || "primary.main";

  return (
    <Card sx={{ mt: 4, borderTop: 4, borderColor }}>
      <CardContent sx={{ p: 4 }}>
        {title && (
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
        )}

        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {description}
          </Typography>
        )}

        {roomName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("common.room")}: <strong>{roomName}</strong>
          </Typography>
        )}

        {fieldErrors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {fieldErrors.general}
          </Alert>
        )}

        <StudentRegistrationFields
          fullName={fullName}
          studentNumber={studentNumber}
          onFullNameChange={onFullNameChange}
          onStudentNumberChange={onStudentNumberChange}
          errors={fieldErrors}
          disabled={submitting}
        />

        {/* Extra fields slot — test-specific fields can be placed here */}
        {children}

        <Button
          variant="contained"
          fullWidth
          onClick={onSubmit}
          disabled={submitting}
          sx={{ mt: 1, py: 1.5 }}
        >
          {submitting ? (
            <CircularProgress size={24} />
          ) : (
            submitLabel || t("tests.participantInfo.continue")
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

TestRegistrationCard.propTypes = {
  /** Test type key from TestType enum — used for border color */
  testType: PropTypes.string,
  /** Card heading */
  title: PropTypes.string,
  /** Card description text */
  description: PropTypes.string,
  /** Room name to display */
  roomName: PropTypes.string,
  /** Controlled full name value */
  fullName: PropTypes.string.isRequired,
  /** Controlled student number value */
  studentNumber: PropTypes.string.isRequired,
  /** Full name change handler */
  onFullNameChange: PropTypes.func.isRequired,
  /** Student number change handler */
  onStudentNumberChange: PropTypes.func.isRequired,
  /** Field-level errors ({ fullName, studentNumber, general }) */
  fieldErrors: PropTypes.object,
  /** Whether the form is currently submitting */
  submitting: PropTypes.bool,
  /** Form submit handler */
  onSubmit: PropTypes.func.isRequired,
  /** Custom submit button label (defaults to t("tests.participantInfo.continue")) */
  submitLabel: PropTypes.string,
  /** Optional extra form fields rendered between StudentRegistrationFields and the button */
  children: PropTypes.node,
};

export default TestRegistrationCard;
