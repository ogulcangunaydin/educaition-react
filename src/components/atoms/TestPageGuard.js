import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@contexts/AuthContext";
import { Button } from "@components/atoms";
import api from "@services/api";

const DEVICE_ID_KEY = "educaition_device_id";
const COMPLETED_TESTS_KEY = "educaition_completed_tests";

const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
      );
    }
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

const getCompletedTests = () => {
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_TESTS_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveCompletedTestLocally = (testType, roomId) => {
  const completed = getCompletedTests();
  if (!completed[testType]) completed[testType] = [];
  const roomKey = roomId || "global";
  if (!completed[testType].includes(roomKey)) {
    completed[testType].push(roomKey);
    localStorage.setItem(COMPLETED_TESTS_KEY, JSON.stringify(completed));
  }
};

const hasCompletedTestLocally = (testType, roomId) => {
  const completed = getCompletedTests();
  const roomKey = roomId || "global";
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
 * Mark test as completed in both localStorage and backend
 */
const markTestCompleted = async (testType, roomId) => {
  const deviceId = getOrCreateDeviceId();

  // Save locally first (fast)
  saveCompletedTestLocally(testType, roomId);

  // Then persist to backend (secure)
  try {
    await api.deviceTracking.markCompletion(deviceId, testType, roomId);
  } catch (error) {
    console.error("Failed to mark completion in backend:", error);
    // Local storage is already updated, so the user is still blocked locally
  }
};

/**
 * Check if test has been completed (both local and backend)
 */
const hasCompletedTest = async (testType, roomId) => {
  const deviceId = getOrCreateDeviceId();

  // Quick local check first
  if (hasCompletedTestLocally(testType, roomId)) {
    return true;
  }

  // If not found locally, check backend (user might have cleared localStorage)
  const backendCompleted = await checkCompletionFromBackend(deviceId, testType, roomId);

  // If backend says completed, sync to localStorage
  if (backendCompleted) {
    saveCompletedTestLocally(testType, roomId);
  }

  return backendCompleted;
};

export default function TestPageGuard({ children, testType = "generic" }) {
  const { roomId } = useParams();
  const { isAuthenticated, isTeacherOrAdmin, isLoading } = useAuth();
  const [canAccess, setCanAccess] = useState(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const checkAccess = useCallback(async () => {
    // Teachers and admins can always access (for testing purposes)
    if (isAuthenticated && isTeacherOrAdmin) {
      setCanAccess(true);
      setAlreadyCompleted(false);
      return;
    }

    // For anonymous users, check if they've already completed the test
    const completed = await hasCompletedTest(testType, roomId);

    if (completed) {
      setCanAccess(false);
      setAlreadyCompleted(true);
    } else {
      setCanAccess(true);
      setAlreadyCompleted(false);
    }
  }, [isAuthenticated, isTeacherOrAdmin, testType, roomId]);

  useEffect(() => {
    if (isLoading) return;
    checkAccess();
  }, [isLoading, checkAccess]);

  if (isLoading || canAccess === null) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!canAccess && alreadyCompleted) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 3,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Test Already Completed
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          You have already completed this test on this device. Each participant can only complete
          the test once.
        </Typography>
        <Button variant="outlined" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  return children;
}

export { markTestCompleted, hasCompletedTest, getOrCreateDeviceId };
