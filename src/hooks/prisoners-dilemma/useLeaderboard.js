import { useState, useCallback, useEffect } from "react";
import api from "@services/api";

const isJsonString = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export default function useLeaderboard(sessionId) {
  const [sessionName, setSessionName] = useState("");
  const [sessionStatus, setSessionStatus] = useState("");
  const [scores, setScores] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.auth.get(`/sessions/${sessionId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch session");
      }

      const data = response.data;
      setSessionName(data.name);
      setSessionStatus(data.status);

      if (data.status === "finished") {
        const results =
          typeof data.results === "string" && isJsonString(data.results)
            ? JSON.parse(data.results)
            : data.results;

        const leaderboardArray = Object.entries(results.leaderboard).map(
          ([player, { score, short_tactic }]) => ({ player, score, short_tactic })
        );
        setScores(leaderboardArray);
        setMatrix(results.matrix);

        const participantsResponse = await api.auth.get(`/players/${data.player_ids}`);
        if (participantsResponse.ok) {
          setParticipants(participantsResponse.data);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Poll every 3 seconds while the game is still in progress
  useEffect(() => {
    if (loading || sessionStatus === "finished") return;

    const interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, [loading, sessionStatus, fetchSession]);

  const isFinished = sessionStatus === "finished";
  const progress = Number(sessionStatus) || 0;
  const playerNames = Object.keys(matrix);

  return {
    sessionName,
    sessionStatus,
    scores,
    matrix,
    participants,
    loading,
    error,
    isFinished,
    progress,
    playerNames,
    refetch: fetchSession,
  };
}
