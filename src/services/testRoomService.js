/**
 * Test Room Service
 *
 * API service for unified test room management.
 * Handles CRUD operations for all test types.
 */

import fetchWithAuth from "../utils/fetchWithAuth";

const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

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
  const response = await fetchWithAuth(`${BASE_URL}/test-rooms/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
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
  let url = `${BASE_URL}/test-rooms/?skip=${skip}&limit=${limit}`;

  if (testType) {
    url = `${BASE_URL}/test-rooms/by-type/${testType}?skip=${skip}&limit=${limit}`;
  }

  const response = await fetchWithAuth(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get a single test room by ID
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Room data
 */
export async function getTestRoom(roomId) {
  const response = await fetchWithAuth(`${BASE_URL}/test-rooms/${roomId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get public room info (for anonymous access)
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Public room info
 */
export async function getTestRoomPublic(roomId) {
  const response = await fetch(`${BASE_URL}/test-rooms/${roomId}/public`, {
    method: "GET",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Room not found or inactive");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Update a test room
 * @param {number} roomId - Room ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated room
 */
export async function updateTestRoom(roomId, updateData) {
  const response = await fetchWithAuth(`${BASE_URL}/test-rooms/${roomId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Delete a test room (soft delete)
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Deleted room
 */
export async function deleteTestRoom(roomId) {
  const response = await fetchWithAuth(`${BASE_URL}/test-rooms/${roomId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Toggle room active status
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} Updated room
 */
export async function toggleTestRoomActive(roomId) {
  const response = await fetchWithAuth(`${BASE_URL}/test-rooms/${roomId}/toggle-active`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
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
