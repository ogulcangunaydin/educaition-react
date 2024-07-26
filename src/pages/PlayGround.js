import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery, Card, CardContent, Typography, Button, CircularProgress, Grid } from '@mui/material';
import { CenteredContainer } from '../styles/CommonStyles';
import '../styles/Playground.css';
import fetchWithAuth from '../utils/fetchWithAuth';
import Header from '../components/Header';
import { QRCodeCanvas } from 'qrcode.react';

const Playground = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [blurText, setBlurText] = useState(true);

  const theme = useTheme();
  // Use theme.breakpoints.down('sm') to check for small screen size
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchParticipantsAndTactics = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/players/${roomId}`, {
          method: 'GET'
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setParticipants(data);

        const authResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/auth`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          }
        });

        if (authResponse.ok) {
          setIsUserAuthenticated(true);
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    fetchParticipantsAndTactics();
  }, []);

  const handleStartGame = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetchWithAuth(`${process.env.REACT_APP_BACKEND_BASE_URL}/rooms/${roomId}/ready`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start the game');
      }

      const data = await response.json();

      navigate(`/leaderboard/${roomId}`, { state: { data: data, participants: participants, roomId: roomId } });
    } catch (error) {
      // Handle network errors
      console.error('Error starting the game:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = () => {
    setShowQR(true);
  };

  const handleCloseQR = (e) => {
    // Check if the click is outside the QR code
    if (e.target.id === 'qr-backdrop') {
      setShowQR(false);
    }
  };

  const redirectToGameRoom = () => {
    navigate('/rooms');
  };

  const toggleBlur = () => setBlurText(!blurText);

  return (
    <>
      <Header title={`Playground for Room ${roomId}`}>
        <Button // Step 3: Add the new Button for toggling blur
            variant="contained"
            onClick={toggleBlur}
            disabled={!isUserAuthenticated || loading} // Disabled for unauthorized users
            style={{ marginRight: '10px' }}
          >
            Toggle Blur
        </Button>
        <Button // Step 3: Add the new Button for redirecting to GameRoom
          variant="contained"
          color="primary" // You can choose a different color to distinguish this button
          onClick={redirectToGameRoom}
          disabled={!isUserAuthenticated || loading}
          style={{
            marginRight: '10px',
          }}
        >
          Go to GameRoom
        </Button>
        <Button
            variant="contained"
            onClick={handleShowQR}
            style={{
              marginRight: '10px',
            }}
            disabled={loading}
          >
          Display QR Code
        </Button>
        <Button variant="contained" color="secondary" onClick={handleStartGame} disabled={!isUserAuthenticated || loading}>
          Start Game
        </Button>
      </Header>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {showQR && (
            <div
              id="qr-backdrop"
              onClick={handleCloseQR}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <QRCodeCanvas
                  value={`${process.env.REACT_APP_FRONTEND_BASE_URL}/personalitytest/${roomId}`}
                  size={256}
                  level={"H"}
                  includeMargin={true}
                />
                <Typography variant="h6" style={{ color: 'white' }}>{`${process.env.REACT_APP_FRONTEND_BASE_URL}/personalitytest/${roomId}`}</Typography>
              </div>
            </div>
          )}
          <div style={{ marginTop: '64px' }}>
              {participants.length === 0 ? (
                <CenteredContainer>
                  <Typography variant="h6">No participants have joined yet</Typography>
                </CenteredContainer>
              ) : (
                <>
                  <Grid container spacing={2}> {/* Adjust spacing as needed */}
                    {participants.map((participant) => (
                      <Grid item xs={isSmallScreen ? 12 : 6} > {/* Adjust grid item sizes as needed */}
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
                            <Typography variant="body2" className={isUserAuthenticated && !blurText ? "" : "blurred-text"}>
                              {participant.player_tactic}
                            </Typography>
                            {/* Display player_code as a code snippet */}
                            <Typography component="pre" className={isUserAuthenticated && !blurText ? "" : "blurred-text"}>
                              {participant.player_code}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </div>
        </>
      )}
    </>
  );
};

export default Playground;
