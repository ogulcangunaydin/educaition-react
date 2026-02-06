/**
 * useDeviceTracking Hook
 *
 * Provides device-based test completion tracking functionality.
 * Used to prevent anonymous users from retaking tests.
 */

import { useState, useCallback, useEffect } from "react";
import api from "@services/api";

const DEVICE_ID_KEY = "educaition_device_id";
const COMPLETED_TESTS_KEY = "educaition_completed_tests";

/**
 * Generate or retrieve a device ID
 */
export const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    // Generate a proper UUID v4 format
    deviceId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

/**
 * Get locally stored completed tests
 */
const getCompletedTestsFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_TESTS_KEY) || "{}");
  } catch {
    return {};
  }
};

/**
 * Save test completion to local storage
 */
const saveCompletedTestLocally = (testType, roomId) => {
  const completed = getCompletedTestsFromStorage();
  if (!completed[testType]) completed[testType] = [];
  const roomKey = roomId ? String(roomId) : "global";
  if (!completed[testType].includes(roomKey)) {
    completed[testType].push(roomKey);
    localStorage.setItem(COMPLETED_TESTS_KEY, JSON.stringify(completed));
  }
};

/**
 * Check if test is completed in local storage
 */
const hasCompletedTestLocally = (testType, roomId) => {
  const completed = getCompletedTestsFromStorage();
  const roomKey = roomId ? String(roomId) : "global";
  return completed[testType]?.includes(roomKey) || false;
};

/**
 * Check completion status from backend
 */
const checkCompletionFromBackend = async (deviceId, testType, roomId) => {
  try {
    const response = await api.deviceTracking.checkCompletion(deviceId, testType, roomId);
    if (response.ok) {
      return response.data.has_completed;
    }
    return false;
  } catch (error) {
    console.error("Failed to check completion from backend:", error);
    return false;
  }
};

/**
 * Mark test completion in backend
 */
const markCompletionInBackend = async (deviceId, testType, roomId) => {
  try {
    await api.deviceTracking.markCompletion(deviceId, testType, roomId);
    return true;
  } catch (error) {
    console.error("Failed to mark completion in backend:", error);
    return false;
  }
};

/**
 * Hook for device-based test completion tracking
 *
 * @param {string} testType - The type of test (from TEST_TYPES)
 * @param {string|number} roomId - Optional room ID
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoCheck - Automatically check completion on mount (default: true)
 * @param {boolean} options.skipForAuth - Skip tracking for authenticated users (default: false)
 *
 * @returns {Object} Device tracking state and methods
 */
export function useDeviceTracking(testType, roomId = null, options = {}) {
  const { autoCheck = true, skipForAuth = false } = options;

  const [deviceId] = useState(() => getOrCreateDeviceId());
  const [hasCompleted, setHasCompleted] = useState(null);
  const [isChecking, setIsChecking] = useState(autoCheck);
  const [error, setError] = useState(null);

  /**
   * Check if the device has completed this test
   */
  const checkCompletion = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      // Quick local check first
      if (hasCompletedTestLocally(testType, roomId)) {
        setHasCompleted(true);
        setIsChecking(false);
        return true;
      }

      // Check backend (user might have cleared localStorage)
      const backendCompleted = await checkCompletionFromBackend(deviceId, testType, roomId);

      if (backendCompleted) {
        // Sync to localStorage
        saveCompletedTestLocally(testType, roomId);
        setHasCompleted(true);
      } else {
        setHasCompleted(false);
      }

      setIsChecking(false);
      return backendCompleted;
    } catch (err) {
      setError(err.message);
      setIsChecking(false);
      return false;
    }
  }, [deviceId, testType, roomId]);

  /**
   * Mark the test as completed
   */
  const markCompleted = useCallback(async () => {
    setError(null);

    // Save locally first (fast)
    saveCompletedTestLocally(testType, roomId);
    setHasCompleted(true);

    // Then persist to backend (secure)
    const success = await markCompletionInBackend(deviceId, testType, roomId);
    if (!success) {
      setError("Failed to sync completion to server");
    }

    return success;
  }, [deviceId, testType, roomId]);

  /**
   * Clear local completion (for testing purposes)
   */
  const clearLocalCompletion = useCallback(() => {
    const completed = getCompletedTestsFromStorage();
    const roomKey = roomId ? String(roomId) : "global";

    if (completed[testType]) {
      completed[testType] = completed[testType].filter((key) => key !== roomKey);
      localStorage.setItem(COMPLETED_TESTS_KEY, JSON.stringify(completed));
    }

    setHasCompleted(false);
  }, [testType, roomId]);

  // Auto-check on mount if enabled
  useEffect(() => {
    if (autoCheck && !skipForAuth) {
      checkCompletion();
    }
  }, [autoCheck, skipForAuth, checkCompletion]);

  return {
    deviceId,
    hasCompleted,
    isChecking,
    error,
    checkCompletion,
    markCompleted,
    clearLocalCompletion,
  };
}

export default useDeviceTracking;
