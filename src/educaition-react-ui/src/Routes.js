import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import loadable from "@loadable/component";

const Playground = loadable(() => import("./pages/playGround"));
const Login = loadable(() => import("./pages/login"));
const GameRoom = loadable(() => import("./pages/gameRoom"));
const TacticPreparation = loadable(() => import("./pages/tacticPreparation"));
const Leaderboard = loadable(() => import("./pages/leaderBoard"));
const PersonalityTest = loadable(() =>
  import("./pages/PersonalityTest/personalityTest")
);
const Dashboard = loadable(() => import("./pages/dashboard"));
const DissonanceTestParticipantList = loadable(() =>
  import("./pages/dissonanceTestParticipantList")
);
const DissonanceTest = loadable(() => import("./pages/dissonanceTest"));
const DissonanceTestResult = loadable(() =>
  import("./pages/dissonanceTestResult")
);

const AppRoutes = ({ accessToken }) => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/rooms" element={<GameRoom />} />
    <Route path="/playground/:roomId" element={<Playground />} />
    <Route path="/tacticpreparation/:roomId" element={<TacticPreparation />} />
    <Route path="/leaderboard/:sessionId" element={<Leaderboard />} />
    <Route path="/personalitytest/:type/:id" element={<PersonalityTest />} />
    <Route
      path="/dissonanceTestParticipantList"
      element={<DissonanceTestParticipantList />}
    />
    <Route path="/dissonanceTest/:currentUserId" element={<DissonanceTest />} />
    <Route
      path="/dissonanceTestResult/:participantId"
      element={<DissonanceTestResult />}
    />
    <Route
      path="/"
      element={
        accessToken ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
      }
    />
  </Routes>
);

export default AppRoutes;
