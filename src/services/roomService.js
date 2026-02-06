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

/**
 * Create a new room
 * @param {string} name - Room name
 * @returns {Promise<Object>} Created room
 */
export async function createRoom(name) {
  const formData = new FormData();
  formData.append("name", name);

  const { ok, data, status } = await api.auth.post("/rooms", formData);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Delete a room
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Deleted room
 */
export async function deleteRoom(roomId) {
  const { ok, data, status } = await api.auth.post(`/rooms/delete/${roomId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Start a session with a name (mark room as ready)
 * @param {number} roomId - Room ID
 * @param {string} sessionName - Session name
 * @returns {Promise<Object>} Session data with error info if not all players ready
 */
export async function startSessionWithName(roomId, sessionName) {
  const formData = new FormData();
  formData.append("name", sessionName);

  const { ok, data, status } = await api.auth.post(`/rooms/${roomId}/ready`, formData);

  if (!ok && status === 400) {
    // Return error details for handling (e.g., "All players are not ready")
    return { ok: false, error: data.detail || "Failed to start session" };
  }

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return { ok: true, data };
}

const roomService = {
  getRooms,
  getRoomSessions,
  startSession,
  createRoom,
  deleteRoom,
  startSessionWithName,
};

export default roomService;
