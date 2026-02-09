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

/**
 * Get student by ID
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} Student data
 */
export async function getStudent(studentId) {
  const { ok, data, status } = await api.get(`/program-suggestion/students/${studentId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get student result
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} Student result
 */
export async function getStudentResult(studentId) {
  const { ok, data, status } = await api.get(`/program-suggestion/students/${studentId}/result`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Create a new student
 * @param {number} roomId - Test room ID
 * @returns {Promise<Object>} Created student with session token
 */
export async function createStudent(roomId) {
  const { ok, data, status } = await api.post("/program-suggestion/students/", {
    test_room_id: parseInt(roomId),
  });

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Update student step 1 (personal info)
 * @param {number} studentId - Student ID
 * @param {Object} stepData - Step 1 data
 * @returns {Promise<Object>} Updated student
 */
export async function updateStep1(studentId, stepData) {
  const { ok, data, status } = await api.post(
    `/program-suggestion/students/${studentId}/step1`,
    stepData
  );

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Update student step 2 (education info)
 * @param {number} studentId - Student ID
 * @param {Object} stepData - Step 2 data
 * @returns {Promise<Object>} Updated student
 */
export async function updateStep2(studentId, stepData) {
  const { ok, data, status } = await api.post(
    `/program-suggestion/students/${studentId}/step2`,
    stepData
  );

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Update student step 3 (score expectations)
 * @param {number} studentId - Student ID
 * @param {Object} stepData - Step 3 data
 * @returns {Promise<Object>} Updated student
 */
export async function updateStep3(studentId, stepData) {
  const { ok, data, status } = await api.post(
    `/program-suggestion/students/${studentId}/step3`,
    stepData
  );

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Update student step 4 (preferences)
 * @param {number} studentId - Student ID
 * @param {Object} stepData - Step 4 data
 * @returns {Promise<Object>} Updated student
 */
export async function updateStep4(studentId, stepData) {
  const { ok, data, status } = await api.post(
    `/program-suggestion/students/${studentId}/step4`,
    stepData
  );

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Submit RIASEC answers
 * @param {number} studentId - Student ID
 * @param {Object} riasecData - RIASEC answers
 * @returns {Promise<Object>} Result
 */
export async function submitRiasec(studentId, riasecData) {
  const { ok, data, status } = await api.post(
    `/program-suggestion/students/${studentId}/riasec`,
    riasecData
  );

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get participants (students) in a room
 * @param {number} roomId - Test room ID
 * @returns {Promise<Array>} List of students
 */
export async function getParticipants(roomId) {
  const { ok, data, status } = await api.auth.get(
    `/program-suggestion/rooms/${roomId}/participants`
  );

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Delete a student
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} Deleted student
 */
export async function deleteStudent(studentId) {
  const { ok, data, status } = await api.auth.delete(`/program-suggestion/students/${studentId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get platform-wide average RIASEC scores
 * @returns {Promise<Object>} { averages: {R, I, A, S, E, C}, sample_size: number }
 */
export async function getRiasecAverages() {
  const { ok, data, status } = await api.get("/program-suggestion/students/riasec-averages");

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

const programSuggestionService = {
  getStudentDebug,
  getStudent,
  getStudentResult,
  createStudent,
  updateStep1,
  updateStep2,
  updateStep3,
  updateStep4,
  submitRiasec,
  getParticipants,
  deleteStudent,
  getRiasecAverages,
};

export default programSuggestionService;
