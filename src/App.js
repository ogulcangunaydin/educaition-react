import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Playground from "./pages/PlayGround";
import Login from "./pages/Login";
import GameRoom from "./pages/GameRoom";
import TacticPreparation from "./pages/TacticPreparation";
import Leaderboard from "./pages/LeaderBoard";
import PersonalityTest from "./pages/PersonalityTest/PersonalityTest";
import Dashboard from "./pages/dashboard";
import DissonanceTestParticipantList from "./pages/dissonanceTestParticipantList";
import DissonanceTest from "./pages/dissonanceTest";
import DissonanceTestResult from "./pages/dissonanceTestResult";
import UniversityComparison from "./pages/UniversityComparison";
import HighSchoolAnalysis from "./pages/HighSchoolAnalysis";
import RivalAnalysis from "./pages/RivalAnalysis";
import ProgramRivalAnalysis from "./pages/ProgramRivalAnalysis";
import HighSchoolRooms from "./pages/HighSchoolRooms";
import HighSchoolRoomDetail from "./pages/HighSchoolRoomDetail";
import ProgramSuggestionTest from "./pages/ProgramSuggestionTest";
import ProgramTestResult from "./pages/ProgramTestResult";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { getUserRole } from "./services/authService";

// Role-based access configuration
const ROLE_ACCESS = {
  admin: ["dashboard", "rooms", "all"], // Full access
  teacher: ["dashboard", "rooms", "all"], // Full access
  viewer: ["university-comparison"], // Read-only university comparison
  student: ["tests"], // Only test participation
};

/**
 * Get the default redirect path for a role
 */
function getDefaultPathForRole(role) {
  switch (role?.toLowerCase()) {
    case "viewer":
      return "/university-comparison";
    case "student":
      return "/program-test"; // Students go to test area
    case "admin":
    case "teacher":
    default:
      return "/dashboard";
  }
}

/**
 * Check if a role has access to a specific route type
 */
function hasAccess(role, routeType) {
  const roleKey = role?.toLowerCase() || "student";
  const allowedRoutes = ROLE_ACCESS[roleKey] || ROLE_ACCESS.student;
  return allowedRoutes.includes("all") || allowedRoutes.includes(routeType);
}

/**
 * Protected Route wrapper
 * Redirects to login if not authenticated
 * Optionally checks for required role access
 */
function ProtectedRoute({ children, requiredAccess = null }) {
  const { isAuthenticated, isLoading } = useAuth();
  const role = getUserRole();

  if (isLoading) {
    // Show nothing while checking auth state (or could show a spinner)
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if specified
  if (requiredAccess && !hasAccess(role, requiredAccess)) {
    // Redirect to appropriate page for their role
    return <Navigate to={getDefaultPathForRole(role)} replace />;
  }

  return children;
}

/**
 * Viewer-only route - only accessible by viewers
 */
function ViewerRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const role = getUserRole();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Viewers can access, admins and teachers can also access
  const allowedRoles = ["viewer", "admin", "teacher"];
  if (!allowedRoles.includes(role?.toLowerCase())) {
    return <Navigate to={getDefaultPathForRole(role)} replace />;
  }

  return children;
}

/**
 * Public Route wrapper
 * Redirects authenticated users to their appropriate page based on role
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const role = getUserRole();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultPathForRole(role)} replace />;
  }

  return children;
}

/**
 * Main App Routes
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Admin/Teacher only routes - Dashboard and management */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredAccess="dashboard">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rooms"
        element={
          <ProtectedRoute requiredAccess="rooms">
            <GameRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playground/:roomId"
        element={
          <ProtectedRoute requiredAccess="rooms">
            <Playground />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tacticpreparation/:roomId"
        element={
          <ProtectedRoute requiredAccess="rooms">
            <TacticPreparation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard/:sessionId"
        element={
          <ProtectedRoute requiredAccess="rooms">
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personalitytest/:type/:id"
        element={
          <ProtectedRoute requiredAccess="rooms">
            <PersonalityTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dissonanceTestParticipantList"
        element={
          <ProtectedRoute requiredAccess="dashboard">
            <DissonanceTestParticipantList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dissonanceTest/:currentUserId"
        element={
          <ProtectedRoute requiredAccess="dashboard">
            <DissonanceTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dissonanceTestResult/:participantId"
        element={
          <ProtectedRoute requiredAccess="dashboard">
            <DissonanceTestResult />
          </ProtectedRoute>
        }
      />

      {/* University comparison - Viewers, Admins, and Teachers */}
      <Route
        path="/university-comparison"
        element={
          <ViewerRoute>
            <UniversityComparison />
          </ViewerRoute>
        }
      />
      <Route
        path="/highschool-analysis"
        element={
          <ViewerRoute>
            <HighSchoolAnalysis />
          </ViewerRoute>
        }
      />
      <Route
        path="/rival-analysis"
        element={
          <ViewerRoute>
            <RivalAnalysis />
          </ViewerRoute>
        }
      />
      <Route
        path="/program-rival-analysis"
        element={
          <ViewerRoute>
            <ProgramRivalAnalysis />
          </ViewerRoute>
        }
      />

      {/* High School Rooms - Admin/Teacher only */}
      <Route
        path="/high-school-rooms"
        element={
          <ProtectedRoute requiredAccess="dashboard">
            <HighSchoolRooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/high-school-room/:roomId"
        element={
          <ProtectedRoute requiredAccess="dashboard">
            <HighSchoolRoomDetail />
          </ProtectedRoute>
        }
      />

      {/* Public test routes - accessed by anonymous participants (students) */}
      {/* These don't require login - participants enter their name when starting */}
      <Route path="/program-test/:roomId" element={<ProgramSuggestionTest />} />
      <Route path="/program-test-result/:studentId" element={<ProgramTestResult />} />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
