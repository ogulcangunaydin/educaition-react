/**
 * Student Registration Validation
 *
 * Shared validation logic for fullName + studentNumber fields
 * used across all public test registration forms.
 *
 * @param {string} fullName
 * @param {string} studentNumber
 * @param {Function} t - i18next translation function
 * @returns {{ valid: boolean, errors: { fullName?: string, studentNumber?: string } }}
 */
export function validateStudentRegistration(fullName, studentNumber, t) {
  const errors = {};

  if (!fullName.trim()) {
    errors.fullName = t("tests.participantInfo.nameRequired");
  }

  if (!studentNumber.trim()) {
    errors.studentNumber = t("tests.participantInfo.studentIdRequired");
  } else if (!/^\d+$/.test(studentNumber.trim())) {
    errors.studentNumber = t("tests.participantInfo.studentIdMustBeNumber");
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
