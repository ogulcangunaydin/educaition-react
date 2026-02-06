/**
 * Personality Test Service
 *
 * API service for personality test rooms and participants.
 */

import api from "./api";

/**
 * Get participants in a personality test room
 * @param {number} roomId - Room ID
 * @returns {Promise<Array>} List of participants
 */
export async function getParticipants(roomId) {
  const { ok, data, status } = await api.auth.get(`/personality-test/rooms/${roomId}/participants`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get statistics for a personality test room
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Room statistics
 */
export async function getRoomStatistics(roomId) {
  const { ok, data, status } = await api.auth.get(`/personality-test/rooms/${roomId}/statistics`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

const personalityTestService = {
  getParticipants,
  getRoomStatistics,
};

export default personalityTestService;
