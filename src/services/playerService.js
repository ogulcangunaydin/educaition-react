/**
 * Player Service
 *
 * API service for game player/participant operations.
 */

import api from "./api";

/**
 * Get players in a room
 * @param {number} roomId - Room ID
 * @returns {Promise<Array>} List of players
 */
export async function getPlayersByRoom(roomId) {
  const { ok, data, status } = await api.auth.get(`/players/room/${roomId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get players by IDs
 * @param {string} playerIds - Comma-separated player IDs
 * @returns {Promise<Array>} List of players
 */
export async function getPlayersByIds(playerIds) {
  const { ok, data, status } = await api.auth.get(`/players/${playerIds}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Soft delete a player
 * @param {number} participantId - Participant ID
 * @returns {Promise<Object>} Deleted player data
 */
export async function deletePlayer(participantId) {
  const { ok, data, status } = await api.auth.post(`/players/delete/${participantId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Create a new player in a room
 * @param {string} playerName - Player name
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Created player data with token info
 */
export async function createPlayer(playerName, roomId) {
  const formData = new FormData();
  formData.append("player_name", playerName);
  formData.append("room_id", roomId);

  const { ok, data, status } = await api.post("/players", formData);

  if (!ok) {
    if (status === 400 || status === 409) {
      throw new Error("Player Name is already taken. Please choose a different name.");
    }
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Save personality test answers for a player
 * @param {number} playerId - Player ID
 * @param {Array} answers - Array of personality answers
 * @returns {Promise<Object>} Result
 */
export async function savePlayerPersonality(playerId, answers) {
  const formData = new FormData();
  formData.append("answers", JSON.stringify(answers));

  const { ok, data, status } = await api.post(`/players/${playerId}/personality`, formData);

  if (!ok) {
    throw new Error(`Failed to save personality: ${status}`);
  }

  return data;
}

/**
 * Save tactic for a player
 * @param {number} playerId - Player ID
 * @param {string} tactic - Player tactic text
 * @returns {Promise<Object>} Result
 */
export async function savePlayerTactic(playerId, tactic) {
  const formData = new FormData();
  formData.append("player_tactic", tactic);

  const { ok, data, status } = await api.post(`/players/${playerId}/tactic`, formData);

  if (!ok) {
    throw new Error(`Failed to save tactic: ${status}`);
  }

  return data;
}

const playerService = {
  getPlayersByRoom,
  getPlayersByIds,
  deletePlayer,
  createPlayer,
  savePlayerPersonality,
  savePlayerTactic,
};

export default playerService;
