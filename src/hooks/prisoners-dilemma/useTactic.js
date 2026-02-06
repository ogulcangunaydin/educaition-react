import { useState, useCallback } from "react";
import api, { AUTH_TYPES } from "@services/api";

export default function useTactic(playerId) {
  const [tactic, setTactic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateTactic = useCallback((value) => {
    setTactic(value);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitTactic = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const formBody = new FormData();
      formBody.append("player_tactic", tactic);

      const response = await api
        .participant(AUTH_TYPES.PLAYER)
        .post(`/players/${playerId}/tactic`, formBody);

      if (response.ok) {
        return true;
      }

      setError("Failed to save tactic");
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [tactic, playerId]);

  const isValid = tactic.trim().length > 0;

  return {
    tactic,
    loading,
    error,
    isValid,
    updateTactic,
    submitTactic,
    clearError,
  };
}
