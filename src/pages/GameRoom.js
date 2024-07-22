import React, { useEffect, useState } from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import fetchWithAuth from '../utils/fetchWithAuth';
import { CenteredContainer, StyledButton } from '../styles/CommonStyles';
import Header from '../components/Header';

function GameRooms () {
  const [rooms, setRooms] = useState([]);

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

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    try {
      const response = await fetchWithAuth(`${process.env.REACT_APP_BACKEND_BASE_URL}/rooms`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRooms([...rooms, data]);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  return (
    <>
      <Header title="Game Rooms" />
      <CenteredContainer>
        <List>
          {rooms ? rooms.map((room, index) => (
            <ListItemButton component="a" href={`/playground/${room.id}`} key={room.id}>
              <ListItemText primary={`Room-${index + 1}`} />
            </ListItemButton>
          )) : <ListItemButton><ListItemText primary="No rooms available" /></ListItemButton>}
        </List>
        <form onSubmit={handleCreateRoom}>
          <StyledButton type="submit" variant="contained" color="primary">Create Room</StyledButton>
        </form>
      </CenteredContainer>
    </>
  );
};

export default GameRooms;
