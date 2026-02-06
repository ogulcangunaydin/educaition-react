/**
 * Program Suggestion Service
 *
 * API service for program suggestion/debug operations.
 */

import api from "./api";

/**
 * Get debug data for a student's program suggestion
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} Debug data
 */
export async function getStudentDebug(studentId) {
  const { ok, data, status } = await api.auth.get(
    `/program-suggestion/students/${studentId}/debug`
  );

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

const programSuggestionService = {
  getStudentDebug,
};

export default programSuggestionService;
