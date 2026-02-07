import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@contexts/AuthContext";
import { ProtectedRoute, TestPageGuard } from "@components/atoms";
import { ROLES, TEST_TYPES } from "@config/permissions";

import { Login } from "@pages/auth";
import Dashboard from "@pages/Dashboard";
import UserManagement from "@pages/UserManagement";
import Unauthorized from "@pages/Unauthorized";

import {
  GameRoom,
  PlayGround,
  LeaderBoard,
  TacticPreparation,
  PrisonersDilemmaRoomDetail,
  PrisonersDilemmaPublic,
} from "@pages/prisoners-dilemma";

import UniversityComparison from "@pages/university-comparison";
import {
  HighSchoolAnalysis,
  RivalAnalysis,
  ProgramRivalAnalysis,
  HighSchoolRooms,
  HighSchoolRoomDetail,
  ProgramSuggestionTest,
  ProgramTestResult,
} from "@pages/program-analysis";

import { PersonalityTestRoomDetail, PersonalityTestPublic } from "@pages/personality-test";
import TestManagement from "@pages/TestManagement";
import { TestRoomsPage } from "@components/templates";
import { TestType } from "./services/testRoomService";

import { DissonanceTestPublic, DissonanceTestRoomDetail } from "@pages/dissonance-test";

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
            <TestRoomsPage testType={TestType.PRISONERS_DILEMMA} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prisoners-dilemma-room/:roomId"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <PrisonersDilemmaRoomDetail />
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
            <TestRoomsPage testType={TestType.PROGRAM_SUGGESTION} />
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
            <TestRoomsPage testType={TestType.PERSONALITY_TEST} />
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

      {/* Dissonance Test Routes */}
      <Route
        path="/dissonance-test-rooms"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <TestRoomsPage testType={TestType.DISSONANCE_TEST} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dissonance-test-room/:roomId"
        element={
          <ProtectedRoute allowedRoles={ADMIN_TEACHER}>
            <DissonanceTestRoomDetail />
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
        path="/prisoners-dilemma/:roomId"
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
