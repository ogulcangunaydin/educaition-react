import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Modal,
  Grid,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
} from "@mui/material";
import { CenteredContainer } from "../styles/CommonStyles";
import "../styles/Playground.css";
import fetchWithAuth from "../utils/fetchWithAuth";
import Header from "../components/Header";
import ParticipantDetailCard from "../components/ParticipantDetailCard";
import { QRCodeCanvas } from "qrcode.react";
import { Radar } from "react-chartjs-2";

const Playground = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [blurText, setBlurText] = useState(true);
  const [showModal, setShowModal] = useState(false); // For modal visibility
  const [sessionName, setSessionName] = useState(""); // For storing input name
  const [sessions, setSessions] = useState([]); // For storing session data
  const [anchorEl, setAnchorEl] = useState(null); // State for menu anchor
  const [openDialogParticipantId, setOpenDialogParticipantId] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const theme = useTheme();
  // Use theme.breakpoints.down('sm') to check for small screen size
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const location = useLocation();
  const roomName = location.state?.roomName || "";

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
      const response = await fetchWithAuth(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/players/delete/${participantId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the rooms state by filtering out the deleted room
      setParticipants(participants.filter((participant) => participant.id !== participantId));
    } catch (error) {
      console.error("Failed to delete room:", error);
    }
  };

  useEffect(() => {
    const fetchParticipantsAndTactics = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/players/room/${roomId}`,
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setParticipants(data);

        const authResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/auth`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (authResponse.ok) {
          setIsUserAuthenticated(true);

          const sessionsResponse = await fetchWithAuth(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/rooms/${roomId}/sessions`
          );
          if (!sessionsResponse.ok) {
            throw new Error("Failed to fetch sessions");
          }
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData); // Assuming you have a state setter for sessions
        }
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    fetchParticipantsAndTactics();
  }, [roomId]); // Added roomId as a dependency

  const handleStartGame = () => {
    setShowModal(true); // Show modal instead of starting game directly
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      const formBody = new FormData();
      formBody.append("name", sessionName);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/rooms/${roomId}/ready`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          method: "POST",
          body: formBody,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.detail === "All players are not ready") {
          setErrorMessage(errorData.detail);
          setShowErrorModal(true);
        } else {
          throw new Error(errorData.detail || "Failed to create session");
        }
      } else {
        const data = await response.json();
        setSessions([...sessions, data]); // Add the new session to the sessions array
        setShowModal(false); // Close the modal

        navigate(`/leaderboard/${data.id}`, {
          state: { roomId: roomId, roomName: roomName },
        });
      }
    } catch (error) {
      console.error("Error creating session:", error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  const handleDeleteNotReadyPlayers = async () => {
    try {
      const notReadyPlayers = participants.filter((player) => !player.player_tactic);
      for (const player of notReadyPlayers) {
        await fetchWithAuth(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/players/delete/${player.id}`,
          {
            method: "POST",
          }
        );
      }
      setShowErrorModal(false);
      handleSubmit(); // Call handleSubmit again to start the game
    } catch (error) {
      console.error("Error deleting not ready players:", error);
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
    if (e.target.id === "qr-backdrop") {
      setShowQR(false);
    }
  };

  const redirectToGameRoom = () => {
    navigate("/rooms");
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
        <Typography variant="h6" style={{ marginRight: "20px", marginLeft: "auto" }}>
          Participants: {participants.length}
        </Typography>
        <Button // Step 3: Add the new Button for toggling blur
          variant="contained"
          onClick={toggleBlur}
          disabled={!isUserAuthenticated} // Disabled for unauthorized users
          style={{ marginRight: "20px" }}
        >
          Toggle Blur
        </Button>
        <Button // Step 3: Add the new Button for redirecting to GameRoom
          variant="contained"
          color="primary" // You can choose a different color to distinguish this button
          onClick={redirectToGameRoom}
          disabled={!isUserAuthenticated}
          style={{
            marginRight: "20px",
          }}
        >
          Go to GameRoom
        </Button>
        <Button
          variant="contained"
          onClick={handleShowQR}
          style={{
            marginRight: "20px",
          }}
        >
          Display QR Code
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleStartGame}
          disabled={!isUserAuthenticated}
        >
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
              style={{ marginLeft: "10px" }}
            >
              Select Session
            </Button>
            <Menu
              id="session-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              style={{ marginLeft: "20px", marginTop: "10px" }}
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
          <div id="qr-backdrop" onClick={handleCloseQR} className="qrContainer">
            <div onClick={(e) => e.stopPropagation()}>
              <QRCodeCanvas
                value={`${process.env.REACT_APP_FRONTEND_BASE_URL}/personalitytest/room/${roomId}`}
                size={256}
                level={"H"}
                includeMargin={true}
              />
              <Typography
                variant="h6"
                style={{ color: "white" }}
              >{`${process.env.REACT_APP_FRONTEND_BASE_URL}/personalitytest/room/${roomId}`}</Typography>
            </div>
          </div>
        )}
        <div style={{ marginTop: "64px" }}>
          {participants.length === 0 ? (
            <CenteredContainer>
              <Typography variant="h6">No participants have joined yet</Typography>
            </CenteredContainer>
          ) : (
            <>
              <Grid container spacing={2}>
                {participants.map((participant) => {
                  const radarData = {
                    labels: [
                      "Extroversion",
                      "Agreeableness",
                      "Conscientiousness",
                      "Negative Emotionality",
                      "Open-mindedness",
                    ],
                    datasets: [
                      {
                        label: "Personality Traits",
                        data: [
                          participant.extroversion !== null ? participant.extroversion : 0,
                          participant.agreeableness !== null ? participant.agreeableness : 0,
                          participant.conscientiousness !== null
                            ? participant.conscientiousness
                            : 0,
                          participant.negative_emotionality !== null
                            ? participant.negative_emotionality
                            : 0,
                          participant.open_mindedness !== null ? participant.open_mindedness : 0,
                        ],
                        backgroundColor: "rgba(75,192,192,0.2)",
                        borderColor: "rgba(75,192,192,1)",
                        borderWidth: 1,
                      },
                    ],
                  };

                  const radarOptions = {
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          stepSize: 20,
                          backdropColor: "transparent",
                        },
                        grid: {
                          color: "rgba(0, 0, 0, 0.1)",
                        },
                        angleLines: {
                          color: "rgba(0, 0, 0, 0.1)",
                        },
                        pointLabels: {
                          font: {
                            size: isSmallScreen ? 12 : 16,
                          },
                        },
                      },
                    },
                    layout: {
                      padding: {
                        top: 20,
                        bottom: 20,
                      },
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: "top",
                      },
                      tooltip: {
                        enabled: true,
                      },
                    },
                  };

                  const allValuesPresent = [
                    participant.extroversion,
                    participant.agreeableness,
                    participant.conscientiousness,
                    participant.negative_emotionality,
                    participant.open_mindedness,
                  ].every((value) => value !== null);

                  return (
                    <Grid item xs={isSmallScreen ? 12 : 6} key={participant.id}>
                      <Card className="participant-card">
                        <CardContent>
                          <div className="name-section">
                            <div style={{ flex: isUserAuthenticated ? 5 : 3 }}></div>
                            <Typography variant="h6" style={{ flex: 1 }}>
                              {participant.player_name.charAt(0).toUpperCase() +
                                participant.player_name.slice(1)}
                            </Typography>
                            <div style={{ flex: 3 }}></div>
                            {isUserAuthenticated && !showQR && (
                              <>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={() => handleClickOpen(participant.id)}
                                  style={{ flex: 2 }}
                                >
                                  Delete Player
                                </Button>
                                <Dialog
                                  open={openDialogParticipantId === participant.id} // Dialog is open only for the selected participant
                                  onClose={handleClose}
                                  aria-labelledby="alert-dialog-title"
                                  aria-describedby="alert-dialog-description"
                                >
                                  <DialogTitle id="alert-dialog-title">
                                    {"Confirm Delete"}
                                  </DialogTitle>
                                  <DialogContent>
                                    <DialogContentText id="alert-dialog-description">
                                      Are you sure you want to delete {participant.player_name}{" "}
                                      player?
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
                              </>
                            )}
                          </div>
                          {allValuesPresent && !blurText && (
                            <Box
                              style={{
                                marginLeft: "auto",
                                marginRight: "auto",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                maxWidth: "500px", // Adjust the max width as needed
                                height: "auto",
                              }}
                            >
                              <Radar data={radarData} options={radarOptions} />
                            </Box>
                          )}
                          <ParticipantDetailCard
                            participant={participant}
                            isUserAuthenticated={isUserAuthenticated}
                            blurText={blurText}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
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
        className="sessionModal"
      >
        <div className="modalContainer">
          <form onSubmit={handleSubmit} className="modalForm">
            <TextField
              label="Session Name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
              style={{ marginBottom: "10px", width: "100%" }} // Ensure TextField takes full width
            />
            <Button type="submit" variant="contained" color="primary">
              Create Session
            </Button>
          </form>
        </div>
      </Modal>
      <Dialog
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowErrorModal(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteNotReadyPlayers} color="primary" autoFocus>
            Delete Not Ready Players and Start Game
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Playground;
