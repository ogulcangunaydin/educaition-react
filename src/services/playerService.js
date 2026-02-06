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

const playerService = {
  getPlayersByRoom,
  getPlayersByIds,
  deletePlayer,
};

export default playerService;
