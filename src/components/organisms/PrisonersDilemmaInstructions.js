import React from "react";
import { useTranslation } from "react-i18next";
import { Typography, Container } from "@mui/material";

const PrisonersDilemmaInstructions = () => {
  const { t } = useTranslation();
  const k = (key) => t(`tests.prisonersDilemma.instructions.${key}`);

  return (
    <Container style={{ marginTop: "100px" }}>
      <Typography variant="h4" gutterBottom>
        {k("welcomeTitle")}
      </Typography>

      <Typography variant="body1" paragraph>
        {k("intro")}
      </Typography>

      <Typography variant="h6" gutterBottom>
        {k("choicesTitle")}
      </Typography>
      <Typography variant="body1" paragraph>
        <strong>1. {t("tests.prisonersDilemma.cooperate")}</strong>: {k("cooperateDesc")}
      </Typography>
      <Typography variant="body1" paragraph>
        <strong>2. {t("tests.prisonersDilemma.defect")}</strong>: {k("defectDesc")}
      </Typography>

      <Typography variant="h6" gutterBottom>
        {k("scoringTitle")}
      </Typography>
      <Typography variant="body1" paragraph>
        {k("scoringIntro")}
      </Typography>
      <Typography variant="body1" paragraph>
        <ul>
          <li>
            <strong>{k("bothCooperate")}</strong>
          </li>
          <li>
            <strong>{k("youCooperateTheyDefect")}</strong>
          </li>
          <li>
            <strong>{k("youDefectTheyCooperate")}</strong>
          </li>
          <li>
            <strong>{k("bothDefect")}</strong>
          </li>
        </ul>
      </Typography>
      <Typography variant="body1" paragraph>
        {k("scoringGoal")}
      </Typography>

      <Typography variant="h6" gutterBottom>
        {k("taskTitle")}
      </Typography>
      <Typography variant="body1" paragraph>
        {k("taskDesc")}
      </Typography>

      <Typography variant="h6" gutterBottom>
        {k("howToDescribeTitle")}
      </Typography>
      <Typography variant="body1" paragraph>
        <strong>1. </strong>
        {k("beSpecific")}
      </Typography>
      <Typography variant="body1" paragraph>
        <strong>2. {k("considerScenarios")}</strong>
      </Typography>
      <Typography variant="body1" paragraph>
        - {k("scenario1")}
      </Typography>
      <Typography variant="body1" paragraph>
        - {k("scenario2")}
      </Typography>
      <Typography variant="body1" paragraph>
        - {k("scenario3")}
      </Typography>
      <Typography variant="body1" paragraph>
        - {k("scenario4")}
      </Typography>

      <Typography variant="body1" paragraph>
        <strong>3. </strong>
        {k("thinkPatterns")}
      </Typography>

      <Typography variant="h6" gutterBottom>
        {k("examplesTitle")}
      </Typography>
      <Typography variant="body1" paragraph>
        <strong>{k("alwaysCooperate")}</strong>
      </Typography>
      <Typography variant="body1" paragraph>
        <strong>{k("alwaysDefect")}</strong>
      </Typography>
      <Typography variant="body1" paragraph>
        <strong>{k("titForTat")}</strong>
      </Typography>
      <Typography variant="body1" paragraph>
        <strong>{k("grimTrigger")}</strong>
      </Typography>

      <Typography variant="h6" gutterBottom>
        {k("yourTacticTitle")}
      </Typography>
      <Typography variant="body1" paragraph>
        {k("yourTacticDesc")}
      </Typography>

      <Typography variant="h6" gutterBottom>
        {k("leaderboardTitle")}
      </Typography>
      <Typography variant="body1" paragraph>
        {k("leaderboardDesc")}
      </Typography>

      <Typography variant="body1" paragraph>
        {k("questions")}
      </Typography>
    </Container>
  );
};

export default PrisonersDilemmaInstructions;
