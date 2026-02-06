import { useParams, useNavigate, useLocation } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";

import { PageLayout } from "@components/templates";
import { Button, TextField, Alert, Card } from "@components/atoms";
import { Flex } from "@components/atoms/Container";
import PrisonersDilemmaInstructions from "@organisms/PrisonersDilemmaInstructions";
import { useTactic } from "@hooks/prisoners-dilemma";
import { SPACING } from "@theme";

export default function TacticPreparation() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const playerId = location.state?.playerId;

  const { tactic, loading, error, isValid, updateTactic, submitTactic, clearError } =
    useTactic(playerId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submitTactic();
    if (success) {
      navigate(`/playground/${roomId}`);
    }
  };

  const handleTacticChange = (e) => {
    updateTactic(e.target.value);
    if (error) clearError();
  };

  return (
    <PageLayout
      title="Tactic Preparation"
      subtitle="Prepare your strategy for the Prisoners Dilemma game"
    >
      <PrisonersDilemmaInstructions />

      <Card title="Your Strategy" sx={{ maxWidth: 800, mx: "auto", mt: SPACING.lg }}>
        {error && (
          <Alert severity="error" sx={{ mb: SPACING.md }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Describe Your Tactic"
            value={tactic}
            onChange={handleTacticChange}
            fullWidth
            multiline
            rows={6}
            placeholder="What approach will you take? How will you respond to different situations?"
            sx={{ mb: SPACING.lg }}
          />

          <Flex justify="flex-end">
            <Button
              type="submit"
              variant="contained"
              loading={loading}
              disabled={!isValid}
              startIcon={<SaveIcon />}
            >
              Save My Tactic
            </Button>
          </Flex>
        </form>
      </Card>
    </PageLayout>
  );
}
