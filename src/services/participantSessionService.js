const STORAGE_KEYS = {
  PLAYER: "player_session_meta",
  DISSONANCE_TEST: "dissonance_test_session_meta",
  PROGRAM_SUGGESTION: "program_suggestion_session_meta",
};

const getStorageKey = (type) => {
  const key = STORAGE_KEYS[type.toUpperCase()];
  if (!key) {
    throw new Error(`Unknown session type: ${type}`);
  }
  return key;
};

export const saveParticipantSession = (type, sessionData) => {
  const key = getStorageKey(type);
  const now = Math.floor(Date.now() / 1000);

  const participantId =
    sessionData.student?.id || sessionData.participant?.id || sessionData.participant_id;
  const roomId =
    sessionData.student?.high_school_room_id ||
    sessionData.participant?.room_id ||
    sessionData.room_id;
  const sessionMeta = {
    participantId,
    roomId,
    expiresAt: now + sessionData.expires_in,
    createdAt: now,
  };

  try {
    localStorage.setItem(key, JSON.stringify(sessionMeta));
  } catch (error) {
    console.error("Failed to save participant session metadata:", error);
  }
};

export const getParticipantSession = (type) => {
  const key = getStorageKey(type);

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const session = JSON.parse(stored);
    const now = Math.floor(Date.now() / 1000);

    if (session.expiresAt && session.expiresAt < now) {
      clearParticipantSession(type);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Failed to get participant session:", error);
    return null;
  }
};

export const getParticipantId = (type) => {
  const session = getParticipantSession(type);
  return session?.participantId || null;
};

export const clearParticipantSession = (type) => {
  const key = getStorageKey(type);
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear participant session:", error);
  }
};

export const hasValidParticipantSession = (type) => {
  const session = getParticipantSession(type);
  return session !== null;
};

export const isSessionExpiringSoon = (type) => {
  const session = getParticipantSession(type);
  if (!session) return false;

  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;

  return session.expiresAt - now < fiveMinutes;
};

export const fetchWithParticipantAuth = async (type, url, options = {}) => {
  const headers = {
    ...options.headers,
  };

  if (options.body && typeof options.body === "object") {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
    body:
      options.body && typeof options.body === "object"
        ? JSON.stringify(options.body)
        : options.body,
  });

  if (response.status === 401) {
    clearParticipantSession(type);
  }

  return response;
};

export const SESSION_TYPES = {
  PLAYER: "player",
  DISSONANCE_TEST: "dissonance_test",
  PROGRAM_SUGGESTION: "program_suggestion",
};

const sessionService = {
  saveParticipantSession,
  getParticipantSession,
  getParticipantId,
  clearParticipantSession,
  hasValidParticipantSession,
  isSessionExpiringSoon,
  fetchWithParticipantAuth,
  SESSION_TYPES,
};

export default sessionService;
