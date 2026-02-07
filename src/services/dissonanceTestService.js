/**
 * Dissonance Test Service
 *
 * API service for dissonance test participants.
 */

import api from "./api";

/**
 * Get all dissonance test participants (legacy, returns all for current user)
 * @returns {Promise<Array>} List of participants
 */
export async function getParticipants() {
  const { ok, data, status } = await api.auth.get("/dissonance_test_participants");

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get participants in a dissonance test room
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Paginated list with { items, total }
 */
export async function getRoomParticipants(roomId) {
  const { ok, data, status } = await api.auth.get(`/dissonance_test_participants/rooms/${roomId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Delete a dissonance test participant (soft delete).
 * After deletion the student's device can retake the test.
 * @param {number} participantId - Participant ID
 * @returns {Promise<Object>} Deleted participant data
 */
export async function deleteParticipant(participantId) {
  const { ok, data, status } = await api.auth.delete(
    `/dissonance_test_participants/participants/${participantId}`
  );

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get a single participant by ID
 * @param {number} participantId - Participant ID
 * @returns {Promise<Object>} Participant data
 */
export async function getParticipant(participantId) {
  const { ok, data, status } = await api.get(`/dissonance_test_participants/${participantId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Create a new dissonance test participant
 * @param {Object} participantData - Participant form data
 * @returns {Promise<Object>} Created participant with token info
 */
export async function createParticipant(participantData) {
  const formData = new FormData();
  Object.entries(participantData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const { ok, data, status } = await api.post("/dissonance_test_participants", formData);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Update participant answers
 * @param {number} participantId - Participant ID
 * @param {Object} answers - Answer data
 * @returns {Promise<Object>} Updated participant
 */
export async function updateParticipantAnswers(participantId, answers) {
  const formData = new FormData();
  Object.entries(answers).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const { ok, data, status } = await api.post(
    `/dissonance_test_participants/${participantId}`,
    formData
  );

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Save personality test answers for a participant
 * @param {number} participantId - Participant ID
 * @param {Array} answers - Array of personality answers
 * @returns {Promise<Object>} Result
 */
export async function saveParticipantPersonality(participantId, answers) {
  const formData = new FormData();
  formData.append("answers", JSON.stringify(answers));

  const { ok, data, status } = await api.post(
    `/dissonance_test_participants/${participantId}/personality`,
    formData
  );

  if (!ok) {
    throw new Error(`Failed to save personality: ${status}`);
  }

  return data;
}

const dissonanceTestService = {
  getParticipants,
  getRoomParticipants,
  getParticipant,
  createParticipant,
  updateParticipantAnswers,
  saveParticipantPersonality,
  deleteParticipant,
};

export default dissonanceTestService;
