/**
 * Room Service
 *
 * API service for game room and session management.
 */

import api from "./api";

/**
 * Get all rooms
 * @returns {Promise<Array>} List of rooms
 */
export async function getRooms() {
  const { ok, data, status } = await api.auth.get("/rooms");

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get sessions for a room
 * @param {number} roomId - Room ID
 * @returns {Promise<Array>} List of sessions
 */
export async function getRoomSessions(roomId) {
  const { ok, data, status } = await api.auth.get(`/rooms/${roomId}/sessions`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Start a game session (mark room as ready)
 * @param {number} roomId - Room ID
 * @param {number} sessionId - Session ID
 * @returns {Promise<Object>} Session data
 */
export async function startSession(roomId, sessionId) {
  const formData = new FormData();
  formData.append("session_id", sessionId);

  const { ok, data, status } = await api.auth.post(`/rooms/${roomId}/ready`, formData);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

const roomService = {
  getRooms,
  getRoomSessions,
  startSession,
};

export default roomService;
