import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Box, CircularProgress, Button, useMediaQuery, useTheme } from "@mui/material";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import ReactMarkdown from "react-markdown";
import Header from "../components/Header";
import { CenteredContainer } from "../styles/CommonStyles";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const DissonanceTestResult = () => {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/dissonance_test_participants/${participantId}`,
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setParticipant(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching participant:", error);
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      try {
        const authResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/auth`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (authResponse.ok) {
          setIsUserAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    fetchParticipant();
    checkAuth();
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
        <Typography variant="h6" color="error">
          Error loading participant data.
        </Typography>
      </CenteredContainer>
    );
  }

  const data = {
    labels: ["Dışadönüklük", "Uyumluluk", "Sorumluluk", "Olumsuz Duygusallık", "Açık Fikirlilik"],
    datasets: [
      {
        label: "Kişilik Özellikleri",
        data: [
          participant.extroversion,
          participant.agreeableness,
          participant.conscientiousness,
          participant.negative_emotionality,
          participant.open_mindedness,
        ],
        backgroundColor: "rgba(34, 202, 236, 0.2)",
        borderColor: "rgba(34, 202, 236, 1)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: "transparent", // Remove the background color of the scale labels
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)", // Adjust the grid line color
        },
        angleLines: {
          color: "rgba(0, 0, 0, 0.1)", // Adjust the angle line color
        },
        pointLabels: {
          font: {
            size: isSmallScreen ? 12 : 16, // Adjust the font size of the labels based on screen size
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

  return (
    <Box display="flex" flexDirection="column">
      <Header title="Kişilik Testi Sonuçları">
        {isUserAuthenticated && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/dissonanceTestParticipantList")}
            style={{
              marginRight: isSmallScreen ? "0" : "20px",
              marginBottom: isSmallScreen ? "10px" : "0",
              width: isSmallScreen ? "100%" : "auto",
            }}
          >
            Participant List
          </Button>
        )}
      </Header>
      <CenteredContainer>
        <Box
          width="100%"
          maxWidth={isSmallScreen ? "100%" : "600px"}
          mt={isSmallScreen ? "2200px" : "750px"}
        >
          <Radar data={data} options={options} />
        </Box>
        <Box mt={4} ml={isSmallScreen ? 1 : 2} mr={isSmallScreen ? 1 : 2}>
          <Typography variant="h6">Meslek Tavsiyeleri</Typography>
          <Box mt={2}>
            <ReactMarkdown>{participant.job_recommendation}</ReactMarkdown>
          </Box>
        </Box>
        <Box mt={4} ml={isSmallScreen ? 1 : 2} mr={isSmallScreen ? 1 : 2}>
          <Typography variant="h6">Burç Kişilik Testi Uyumluluk Analizi</Typography>
          <Box mt={2}>
            <ReactMarkdown>{participant.compatibility_analysis}</ReactMarkdown>
          </Box>
        </Box>
      </CenteredContainer>
    </Box>
  );
};

export default DissonanceTestResult;
