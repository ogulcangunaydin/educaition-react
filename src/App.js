import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
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
          path="/university-comparison"
          element={<UniversityComparison />}
        />
        <Route path="/highschool-analysis" element={<HighSchoolAnalysis />} />
        <Route path="/rival-analysis" element={<RivalAnalysis />} />
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
