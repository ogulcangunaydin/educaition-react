/**
 * User Service
 *
 * API service for user management (admin only).
 */

import api from "./api";

/**
 * Get all users
 * @param {Object} options - Query options
 * @param {number} options.skip - Pagination offset
 * @param {number} options.limit - Pagination limit
 * @returns {Promise<Array>} List of users
 */
export async function getUsers({ skip = 0, limit = 100 } = {}) {
  const { ok, data, status } = await api.auth.get(`/users/?skip=${skip}&limit=${limit}`);

  if (!ok) {
    throw new Error(data?.detail || `HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Get a single user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User data
 */
export async function getUser(userId) {
  const { ok, data, status } = await api.auth.get(`/users/${userId}`);

  if (!ok) {
    throw new Error(data?.detail || `HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Create a new user
 * @param {Object} userData - User creation data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.password - Password
 * @param {string} userData.role - User role
 * @param {string} userData.university - University key
 * @returns {Promise<Object>} Created user
 */
export async function createUser(userData) {
  const formData = new FormData();
  formData.append("username", userData.username);
  formData.append("email", userData.email);
  formData.append("password", userData.password);
  formData.append("role", userData.role || "student");
  formData.append("university", userData.university || "halic");

  const { ok, data, status } = await api.auth.post("/users/", formData);

  if (!ok) {
    throw new Error(data?.detail || `HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Update a user
 * @param {number} userId - User ID
 * @param {Object} userData - User update data
 * @returns {Promise<Object>} Updated user
 */
export async function updateUser(userId, userData) {
  const formData = new FormData();
  formData.append("username", userData.username);
  formData.append("email", userData.email);
  if (userData.password) {
    formData.append("password", userData.password);
  }
  if (userData.role) {
    formData.append("role", userData.role);
  }
  if (userData.university) {
    formData.append("university", userData.university);
  }

  const { ok, data, status } = await api.auth.put(`/users/${userId}`, formData);

  if (!ok) {
    throw new Error(data?.detail || `HTTP error! status: ${status}`);
  }

  return data;
}

/**
 * Delete a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Deleted user
 */
export async function deleteUser(userId) {
  const { ok, data, status } = await api.auth.delete(`/users/${userId}`);

  if (!ok) {
    throw new Error(data?.detail || `HTTP error! status: ${status}`);
  }

  return data;
}

const userService = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};

export default userService;
