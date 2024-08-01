import React, { useEffect, useState } from 'react';
import { List, ListItemButton, ListItemText, Modal, Box, TextField, Typography, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import fetchWithAuth from '../utils/fetchWithAuth';
import { CenteredContainer, StyledButton, RoomCreationModalStyle } from '../styles/CommonStyles';
import Header from '../components/Header';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';

function GameRooms() {
  const [rooms, setRooms] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [roomName, setRoomName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetchWithAuth(`${process.env.REACT_APP_BACKEND_BASE_URL}/rooms`, {
          method: 'GET',
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        setRooms(data); // Update the rooms state with the fetched rooms
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      }
    };

    fetchRooms();
  }, [setRooms]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setRoomName('');
  };

  const handleRoomNameChange = (event) => {
    setRoomName(event.target.value);
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();

    try {
      const formBody = new FormData();
      const sanitized_name = validator.escape(roomName);
      const cleaned_name = sanitized_name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
      formBody.append('name', cleaned_name);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/rooms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        method: 'POST',
        body: formBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRooms([...rooms, data]);
      handleCloseModal(); // Close the modal after room creation
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/rooms/delete/${roomId}`, {
        method: 'POST',
        body: JSON.stringify({ _method: 'DELETE' }),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Update the rooms state by filtering out the deleted room
      setRooms(rooms.filter(room => room.id !== roomId));
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  const handleRedirect = (room) => {
    navigate(`/playground/${room.id}`, { state: { roomName: room.name } });
  };

  return (
    <>
      <Header title="Game Rooms" />
      <CenteredContainer>
        <List>
          {rooms ? rooms.map((room, index) => (
            <Box key={room.id} sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemButton component="a" onClick={() => handleRedirect(room)}>
                <ListItemText primary={room.name ? room.name : `Room-${index + 1}`} />
              </ListItemButton>
              <Button 
                onClick={() => handleDeleteRoom(room.id)} 
                variant="contained" 
                color="secondary" 
                size="small"
                sx={{ ml: 3 }}
              >
                <DeleteIcon fontSize="small"/> 
              </Button>
            </Box>
          )) : <ListItemButton><ListItemText primary="No rooms available" /></ListItemButton>}
        </List>
        <Button onClick={handleOpenModal} variant="contained" color="primary">Create Room</Button>
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="create-room-modal"
          aria-describedby="create-room-modal-description"
        >
          <Box sx={RoomCreationModalStyle}>
            <Typography id="create-room-modal-title" variant="h6" component="h2">
              Enter Room Name
            </Typography>
            <form onSubmit={handleCreateRoom}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Room Name"
                type="text"
                fullWidth
                variant="standard"
                value={roomName}
                onChange={handleRoomNameChange}
              />
              <StyledButton type="submit" variant="contained" color="primary">Create</StyledButton>
            </form>
          </Box>
        </Modal>
      </CenteredContainer>
    </>
  );
};

export default GameRooms;
