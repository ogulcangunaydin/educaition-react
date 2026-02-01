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

/**
 * Protected Route wrapper
 * Redirects to login if not authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show nothing while checking auth state (or could show a spinner)
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Public Route wrapper
 * Redirects authenticated users away from login
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/university-comparison" replace />;
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

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rooms"
        element={
          <ProtectedRoute>
            <GameRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playground/:roomId"
        element={
          <ProtectedRoute>
            <Playground />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tacticpreparation/:roomId"
        element={
          <ProtectedRoute>
            <TacticPreparation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard/:sessionId"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personalitytest/:type/:id"
        element={
          <ProtectedRoute>
            <PersonalityTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dissonanceTestParticipantList"
        element={
          <ProtectedRoute>
            <DissonanceTestParticipantList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dissonanceTest/:currentUserId"
        element={
          <ProtectedRoute>
            <DissonanceTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dissonanceTestResult/:participantId"
        element={
          <ProtectedRoute>
            <DissonanceTestResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/university-comparison"
        element={
          <ProtectedRoute>
            <UniversityComparison />
          </ProtectedRoute>
        }
      />
      <Route
        path="/highschool-analysis"
        element={
          <ProtectedRoute>
            <HighSchoolAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rival-analysis"
        element={
          <ProtectedRoute>
            <RivalAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-rival-analysis"
        element={
          <ProtectedRoute>
            <ProgramRivalAnalysis />
          </ProtectedRoute>
        }
      />

      {/* High School Rooms - Program Suggestion System (public for participants) */}
      <Route
        path="/high-school-rooms"
        element={
          <ProtectedRoute>
            <HighSchoolRooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/high-school-room/:roomId"
        element={
          <ProtectedRoute>
            <HighSchoolRoomDetail />
          </ProtectedRoute>
        }
      />
      {/* Program test routes are public - accessed by anonymous participants */}
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
