import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { CenteredContainer } from '../styles/CommonStyles';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header title="Dashboard" />
      <CenteredContainer>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/rooms')}
          sx={{ margin: '10px 0' }}
        >
          Go to Rooms For Prisoners Dilemma
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate('/dissonanceTestParticipantList')}
          sx={{ margin: '10px 0' }}
        >
          Go to Dissonance Test Participant List
        </Button>
      </CenteredContainer>
    </>
  );
};

export default Dashboard;
