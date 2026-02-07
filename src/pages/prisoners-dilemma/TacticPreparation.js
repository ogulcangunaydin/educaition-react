import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      title={t("tests.prisonersDilemma.tacticPage.title")}
      subtitle={t("tests.prisonersDilemma.tacticPage.subtitle")}
    >
      <PrisonersDilemmaInstructions />

      <Card
        title={t("tests.prisonersDilemma.tacticPage.yourStrategy")}
        sx={{ maxWidth: 800, mx: "auto", mt: SPACING.lg }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: SPACING.md }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label={t("tests.prisonersDilemma.tacticPage.describeTactic")}
            value={tactic}
            onChange={handleTacticChange}
            fullWidth
            multiline
            rows={6}
            placeholder={t("tests.prisonersDilemma.tacticPage.tacticPlaceholder")}
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
              {t("tests.prisonersDilemma.tacticPage.saveTactic")}
            </Button>
          </Flex>
        </form>
      </Card>
    </PageLayout>
  );
}
