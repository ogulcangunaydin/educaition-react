/**
 * TestRegistrationCard Organism
 *
 * Self-contained registration card for all public-facing test pages.
 * Manages its own form state, validation, API call, and error handling.
 *
 * Renders a styled Card with:
 * - Colored top border based on test type
 * - Title & description
 * - Room name display
 * - StudentRegistrationFields (fullName + studentNumber)
 * - Submit button with loading state
 * - General error alert
 *
 * The component handles the full registration flow internally:
 * 1. Validates fullName + studentNumber
 * 2. POSTs to registrationUrl with standard payload
 * 3. Handles 409 (duplicate device) and other errors
 * 4. Calls onSuccess with response data on success
 *
 * For tests that need extra form fields (e.g., age, gender),
 * use `children` for the UI and `getExtraPayload` to include
 * extra fields in the API request body.
 *
 * @example
 * <TestRegistrationCard
 *   testType={TestType.PERSONALITY_TEST}
 *   title={t("tests.personality.subtitle")}
 *   description={t("tests.personality.description")}
 *   roomName={room?.name}
 *   registrationUrl={`${API_BASE_URL}/personality-test/participants`}
 *   roomId={roomId}
 *   deviceId={deviceId}
 *   userId={userId}
 *   onSuccess={(data) => {
 *     setParticipantId(data.participant.id);
 *     setStage("test");
 *   }}
 * />
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography, Alert, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Button } from "@components/atoms";
import { StudentRegistrationFields } from "@components/molecules";
import { TEST_TYPE_CONFIG } from "@services/testRoomService";
import { validateStudentRegistration } from "@utils/validation";

function TestRegistrationCard({
  testType,
  title,
  description,
  roomName,
  // Registration config
  registrationUrl,
  roomId,
  deviceId,
  userId,
  // Optional: extra payload fields for the API request
  getExtraPayload,
  // Callback on successful registration
  onSuccess,
  // Restore from saved progress
  defaultFullName = "",
  defaultStudentNumber = "",
  // Customization
  submitLabel,
  children,
}) {
  const { t } = useTranslation();

  // Internal form state
  const [fullName, setFullName] = useState(defaultFullName);
  const [studentNumber, setStudentNumber] = useState(defaultStudentNumber);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const config = testType ? TEST_TYPE_CONFIG[testType] : null;
  const borderColor = config?.color || "primary.main";

  const handleRegister = async () => {
    // Validate common fields
    const { valid, errors: validationErrors } = validateStudentRegistration(
      fullName,
      studentNumber,
      t
    );
    if (!valid) {
      setFieldErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    try {
      const payload = {
        test_room_id: parseInt(roomId, 10),
        full_name: fullName.trim(),
        student_number: studentNumber.trim(),
        device_fingerprint: deviceId,
        student_user_id: userId || null,
        ...(getExtraPayload ? getExtraPayload() : {}),
      };

      const response = await fetch(registrationUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          throw new Error(t("tests.participantInfo.alreadyCompleted"));
        }
        throw new Error(data.detail || t("tests.participantInfo.registrationFailed"));
      }

      const data = await response.json();
      onSuccess?.({
        ...data,
        fullName: fullName.trim(),
        studentNumber: studentNumber.trim(),
      });
    } catch (err) {
      setFieldErrors({ general: err.message });
    } finally {
      setSubmitting(false);
    }
  };

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
          onFullNameChange={setFullName}
          onStudentNumberChange={setStudentNumber}
          errors={fieldErrors}
          disabled={submitting}
        />

        {/* Extra fields slot — test-specific fields can be placed here */}
        {children}

        <Button
          variant="contained"
          fullWidth
          onClick={handleRegister}
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
  /** Full URL to POST registration to */
  registrationUrl: PropTypes.string.isRequired,
  /** Room ID (sent as test_room_id in payload) */
  roomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  /** Device fingerprint string */
  deviceId: PropTypes.string,
  /** Authenticated user ID (optional) */
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Function returning extra fields to merge into the request body */
  getExtraPayload: PropTypes.func,
  /** Called with response data + { fullName, studentNumber } on success */
  onSuccess: PropTypes.func.isRequired,
  /** Pre-fill full name (e.g., from restored progress) */
  defaultFullName: PropTypes.string,
  /** Pre-fill student number (e.g., from restored progress) */
  defaultStudentNumber: PropTypes.string,
  /** Custom submit button label (defaults to t("tests.participantInfo.continue")) */
  submitLabel: PropTypes.string,
  /** Optional extra form fields rendered between StudentRegistrationFields and the button */
  children: PropTypes.node,
};

export default TestRegistrationCard;
