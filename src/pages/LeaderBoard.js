import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, Button, Grid, LinearProgress } from '@mui/material';
import Header from '../components/Header';
import '../styles/Playground.css';
import fetchWithAuth from '../utils/fetchWithAuth';

const Leaderboard = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const roomId = location.state.roomId;
  const roomName = location.state.roomName;
  const navigate = useNavigate();
  const [scores, setScores] = useState({});
  const [matrix, setMatrix] = useState({});
  const [participants, setParticipants] = useState([]);
  const [sessionName, setSessionName] = useState('');
  const [sessionStatus, setSessionStatus] = useState(''); // New state for session status
  let player_ids = [];

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetchWithAuth(`${process.env.REACT_APP_BACKEND_BASE_URL}/sessions/${sessionId}`);
        if (!response.ok) {
          throw new Error('Session data could not be fetched');
        }
        const data = await response.json();
        setSessionName(data.name);
        setSessionStatus(data.status);
        player_ids = data.player_ids;

        if (data.status === 'finished') {
          setScores(data.results.leaderboard);
          setMatrix(data.results.matrix);
          const participantsResponse = await fetchWithAuth(`${process.env.REACT_APP_BACKEND_BASE_URL}/players/${player_ids}`);
          if (!participantsResponse.ok) {
            throw new Error('Failed to fetch participants');
          }
          const participantsData = await participantsResponse.json();
          setParticipants(participantsData);
        }
      } catch (error) {
        console.error('Failed to fetch session data:', error);
      }
    };

    fetchSessionData();
  }, [sessionId]); // Dependency array with sessionId to refetch if it changes

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const playerNames = Object.keys(matrix);

  const handleBackToPlayground = () => {
    navigate(`/playground/${roomId}`, { state: { roomName: roomName } });
  };

  // Conditional rendering based on session status
  if (sessionStatus !== "finished") {
    return (
      <>
        <Header title={`${sessionName} Session Results`}>
          <Button onClick={handleBackToPlayground} variant="contained" color="primary">
            Back to Playground
          </Button>
        </Header>
        <Container style={{ marginTop: '200px', textAlign: 'center' }}>
          <LinearProgress
            variant="determinate"
            value={Number(sessionStatus)} // Convert sessionStatus to a number and set as value
            style={{ marginBottom: '20px' }}
          />
          <Typography variant="h5">Game is not finished yet, please wait and check this page regularly.</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header title={`${sessionName} Session Results`}>
        <Button onClick={handleBackToPlayground} variant="contained" color="primary">
          Back to Playground
        </Button>
      </Header>
      <Container style={{ marginTop: '100px' }}>
        <TableContainer component={Paper}>
          <Table aria-label="leaderboard table">
            <TableHead>
              <TableRow>
                <TableCell>Player Name</TableCell>
                <TableCell align="right">Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedScores.map(([player, score], index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {player}
                  </TableCell>
                  <TableCell align="right">{score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="h6" style={{ marginTop: '40px' }}>Game Results Matrix</Typography>
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table aria-label="game results matrix">
            <TableHead>
              <TableRow>
                <TableCell>Player \ Player</TableCell>
                {playerNames.map((player) => (
                  <TableCell key={player} align="right">{player}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {playerNames.map((player) => (
                <TableRow key={player}>
                  <TableCell component="th" scope="row">{player}</TableCell>
                  {playerNames.map((opponent) => (
                    <TableCell key={opponent} align="right">{matrix[player][opponent] || 0}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Grid container spacing={2}> {/* Adjust spacing as needed */}
            {participants.map((participant) => (
              <Grid item xs={6} > {/* Adjust grid item sizes as needed */}
                <Card key={participant.id} className="participant-card">
                  <CardContent>
                    <div className="name-section">
                      {participant.player_name.charAt(0).toUpperCase() + participant.player_name.slice(1)}
                    </div>
                    <div className="character-traits">
                      <Typography variant="body1">Extroversion: {participant.extroversion !== null ? participant.extroversion.toFixed(2) : 'NA'}</Typography>
                      <Typography variant="body1">Agreeableness: {participant.agreeableness !== null ? participant.agreeableness.toFixed(2) : 'NA'}</Typography>
                      <Typography variant="body1">Conscientiousness: {participant.conscientiousness !== null ? participant.conscientiousness.toFixed(2) : 'NA'}</Typography>
                      <Typography variant="body1">Negative Emotionality: {participant.negative_emotionality !== null ? participant.negative_emotionality.toFixed(2) : 'NA'}</Typography>
                      <Typography variant="body1">Open-mindedness: {participant.open_mindedness !== null ? participant.open_mindedness.toFixed(2) : 'NA'}</Typography>
                    </div>
                    <Typography variant="body2">
                      {participant.player_tactic}
                    </Typography>
                    {/* Display player_code as a code snippet */}
                    <Typography component="pre">
                      {participant.player_code}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TableContainer>
      </Container>
    </>
  );
};

export default Leaderboard;
