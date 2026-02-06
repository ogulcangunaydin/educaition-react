/**
 * useTestRooms Hook
 *
 * Custom hook for managing test rooms with loading states and error handling.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getTestRooms,
  createTestRoom,
  deleteTestRoom,
  toggleTestRoomActive,
  generateRoomUrl,
} from "../services/testRoomService";

/**
 * Hook for managing test rooms
 * @param {Object} options - Hook options
 * @param {string} [options.testType] - Filter by test type
 * @param {boolean} [options.autoFetch=true] - Auto-fetch on mount
 * @returns {Object} Room management state and functions
 */
export function useTestRooms({ testType, autoFetch = true } = {}) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  /**
   * Fetch rooms from API
   */
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTestRooms({ testType });
      setRooms(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch test rooms:", err);
    } finally {
      setLoading(false);
    }
  }, [testType]);

  /**
   * Create a new room
   * @param {Object} roomData - Room data
   * @returns {Promise<Object>} Created room
   */
  const addRoom = useCallback(async (roomData) => {
    setError(null);

    try {
      const newRoom = await createTestRoom(roomData);
      setRooms((prev) => [newRoom, ...prev]);
      setTotal((prev) => prev + 1);
      return newRoom;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Delete a room
   * @param {number} roomId - Room ID
   */
  const removeRoom = useCallback(async (roomId) => {
    setError(null);

    try {
      await deleteTestRoom(roomId);
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Toggle room active status
   * @param {number} roomId - Room ID
   */
  const toggleActive = useCallback(async (roomId) => {
    setError(null);

    try {
      const updatedRoom = await toggleTestRoomActive(roomId);
      setRooms((prev) => prev.map((room) => (room.id === roomId ? updatedRoom : room)));
      return updatedRoom;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Get shareable URL for a room
   * @param {Object} room - Room object
   * @returns {string} Shareable URL
   */
  const getRoomUrl = useCallback((room) => {
    return generateRoomUrl(room.id, room.test_type);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchRooms();
    }
  }, [autoFetch, fetchRooms]);

  return {
    rooms,
    loading,
    error,
    total,
    fetchRooms,
    addRoom,
    removeRoom,
    toggleActive,
    getRoomUrl,
  };
}

export default useTestRooms;
