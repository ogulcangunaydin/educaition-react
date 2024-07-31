import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Playground from './pages/PlayGround';
import Login from './pages/Login';
import GameRooms from './pages/GameRoom';
import TacticPreparation from './pages/TacticPreparation';
import Leaderboard from './pages/LeaderBoard';
import PersonalityTest from './pages/PersonalityTest/PersonalityTest';

function App() {
  const accessToken = localStorage.getItem('access_token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/rooms" element={<GameRooms />} />
        <Route path="/playground/:roomId" element={<Playground />} />
        <Route path="/tacticpreparation/:roomId" element={<TacticPreparation />} />
        <Route path="/leaderboard/:sessionId" element={<Leaderboard />} />
        <Route path="/personalitytest/:roomId" element={<PersonalityTest />} />
        <Route
          path="/"
          element={accessToken ? <Navigate to="/rooms" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
