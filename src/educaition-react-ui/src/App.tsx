import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Playground from "./pages/playGround";
import Login from "./pages/login";
import GameRoom from "./pages/gameRoom";
import TacticPreparation from "./pages/tacticPreparation";
import Leaderboard from "./pages/leaderBoard";
import PersonalityTest from "./pages/PersonalityTest/personalityTest";
import Dashboard from "./pages/dashboard";
import DissonanceTestParticipantList from "./pages/dissonanceTestParticipantList";
import DissonanceTest from "./pages/dissonanceTest";
import DissonanceTestResult from "./pages/dissonanceTestResult";

function App() {
  const accessToken = localStorage.getItem("access_token");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rooms" element={<GameRoom />} />
        <Route path="/playground/:roomId" element={<Playground />} />
        <Route
          path="/tacticpreparation/:roomId"
          element={<TacticPreparation />}
        />
        <Route path="/leaderboard/:sessionId" element={<Leaderboard />} />
        <Route
          path="/personalitytest/:type/:id"
          element={<PersonalityTest />}
        />
        <Route
          path="/dissonanceTestParticipantList"
          element={<DissonanceTestParticipantList />}
        />
        <Route
          path="/dissonanceTest/:currentUserId"
          element={<DissonanceTest />}
        />
        <Route
          path="/dissonanceTestResult/:participantId"
          element={<DissonanceTestResult />}
        />
        <Route
          path="/"
          element={
            accessToken ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
