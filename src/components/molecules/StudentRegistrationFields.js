/**
 * StudentRegistrationFields Molecule
 *
 * Reusable Full Name + Student Number field pair used across
 * all public-facing test registration forms.
 *
 * Features:
 * - i18n labels from tests.participantInfo.*
 * - Student number restricted to digits only (integer validation)
 * - Per-field error display via `errors` map
 * - Controlled via `fullName` / `studentNumber` + onChange callbacks
 */

import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import FormField from "./FormField";

function StudentRegistrationFields({
  fullName,
  studentNumber,
  onFullNameChange,
  onStudentNumberChange,
  errors = {},
  disabled = false,
}) {
  const { t } = useTranslation();

  // Only allow digits for student number
  const handleStudentNumberChange = useCallback(
    (value) => {
      const digitsOnly = value.replace(/\D/g, "");
      onStudentNumberChange(digitsOnly);
    },
    [onStudentNumberChange]
  );

  return (
    <>
      <FormField
        label={t("tests.participantInfo.name")}
        value={fullName}
        onChange={onFullNameChange}
        error={!!errors.fullName}
        helperText={errors.fullName || ""}
        required
        disabled={disabled}
      />

      <FormField
        label={t("tests.participantInfo.studentId")}
        value={studentNumber}
        onChange={handleStudentNumberChange}
        error={!!errors.studentNumber}
        helperText={errors.studentNumber || ""}
        required
        disabled={disabled}
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
      />
    </>
  );
}

StudentRegistrationFields.propTypes = {
  fullName: PropTypes.string.isRequired,
  studentNumber: PropTypes.string.isRequired,
  onFullNameChange: PropTypes.func.isRequired,
  onStudentNumberChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    fullName: PropTypes.string,
    studentNumber: PropTypes.string,
  }),
  disabled: PropTypes.bool,
};

export default StudentRegistrationFields;
