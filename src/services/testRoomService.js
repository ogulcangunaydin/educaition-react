/**
 * Test Room Service
 *
 * API service for unified test room management.
 * Handles CRUD operations for all test types.
 */

import api from "./api";

/**
 * Test types available in the system
 */
export const TestType = {
  PRISONERS_DILEMMA: "prisoners_dilemma",
  DISSONANCE_TEST: "dissonance_test",
  PROGRAM_SUGGESTION: "program_suggestion",
  PERSONALITY_TEST: "personality_test",
};

/**
 * Test type display configuration
 */
export const TEST_TYPE_CONFIG = {
  [TestType.PRISONERS_DILEMMA]: {
    label: "Mahkum İkilemi",
    labelEn: "Prisoners Dilemma",
    color: "#1976d2",
    icon: "Groups",
  },
  [TestType.DISSONANCE_TEST]: {
    label: "Bilişsel Uyumsuzluk Testi",
    labelEn: "Dissonance Test",
    color: "#9c27b0",
    icon: "Psychology",
  },
  [TestType.PROGRAM_SUGGESTION]: {
    label: "Program Öneri Testi",
    labelEn: "Program Suggestion",
    color: "#ed6c02",
    icon: "School",
  },
  [TestType.PERSONALITY_TEST]: {
    label: "Kişilik Testi",
    labelEn: "Personality Test",
    color: "#2e7d32",
    icon: "Person",
  },
};

/**
 * Create a new test room
 * @param {Object} roomData - Room creation data
 * @param {string} roomData.name - Room name
 * @param {string} roomData.test_type - Test type from TestType enum
 * @param {Object} [roomData.settings] - Optional test-specific settings
 * @returns {Promise<Object>} Created room
 */
export async function createTestRoom(roomData) {
  const { ok, data, status } = await api.auth.post("/test-rooms/", roomData);

  if (!ok) {
    throw new Error(data?.detail || `HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get all test rooms for the current user
 * @param {Object} [options] - Query options
 * @param {string} [options.testType] - Filter by test type
 * @param {number} [options.skip=0] - Pagination offset
 * @param {number} [options.limit=100] - Pagination limit
 * @returns {Promise<Object>} Paginated list of rooms
 */
export async function getTestRooms({ testType, skip = 0, limit = 100 } = {}) {
  const endpoint = testType
    ? `/test-rooms/by-type/${testType}?skip=${skip}&limit=${limit}`
    : `/test-rooms/?skip=${skip}&limit=${limit}`;

  const { ok, data, status } = await api.auth.get(endpoint);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get a single test room by ID
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Room data
 */
export async function getTestRoom(roomId) {
  const { ok, data, status } = await api.auth.get(`/test-rooms/${roomId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get public room info (for anonymous access)
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Public room info
 */
export async function getTestRoomPublic(roomId) {
  const { ok, data, status } = await api.get(`/test-rooms/${roomId}/public`);

  if (!ok) {
    if (status === 404) {
      throw new Error("Room not found or inactive");
    }
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Update a test room
 * @param {number} roomId - Room ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated room
 */
export async function updateTestRoom(roomId, updateData) {
  const { ok, data, status } = await api.auth.put(`/test-rooms/${roomId}`, updateData);

  if (!ok) {
    throw new Error(data?.detail || `HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Delete a test room (soft delete)
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Deleted room
 */
export async function deleteTestRoom(roomId) {
  const { ok, data, status } = await api.auth.delete(`/test-rooms/${roomId}`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Toggle room active status
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Updated room
 */
export async function toggleTestRoomActive(roomId) {
  const { ok, data, status } = await api.auth.post(`/test-rooms/${roomId}/toggle-active`);

  if (!ok) {
    throw new Error(`HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Generate shareable URL for a test room
 * @param {number} roomId - Room ID
 * @param {string} testType - Test type
 * @returns {string} Shareable URL
 */
export function generateRoomUrl(roomId, testType) {
  const baseUrl = window.location.origin;

  switch (testType) {
    case TestType.PRISONERS_DILEMMA:
      return `${baseUrl}/game-room/${roomId}`;
    case TestType.DISSONANCE_TEST:
      return `${baseUrl}/dissonance-test/${roomId}`;
    case TestType.PROGRAM_SUGGESTION:
      return `${baseUrl}/program-test/${roomId}`;
    case TestType.PERSONALITY_TEST:
      return `${baseUrl}/personality-test/${roomId}`;
    default:
      return `${baseUrl}/test-room/${roomId}`;
  }
}

const testRoomService = {
  TestType,
  TEST_TYPE_CONFIG,
  createTestRoom,
  getTestRooms,
  getTestRoom,
  getTestRoomPublic,
  updateTestRoom,
  deleteTestRoom,
  toggleTestRoomActive,
  generateRoomUrl,
};

export default testRoomService;
