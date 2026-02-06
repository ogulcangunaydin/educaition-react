/**
 * Dissonance Test Service
 *
 * API service for dissonance test participants.
 */

import api from "./api";

/**
 * Get all dissonance test participants
 * @returns {Promise<Array>} List of participants
 */
export async function getParticipants() {
  const { ok, data, status } = await api.auth.get("/dissonance_test_participants");

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

const dissonanceTestService = {
  getParticipants,
};

export default dissonanceTestService;
