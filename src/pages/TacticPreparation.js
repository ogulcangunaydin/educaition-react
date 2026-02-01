import React, { useState } from "react";
import { TextField, Button, Container } from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import PrisonersDilemmaInstructions from "../components/PrisonersDilemmaInstructions";
import { fetchWithParticipantAuth, SESSION_TYPES } from "../services/participantSessionService";

const TacticPreparation = () => {
  const [tactic, setTactic] = useState("");
  const [tacticError, setTacticError] = useState(""); // Step 1: Add state for tactic error message
  const { roomId } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const playerId = location.state.playerId;

  const handleSaveTactic = async (event) => {
    event.preventDefault();
    setTacticError(""); // Reset tactic error message

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
        throw new Error("Failed to save tactic"); // This error is now caught below
      }

      navigate(`/playground/${roomId}`);
      console.log("Tactic saved successfully");
    } catch (error) {
      setTacticError("Error saving tactic: " + error.message);
    }
  };

  return (
    <>
      <Header title={"Tactic Preparation"} />
      <PrisonersDilemmaInstructions />
      <Container style={{ marginBottom: "50px" }}>
        <form onSubmit={handleSaveTactic}>
          <TextField
            label="Tactic"
            value={tactic}
            onChange={(e) => {
              setTactic(e.target.value);
              if (tacticError) setTacticError(""); // Step 2: Reset tactic error if it exists
            }}
            margin="normal"
            fullWidth
            multiline
            rows={4}
            error={!!tacticError} // Step 4: Use error prop
            helperText={tacticError} // Step 4: Use helperText prop for error message
          />
          <Button type="submit" variant="contained" color="primary">
            Save My Tactic
          </Button>
        </form>
      </Container>
    </>
  );
};

export default TacticPreparation;
