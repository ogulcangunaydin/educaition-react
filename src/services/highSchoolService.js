/**
 * High School Service
 *
 * API service for high school rooms and students.
 */

import api from "./api";

/**
 * Get all high school rooms
 * @returns {Promise<Array>} List of rooms
 */
export async function getRooms() {
  const { ok, data, status } = await api.auth.get("/high-school-rooms/");

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Create a high school room
 * @param {Object} roomData - Room creation data
 * @param {string} roomData.name - Room name
 * @param {string} roomData.high_school_code - High school code
 * @returns {Promise<Object>} Created room
 */
export async function createRoom(roomData) {
  const formData = new FormData();
  formData.append("name", roomData.name);
  formData.append("high_school_code", roomData.high_school_code);

  const { ok, data, status } = await api.auth.post("/high-school-rooms/", formData);

  if (!ok) {
    throw new Error(data?.detail || `HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get a high school room by ID
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Room data
 */
export async function getRoom(roomId) {
  const { ok, data, status } = await api.auth.get(`/high-school-rooms/${roomId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Delete a high school room
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Deleted room
 */
export async function deleteRoom(roomId) {
  const { ok, data, status } = await api.auth.delete(`/high-school-rooms/${roomId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get students in a high school room
 * @param {number} roomId - Room ID
 * @returns {Promise<Array>} List of students
 */
export async function getStudents(roomId) {
  const { ok, data, status } = await api.auth.get(`/high-school-rooms/${roomId}/students`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

const highSchoolService = {
  getRooms,
  createRoom,
  getRoom,
  deleteRoom,
  getStudents,
};

export default highSchoolService;
