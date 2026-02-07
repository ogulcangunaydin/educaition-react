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

/**
 * Delete a personality test participant (soft delete).
 * After deletion the student's device can retake the test.
 * @param {number} participantId - Participant ID
 * @returns {Promise<Object>} Deleted participant data
 */
export async function deleteParticipant(participantId) {
  const { ok, data, status } = await api.auth.delete(
    `/personality-test/participants/${participantId}`
  );

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

const personalityTestService = {
  getParticipants,
  getRoomStatistics,
  deleteParticipant,
};

export default personalityTestService;
