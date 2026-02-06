import React, { useState, useCallback } from "react";
import { Container, styled, Box } from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";

// Components
import { PageLayout } from "../components/templates";
import { Button, TextField, Alert } from "../components/atoms";
import PrisonersDilemmaInstructions from "../components/organisms/PrisonersDilemmaInstructions";
import { fetchWithParticipantAuth, SESSION_TYPES } from "../services/participantSessionService";
import { SPACING, SHADOWS, COLORS } from "../theme";

/**
 * Styled Components
 */
const FormContainer = styled(Container)({
  marginBottom: SPACING.xl,
  marginTop: SPACING.lg,
});

const FormCard = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.white,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: SHADOWS.md,
  padding: SPACING.xl,
}));

const FormTitle = styled("h3")({
  margin: 0,
  marginBottom: SPACING.md,
  color: COLORS.text.primary,
  fontSize: "1.125rem",
  fontWeight: 600,
});

/**
 * TacticPreparation Page
 *
 * Allows players to prepare and save their game tactics
 * for the Prisoners Dilemma experiment.
 */
const TacticPreparation = () => {
  const [tactic, setTactic] = useState("");
  const [tacticError, setTacticError] = useState("");
  const [loading, setLoading] = useState(false);
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const playerId = location.state?.playerId;

  const handleSaveTactic = useCallback(
    async (event) => {
      event.preventDefault();
      setTacticError("");
      setLoading(true);

      try {
        const updateTacticForm = new FormData();
        updateTacticForm.append("player_tactic", tactic);

        const saveTacticResponse = await fetchWithParticipantAuth(
          SESSION_TYPES.PLAYER,
          `${process.env.REACT_APP_BACKEND_BASE_URL}/players/${playerId}/tactic`,
          {
            method: "POST",
            body: updateTacticForm,
          }
        );

        if (!saveTacticResponse.ok) {
          throw new Error("Failed to save tactic");
        }

        navigate(`/playground/${roomId}`);
      } catch (error) {
        setTacticError("Error saving tactic: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    [tactic, playerId, roomId, navigate]
  );

  const handleTacticChange = useCallback(
    (e) => {
      setTactic(e.target.value);
      if (tacticError) setTacticError("");
    },
    [tacticError]
  );

  return (
    <PageLayout
      title="Tactic Preparation"
      subtitle="Prepare your strategy for the Prisoners Dilemma game"
    >
      {/* Instructions Section */}
      <PrisonersDilemmaInstructions />

      {/* Tactic Form */}
      <FormContainer maxWidth="md">
        <FormCard>
          <FormTitle>Your Strategy</FormTitle>

          {tacticError && (
            <Alert severity="error" sx={{ mb: SPACING.md }}>
              {tacticError}
            </Alert>
          )}

          <form onSubmit={handleSaveTactic}>
            <TextField
              label="Describe Your Tactic"
              value={tactic}
              onChange={handleTacticChange}
              fullWidth
              multiline
              rows={6}
              error={!!tacticError}
              placeholder="Describe your strategy for the game. What approach will you take? How will you respond to different situations?"
              sx={{ mb: SPACING.lg }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                loading={loading}
                disabled={!tactic.trim()}
                startIcon={<SaveIcon />}
              >
                Save My Tactic
              </Button>
            </Box>
          </form>
        </FormCard>
      </FormContainer>
    </PageLayout>
  );
};

export default TacticPreparation;
