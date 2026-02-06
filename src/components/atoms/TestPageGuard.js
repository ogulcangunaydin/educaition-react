/**
 * TestPageGuard
 *
 * Controls access to public test pages based on user role and test completion.
 *
 * Flow:
 * 1. If the user is an authenticated admin or teacher → always allow (unlimited retakes)
 * 2. If the user is an authenticated viewer → block (viewers cannot take tests)
 * 3. If the user is an authenticated student → check if they completed this test type;
 *    if completed → block, otherwise → allow
 * 4. If the user is not authenticated → auto-create a student account via device
 *    fingerprint (device-login), then follow the student flow above
 *
 * This means every anonymous test-taker gets a real user row in the `users` table
 * (role=student, username=device_{fingerprint}), so all participant records are
 * linked via foreign keys and we can track a student across different tests.
 */

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@contexts/AuthContext";
import { Button } from "@components/atoms";
import api from "@services/api";
import { getDeviceFingerprint } from "@utils/deviceFingerprint";

export default function TestPageGuard({ children, testType = "generic" }) {
  const { roomId } = useParams();
  const { isAuthenticated, isLoading: authLoading, user, deviceLogin } = useAuth();

  const [canAccess, setCanAccess] = useState(null); // null = still checking
  const [message, setMessage] = useState("");
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (authLoading || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkAccess = async () => {
      // --- Step 1: Ensure we have an authenticated user ---
      let currentUser = user;
      let authenticated = isAuthenticated;

      if (!authenticated) {
        // Anonymous visitor — auto-register via device fingerprint
        try {
          const deviceId = await getDeviceFingerprint();
          const data = await deviceLogin(deviceId);
          currentUser = { id: data.current_user_id, role: data.role };
          authenticated = true;
        } catch (err) {
          console.error("Device login failed:", err);
          // If device login fails, let them through anyway — the test page
          // itself will handle participant creation
          setCanAccess(true);
          return;
        }
      }

      // --- Step 2: Role-based checks ---
      const role = currentUser?.role;

      // Admin & Teacher → always allowed (unlimited retakes)
      if (role === "admin" || role === "teacher") {
        setCanAccess(true);
        return;
      }

      // Viewer → never allowed to take tests
      if (role === "viewer") {
        setCanAccess(false);
        setMessage("Viewers are not allowed to take tests.");
        return;
      }

      // --- Step 3: Student — check test completion via backend ---
      try {
        const response = await api.checkTestCompletion(testType, roomId);
        if (response.ok && response.data.has_completed) {
          setCanAccess(false);
          setMessage(
            "You have already completed this test. Each participant can only complete the test once."
          );
          return;
        }
      } catch (err) {
        console.error("Failed to check test completion:", err);
        // On error, allow through — better to let them try than to block
      }

      setCanAccess(true);
    };

    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Still loading
  if (authLoading || canAccess === null) {
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

  // Blocked
  if (!canAccess) {
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
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          {message}
        </Typography>
        <Button variant="outlined" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  return children;
}

export { getDeviceFingerprint };
