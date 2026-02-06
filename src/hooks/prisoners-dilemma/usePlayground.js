import { useState, useCallback, useEffect } from "react";
import api from "@services/api";

export default function usePlayground(roomId) {
  const [participants, setParticipants] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [blurText, setBlurText] = useState(true);

  const fetchParticipants = useCallback(async () => {
    try {
      const response = await api.get(`/players/room/${roomId}`);
      if (response.ok) {
        setParticipants(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    }
  }, [roomId]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.auth.get("/auth");
      if (response.ok) {
        setIsAuthenticated(true);
        const sessionsResponse = await api.auth.get(`/rooms/${roomId}/sessions`);
        if (sessionsResponse.ok) {
          setSessions(sessionsResponse.data || []);
        }
      }
    } catch (err) {
      setIsAuthenticated(false);
    }
  }, [roomId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchParticipants(), checkAuth()]);
      setLoading(false);
    };
    init();
  }, [fetchParticipants, checkAuth]);

  const deleteParticipant = useCallback(async (participantId) => {
    const response = await api.auth.post(`/players/delete/${participantId}`);
    if (response.ok) {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      return true;
    }
    return false;
  }, []);

  const createSession = useCallback(
    async (sessionName) => {
      const formBody = new FormData();
      formBody.append("name", sessionName);

      const response = await api.auth.post(`/rooms/${roomId}/ready`, formBody);

      if (response.ok) {
        setSessions((prev) => [...prev, response.data]);
        return { success: true, session: response.data };
      }

      if (response.data?.detail === "All players are not ready") {
        return { success: false, error: response.data.detail, notReady: true };
      }

      return { success: false, error: response.data?.detail || "Failed to create session" };
    },
    [roomId]
  );

  const deleteNotReadyPlayers = useCallback(async () => {
    const notReady = participants.filter((p) => !p.player_tactic);
    for (const player of notReady) {
      await api.auth.post(`/players/delete/${player.id}`);
    }
    setParticipants((prev) => prev.filter((p) => p.player_tactic));
  }, [participants]);

  const toggleBlur = useCallback(() => setBlurText((prev) => !prev), []);
  const openQR = useCallback(() => setShowQR(true), []);
  const closeQR = useCallback(() => setShowQR(false), []);

  const qrUrl = `${process.env.REACT_APP_FRONTEND_BASE_URL}/personalitytest/room/${roomId}`;

  return {
    participants,
    sessions,
    isAuthenticated,
    loading,
    showQR,
    blurText,
    qrUrl,
    deleteParticipant,
    deleteNotReadyPlayers,
    createSession,
    toggleBlur,
    openQR,
    closeQR,
    refetch: fetchParticipants,
  };
}
