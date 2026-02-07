/**
 * PrisonersDilemmaPublic Page
 *
 * Public-facing Prisoner's Dilemma game page accessed via QR code.
 * Features a 4-step flow:
 *   Step 0: Register with full name + student number (via TestRegistrationCard)
 *   Step 1: Game explanation + tactic entry (triggers GPT code generation)
 *   Step 2: Select reason for tactic (triggers GPT job recommendation)
 *   Step 3: Results (job recommendation) + Waiting for session
 *
 * Uses i18n for all user-facing strings and shared components.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  Skeleton,
} from "@mui/material";
import { Button } from "@components/atoms";
import { PageLayout } from "@components/templates";
import { FormField, StepIndicator, MarkdownSection } from "@components/molecules";
import { TestRegistrationCard } from "@components/organisms";
import { getTestRoomPublic, getTestEndpoints, TestType } from "@services/testRoomService";
import { savePlayerTactic, getTacticReasons, submitTacticReason } from "@services/playerService";
import { Typography } from "@components/atoms";
import { useAuth } from "@contexts/AuthContext";
import { getDeviceFingerprint } from "@utils/deviceFingerprint";

function PrisonersDilemmaPublic() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { userId } = useAuth();

  // Device fingerprint
  const [deviceId, setDeviceId] = useState(null);
  useEffect(() => {
    getDeviceFingerprint().then(setDeviceId);
  }, []);

  // Endpoints for TestRegistrationCard
  const { registrationUrl } = getTestEndpoints(TestType.PRISONERS_DILEMMA);

  // Room state
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Step state
  const [step, setStep] = useState(0);

  // Registration — player object from backend
  const [player, setPlayer] = useState(null);

  // Tactic
  const [tactic, setTactic] = useState("");

  // Reasons
  const [reasons, setReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState("");
  const [loadingReasons, setLoadingReasons] = useState(false);

  // Results
  const [jobRecommendation, setJobRecommendation] = useState("");
  const [loadingResult, setLoadingResult] = useState(false);

  // Submitting state
  const [submitting, setSubmitting] = useState(false);

  const STEPS = useMemo(
    () => [
      t("tests.prisonersDilemma.publicPage.steps.join"),
      t("tests.prisonersDilemma.publicPage.steps.prepareTactic"),
      t("tests.prisonersDilemma.publicPage.steps.selectReason"),
      t("tests.prisonersDilemma.publicPage.steps.results"),
    ],
    [t]
  );

  // Load room data
  useEffect(() => {
    const loadData = async () => {
      try {
        const roomData = await getTestRoomPublic(roomId);
        setRoom(roomData);
        setLoading(false);
      } catch (err) {
        setError(err.message || t("common.error"));
        setLoading(false);
      }
    };
    loadData();
  }, [roomId, t]);

  // Navigation
  const nextStep = useCallback(() => setStep((s) => s + 1), []);

  // Submit tactic
  const handleSubmitTactic = useCallback(async () => {
    if (!player || !tactic.trim()) {
      setError(t("tests.prisonersDilemma.publicPage.gameExplanation.tacticLabel"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Save tactic — this triggers GPT code generation on the backend
      const updatedPlayer = await savePlayerTactic(player.id, tactic.trim());
      setPlayer(updatedPlayer);
      nextStep();

      // Immediately start loading reasons for the next step
      setLoadingReasons(true);
      try {
        const generatedReasons = await getTacticReasons(player.id, i18n.language);
        setReasons(generatedReasons);
      } catch (reasonErr) {
        console.error("Failed to get tactic reasons:", reasonErr);
        setError(reasonErr.message);
      } finally {
        setLoadingReasons(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [player, tactic, nextStep, t, i18n.language]);

  // Submit selected reason
  const handleSubmitReason = useCallback(async () => {
    if (!selectedReason) {
      setError(t("tests.prisonersDilemma.publicPage.reasons.selectPrompt"));
      return;
    }

    setLoadingResult(true);
    setError(null);

    try {
      const updatedPlayer = await submitTacticReason(player.id, selectedReason, i18n.language);
      setPlayer(updatedPlayer);
      setJobRecommendation(updatedPlayer.job_recommendation || "");
      nextStep();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingResult(false);
    }
  }, [player, selectedReason, nextStep, t, i18n.language]);

  // Progress
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step, STEPS.length]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">{t("common.loading")}</Typography>
      </Box>
    );
  }

  // Error state on initial load
  if (error && step === 0 && !room) {
    return (
      <PageLayout title={t("common.error")} maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          {t("common.back")}
        </Button>
      </PageLayout>
    );
  }

  const strategyPoints = t("tests.prisonersDilemma.publicPage.gameExplanation.strategyPoints", {
    returnObjects: true,
  });

  return (
    <PageLayout title={t("tests.prisonersDilemma.title")} maxWidth="md">
      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {t("tests.questionOf", { current: step + 1, total: STEPS.length })}
        </Typography>
      </Box>

      {/* Steps */}
      <StepIndicator steps={STEPS} activeStep={step} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ==================== Step 0: Register ==================== */}
      {step === 0 && (
        <TestRegistrationCard
          testType={TestType.PRISONERS_DILEMMA}
          title={t("tests.prisonersDilemma.publicPage.welcome.title")}
          description={t("tests.prisonersDilemma.publicPage.welcome.description")}
          roomName={room?.name}
          registrationUrl={registrationUrl}
          roomId={roomId}
          deviceId={deviceId}
          userId={userId}
          submitLabel={t("tests.prisonersDilemma.publicPage.registration.joinButton")}
          onSuccess={(data) => {
            setPlayer(data.participant);
            nextStep();
          }}
        />
      )}

      {/* ==================== Step 1: Game Explanation + Tactic ==================== */}
      {step === 1 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t("tests.prisonersDilemma.publicPage.gameExplanation.title")}
            </Typography>

            {/* Introduction */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t("tests.prisonersDilemma.publicPage.gameExplanation.intro")}
            </Typography>

            {/* Core Concept */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {t("tests.prisonersDilemma.publicPage.gameExplanation.conceptTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t("tests.prisonersDilemma.publicPage.gameExplanation.conceptDescription")}
            </Typography>

            {/* Payoff Matrix */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.200",
                mb: 3,
              }}
            >
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                {t("tests.prisonersDilemma.publicPage.gameExplanation.payoffTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {t("tests.prisonersDilemma.publicPage.gameExplanation.payoffDescription")}
              </Typography>
              {[
                "payoffBothCooperate",
                "payoffBothDefect",
                "payoffYouCoopTheyDefect",
                "payoffYouDefectTheyCoop",
              ].map((key) => (
                <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
                  {t(`tests.prisonersDilemma.publicPage.gameExplanation.${key}`)}
                </Typography>
              ))}
            </Box>

            {/* The Dilemma */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: "warning.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "warning.200",
                mb: 3,
              }}
            >
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                {t("tests.prisonersDilemma.publicPage.gameExplanation.dilemmaTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("tests.prisonersDilemma.publicPage.gameExplanation.dilemmaDescription")}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Strategy Task */}
            <Typography variant="h6" gutterBottom>
              {t("tests.prisonersDilemma.publicPage.gameExplanation.strategyTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("tests.prisonersDilemma.publicPage.gameExplanation.strategyDescription")}
            </Typography>

            {Array.isArray(strategyPoints) && (
              <Box component="ul" sx={{ pl: 2.5, mb: 3 }}>
                {strategyPoints.map((point, i) => (
                  <Box component="li" key={i} sx={{ mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {point}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Example Strategies */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: "info.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "info.200",
                mb: 3,
              }}
            >
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                {t("tests.prisonersDilemma.publicPage.gameExplanation.examplesTitle")}
              </Typography>
              {[
                "exampleAlwaysCoop",
                "exampleAlwaysDefect",
                "exampleTitForTat",
                "exampleGrimTrigger",
                "exampleRandom",
              ].map((key) => (
                <Typography key={key} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  • {t(`tests.prisonersDilemma.publicPage.gameExplanation.${key}`)}
                </Typography>
              ))}
            </Box>

            <Typography variant="body2" color="primary" sx={{ mb: 3, fontWeight: 500 }}>
              {t("tests.prisonersDilemma.publicPage.gameExplanation.creativityNote")}
            </Typography>

            {/* Tactic Input */}
            <FormField
              label={t("tests.prisonersDilemma.publicPage.gameExplanation.tacticLabel")}
              value={tactic}
              onChange={setTactic}
              placeholder={t("tests.prisonersDilemma.publicPage.gameExplanation.tacticPlaceholder")}
              multiline
              rows={5}
              required
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmitTactic}
              disabled={!tactic.trim() || submitting}
              sx={{ mt: 2 }}
            >
              {submitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>{t("tests.prisonersDilemma.publicPage.gameExplanation.processing")}</span>
                </Box>
              ) : (
                t("tests.prisonersDilemma.publicPage.gameExplanation.saveButton")
              )}
            </Button>

            {submitting && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block", textAlign: "center" }}
              >
                {t("tests.prisonersDilemma.publicPage.gameExplanation.processingSubtext")}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* ==================== Step 2: Reason Selection ==================== */}
      {step === 2 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t("tests.prisonersDilemma.publicPage.reasons.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t("tests.prisonersDilemma.publicPage.reasons.description")}
            </Typography>

            {loadingReasons ? (
              <Box sx={{ py: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <CircularProgress size={24} />
                  <Typography color="text.secondary">
                    {t("tests.prisonersDilemma.publicPage.reasons.loading")}
                  </Typography>
                </Box>
                {/* Skeleton placeholders */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1 }} />
                ))}
              </Box>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  {t("tests.prisonersDilemma.publicPage.reasons.selectPrompt")}
                </Typography>

                <FormControl component="fieldset" sx={{ width: "100%" }}>
                  <RadioGroup
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  >
                    {reasons.map((reason, i) => (
                      <FormControlLabel
                        key={i}
                        value={reason}
                        control={<Radio />}
                        label={
                          <Typography variant="body2" sx={{ py: 0.5 }}>
                            {reason}
                          </Typography>
                        }
                        sx={{
                          mb: 1,
                          mx: 0,
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: selectedReason === reason ? "primary.main" : "grey.300",
                          bgcolor: selectedReason === reason ? "primary.50" : "transparent",
                          transition: "all 0.2s",
                          "&:hover": { bgcolor: "grey.50" },
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSubmitReason}
                  disabled={!selectedReason || loadingResult}
                  sx={{ mt: 3 }}
                >
                  {loadingResult ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>{t("tests.prisonersDilemma.publicPage.result.loading")}</span>
                    </Box>
                  ) : (
                    t("tests.prisonersDilemma.publicPage.reasons.submitButton")
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ==================== Step 3: Results + Waiting ==================== */}
      {step === 3 && (
        <>
          {/* Job Recommendation */}
          {jobRecommendation && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <MarkdownSection
                  title={t("tests.prisonersDilemma.publicPage.result.jobRecommendation")}
                  content={jobRecommendation}
                />
              </CardContent>
            </Card>
          )}

          {/* Waiting for game */}
          <Card>
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Chip label={t("tests.status.completed")} color="success" sx={{ mb: 3 }} />

              <Typography variant="h5" gutterBottom>
                {t("tests.prisonersDilemma.publicPage.waiting.title", {
                  name: player?.player_name,
                })}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {t("tests.prisonersDilemma.publicPage.waiting.message")}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <CircularProgress size={24} />
                <Typography color="text.secondary">
                  {t("tests.prisonersDilemma.publicPage.waiting.message")}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
                {t("tests.prisonersDilemma.publicPage.waiting.gameMasterNote")}
                <br />
                {t("tests.prisonersDilemma.publicPage.waiting.canClosePage")}
              </Typography>
            </CardContent>
          </Card>
        </>
      )}
    </PageLayout>
  );
}

export default PrisonersDilemmaPublic;
