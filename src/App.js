import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@contexts/AuthContext";
import { ProtectedRoute, TestPageGuard } from "@components/atoms";
import { ROLES, TEST_TYPES } from "@config/permissions";

import { Login } from "@pages/auth";
import Dashboard from "@pages/Dashboard";
import UserManagement from "@pages/UserManagement";
import Unauthorized from "@pages/Unauthorized";

import { GameRoom, PlayGround, LeaderBoard, TacticPreparation } from "@pages/prisoners-dilemma";
import PersonalityTest from "@pages/PersonalityTest/PersonalityTest";

import DissonanceTestParticipantList from "@pages/dissonanceTestParticipantList";
import DissonanceTest from "@pages/dissonanceTest";
import DissonanceTestResult from "@pages/dissonanceTestResult";

import UniversityComparison from "@pages/UniversityComparison";
import HighSchoolAnalysis from "@pages/HighSchoolAnalysis";
import RivalAnalysis from "@pages/RivalAnalysis";
import ProgramRivalAnalysis from "@pages/ProgramRivalAnalysis";

import HighSchoolRooms from "@pages/HighSchoolRooms";
import HighSchoolRoomDetail from "@pages/HighSchoolRoomDetail";
import PersonalityTestRooms from "@pages/PersonalityTestRooms";
import PersonalityTestRoomDetail from "@pages/PersonalityTestRoomDetail";
import TestManagement from "@pages/TestManagement";
import ProgramSuggestionRooms from "@pages/ProgramSuggestionRooms";
import PrisonersDilemmaRooms from "@pages/PrisonersDilemmaRooms";

import ProgramSuggestionTest from "@pages/ProgramSuggestionTest";
import ProgramTestResult from "@pages/ProgramTestResult";
import PersonalityTestPublic from "@pages/PersonalityTestPublic";
import DissonanceTestPublic from "@pages/DissonanceTestPublic";
import PrisonersDilemmaPublic from "@pages/PrisonersDilemmaPublic";

const ADMIN_ONLY = [ROLES.ADMIN];
const ADMIN_TEACHER = [ROLES.ADMIN, ROLES.TEACHER];
const VIEWER_PLUS = [ROLES.ADMIN, ROLES.TEACHER, ROLES.VIEWER];
const ALL_AUTHENTICATED = [ROLES.ADMIN, ROLES.TEACHER, ROLES.VIEWER];

function getDefaultPath() {
  return "/dashboard";
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to={getDefaultPath()} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login variant="educaition" />
          </PublicRoute>
        }
      />
      <Route
        path="/login-halic"
        element={
          <PublicRoute>
            <Login variant="halic" />
          </PublicRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={ALL_AUTHENTICATED}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* User Management - Admin Only */}
      <Route
        path="/user-management"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* Prisoners' Dilemma Routes */}
      <Route
        path="/rooms"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <GameRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prisoners-dilemma-rooms"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <PrisonersDilemmaRooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playground/:roomId"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <PlayGround />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tacticpreparation/:roomId"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <TacticPreparation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard/:sessionId"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <LeaderBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personalitytest/:type/:id"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <PersonalityTest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dissonanceTestParticipantList"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <DissonanceTestParticipantList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dissonanceTest/:currentUserId"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <DissonanceTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dissonanceTestResult/:participantId"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <DissonanceTestResult />
          </ProtectedRoute>
        }
      />

      <Route
        path="/university-comparison"
        element={
          <ProtectedRoute allowedRoles={VIEWER_PLUS}>
            <UniversityComparison />
          </ProtectedRoute>
        }
      />
      <Route
        path="/highschool-analysis"
        element={
          <ProtectedRoute allowedRoles={VIEWER_PLUS}>
            <HighSchoolAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rival-analysis"
        element={
          <ProtectedRoute allowedRoles={VIEWER_PLUS}>
            <RivalAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-rival-analysis"
        element={
          <ProtectedRoute allowedRoles={VIEWER_PLUS}>
            <ProgramRivalAnalysis />
          </ProtectedRoute>
        }
      />

      {/* Program Suggestion Routes */}
      <Route
        path="/high-school-rooms"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <HighSchoolRooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-suggestion-rooms"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <ProgramSuggestionRooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/high-school-room/:roomId"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <HighSchoolRoomDetail />
          </ProtectedRoute>
        }
      />

      {/* Personality Test Routes */}
      <Route
        path="/personality-test-rooms"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <PersonalityTestRooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personality-test-room/:roomId"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <PersonalityTestRoomDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/test-management"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <TestManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/program-test/:roomId"
        element={
          <TestPageGuard testType={TEST_TYPES.PROGRAM_SUGGESTION}>
            <ProgramSuggestionTest />
          </TestPageGuard>
        }
      />
      <Route path="/program-test-result/:studentId" element={<ProgramTestResult />} />

      {/* Public Test Routes (accessible via QR code) */}
      <Route
        path="/personality-test/:roomId"
        element={
          <TestPageGuard testType={TEST_TYPES.PERSONALITY_TEST}>
            <PersonalityTestPublic />
          </TestPageGuard>
        }
      />
      <Route
        path="/dissonance-test/:roomId"
        element={
          <TestPageGuard testType={TEST_TYPES.DISSONANCE_TEST}>
            <DissonanceTestPublic />
          </TestPageGuard>
        }
      />
      <Route
        path="/game-room/:roomId"
        element={
          <TestPageGuard testType={TEST_TYPES.PRISONERS_DILEMMA}>
            <PrisonersDilemmaPublic />
          </TestPageGuard>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
