import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme, useMediaQuery, Card, CardContent, Typography, Button, TextField, MenuItem, Modal, Grid, Menu, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { CenteredContainer } from '../styles/CommonStyles';
import '../styles/Playground.css';
import fetchWithAuth from '../utils/fetchWithAuth';
import Header from '../components/Header';
import { QRCodeCanvas } from 'qrcode.react';

const Playground = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [blurText, setBlurText] = useState(true);
  const [showModal, setShowModal] = useState(false); // For modal visibility
  const [sessionName, setSessionName] = useState(''); // For storing input name
  const [sessions, setSessions] = useState([]); // For storing session data
  const [anchorEl, setAnchorEl] = useState(null); // State for menu anchor

  const theme = useTheme();
  // Use theme.breakpoints.down('sm') to check for small screen size
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const location = useLocation();
  const roomName = location.state?.roomName || "";

  const [openDialogParticipantId, setOpenDialogParticipantId] = useState(null);

  const handleClickOpen = (participantId) => {
    setOpenDialogParticipantId(participantId); // Set the ID of the participant whose dialog should be open
  };

  const handleClose = () => {
    setOpenDialogParticipantId(null); // Reset the dialog open state
  };

  const handleDelete = async () => {
    // Close the dialog
    handleClose();
    const participantId = openDialogParticipantId; // Use the ID of the participant to delete
    try {
      const response = await fetchWithAuth(`${process.env.REACT_APP_BACKEND_BASE_URL}/players/delete/${participantId}`, {
        method: 'POST',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Update the rooms state by filtering out the deleted room
      setParticipants(participants.filter(participant => participant.id !== participantId));
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  useEffect(() => {
    const fetchParticipantsAndTactics = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/players/room/${roomId}`, {
          method: 'GET'
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setParticipants(data);

        const authResponse = await fetchWithAuth(`${process.env.REACT_APP_BACKEND_BASE_URL}/auth`);

        if (authResponse.ok) {
          setIsUserAuthenticated(true);

          const sessionsResponse = await fetchWithAuth(`${process.env.REACT_APP_BACKEND_BASE_URL}/rooms/${roomId}/sessions`);
          if (!sessionsResponse.ok) {
            throw new Error('Failed to fetch sessions');
          }
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData); // Assuming you have a state setter for sessions
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    fetchParticipantsAndTactics();
  }, [roomId]); // Added roomId as a dependency

  const handleStartGame = () => {
    setShowModal(true); // Show modal instead of starting game directly
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formBody = new FormData();
      formBody.append('name', sessionName);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/rooms/${roomId}/ready`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        method: 'POST',
        body: formBody,
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      setSessions([...sessions, data]); // Add the new session to the sessions array
      setShowModal(false); // Close the modal

      navigate(`/leaderboard/${data.id}`, { state: { roomId: roomId, roomName: roomName } });
    } catch (error) {
      console.error('Error creating session:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleSessionChange = (sessionId) => {
    navigate(`/leaderboard/${sessionId}`, { state: { roomId } });
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

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Header title={`Playground for Room ${roomName || roomId}`}>
        <Button // Step 3: Add the new Button for toggling blur
            variant="contained"
            onClick={toggleBlur}
            disabled={!isUserAuthenticated} // Disabled for unauthorized users
            style={{ marginRight: '10px' }}
          >
            Toggle Blur
        </Button>
        <Button // Step 3: Add the new Button for redirecting to GameRoom
          variant="contained"
          color="primary" // You can choose a different color to distinguish this button
          onClick={redirectToGameRoom}
          disabled={!isUserAuthenticated}
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
          >
          Display QR Code
        </Button>
        <Button variant="contained" color="secondary" onClick={handleStartGame} disabled={!isUserAuthenticated}>
          Start Game
        </Button>
        {sessions.length > 0 && (
          <>
          <Button
            aria-controls="session-menu"
            aria-haspopup="true"
            onClick={handleOpenMenu}
            variant="contained"
            color="primary"
            style={{ marginLeft: '10px' }}
          >
            Select Session
          </Button>
          <Menu
            id="session-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            style={{ marginLeft: '20px', marginTop: '10px' }}
          >
            {sessions.map((session) => (
              <MenuItem key={session.id} onClick={() => handleSessionChange(session.id)}>
                {session.name}
              </MenuItem>
            ))}
          </Menu>
        </>
        )}
      </Header>
      <>
        {showQR && (
          <div
            id="qr-backdrop"
            onClick={handleCloseQR}
            className='qrContainer'
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
                <Grid container spacing={2}>
                  {participants.map((participant) => (
                    <Grid item xs={isSmallScreen ? 12 : 6} key={participant.id}>
                      <Card className="participant-card">
                        <CardContent>
                          <div className="name-section">
                            <div style={{flex: 5}}></div>
                            <Typography variant="body1" style={{flex: 1}}>
                              {participant.player_name.charAt(0).toUpperCase() + participant.player_name.slice(1)}
                            </Typography>
                            <div style={{flex: 3}}></div>
                            <Button variant="contained" color="secondary" onClick={() => handleClickOpen(participant.id)} style={{ flex: 2 }}>Delete Player</Button>
                            <Dialog
                              open={openDialogParticipantId === participant.id} // Dialog is open only for the selected participant
                              onClose={handleClose}
                              aria-labelledby="alert-dialog-title"
                              aria-describedby="alert-dialog-description"
                            >
                              <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                              <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                  Are you sure you want to delete {participant.player_name} player?
                                </DialogContentText>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={handleClose} color="primary">
                                  Cancel
                                </Button>
                                <Button onClick={handleDelete} color="primary" autoFocus>
                                  Confirm
                                </Button>
                              </DialogActions>
                            </Dialog>
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
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className='sessionModal'
      >
        <div className='modalContainer'>
          <form onSubmit={handleSubmit} className='modalForm'>
            <TextField
              label="Session Name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
              style={{ marginBottom: '10px', width: '100%' }} // Ensure TextField takes full width
            />
            <Button type="submit" variant="contained" color="primary">
              Create Session
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Playground;
