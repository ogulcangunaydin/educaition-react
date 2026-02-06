/**
 * Session Service
 *
 * API service for game session data.
 */

import api from "./api";

/**
 * Get session data including results and leaderboard
 * @param {number} sessionId - Session ID
 * @returns {Promise<Object>} Session data
 */
export async function getSession(sessionId) {
  const { ok, data, status } = await api.auth.get(`/sessions/${sessionId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

const sessionService = {
  getSession,
};

export default sessionService;
