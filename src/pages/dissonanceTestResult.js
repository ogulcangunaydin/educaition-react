import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Button } from '@mui/material';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import ReactMarkdown from 'react-markdown';
import Header from '../components/Header';
import { CenteredContainer } from '../styles/CommonStyles';
import fetchWithAuth from '../utils/fetchWithAuth';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const DissonanceTestResult = () => {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const response = await fetchWithAuth(`${process.env.REACT_APP_BACKEND_BASE_URL}/dissonance_test_participants/${participantId}`, {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setParticipant(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching participant:', error);
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [participantId]);

  if (loading) {
    return (
      <CenteredContainer>
        <CircularProgress />
      </CenteredContainer>
    );
  }

  if (!participant) {
    return (
      <CenteredContainer>
        <Typography variant="h6" color="error">Error loading participant data.</Typography>
      </CenteredContainer>
    );
  }

  const data = {
    labels: ['Extroversion', 'Agreeableness', 'Conscientiousness', 'Negative Emotionality', 'Open-Mindedness'],
    datasets: [
      {
        label: 'Personality Traits',
        data: [
          participant.extroversion,
          participant.agreeableness,
          participant.conscientiousness,
          participant.negative_emotionality,
          participant.open_mindedness,
        ],
        backgroundColor: 'rgba(34, 202, 236, 0.2)',
        borderColor: 'rgba(34, 202, 236, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
      },
    },
  };

  return (
    <>
      <Header title="Personality Test Results" />
      <CenteredContainer>
        <Box width="100%" maxWidth="600px">
          <Radar data={data} options={options} />
        </Box>
        <Box mt={4}>
          <Typography variant="h6">Meslek Tavsiyeleri</Typography>
          <Box mt={2}>
            <ReactMarkdown>{participant.job_recommendation}</ReactMarkdown>
          </Box>
        </Box>
      </CenteredContainer>
    </>
  );
};

export default DissonanceTestResult;