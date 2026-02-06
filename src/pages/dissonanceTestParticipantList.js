import React, { useState, useEffect } from "react";
import {
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Button,
  useTheme,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../components/organisms/Header";
import { StyledTableContainer } from "../styles/CommonStyles";
import dissonanceTestService from "@services/dissonanceTestService";
import { QRCodeCanvas } from "qrcode.react";

const DissonanceTestParticipantList = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const currentUserId = localStorage.getItem("current_user_id");

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const data = await dissonanceTestService.getParticipants();
        setParticipants(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching participants:", error);
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  const handleShowQR = () => {
    setShowQR(true);
  };

  const handleCloseQR = (e) => {
    // Check if the click is outside the QR code
    if (e.target.id === "qr-backdrop") {
      setShowQR(false);
    }
  };

  const handleViewResults = (participantId) => {
    navigate(`/dissonanceTestResult/${participantId}`);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const formatPersonalityTestAnswers = (answers) => {
    if (!answers || answers.length === 0) {
      return "N/A";
    }
    return `"${JSON.stringify(answers).replace(/"/g, '""')}"`;
  };

  const exportToCSV = () => {
    const headers = [
      "Email",
      "Age",
      "Gender",
      "Education",
      "Sentiment",
      "Comfort Question First Answer",
      "Fare Question First Answer",
      "Comfort Question Second Answer",
      "Fare Question Second Answer",
      "Extroversion",
      "Agreeableness",
      "Conscientiousness",
      "Negative Emotionality",
      "Open Mindedness",
      "Created At",
      "Workload",
      "Career Start",
      "Flexibility",
      "Star Sign",
      "Rising Sign",
      "Personality Test Answers",
    ];

    const rows = participants.map((participant) => [
      participant.email,
      participant.age,
      participant.gender,
      participant.education,
      participant.sentiment,
      participant.comfort_question_first_answer,
      participant.comfort_question_displayed_average !== null
        ? participant.comfort_question_displayed_average.toFixed(2)
        : "N/A",
      participant.comfort_question_second_answer,
      participant.fare_question_first_answer,
      participant.fare_question_displayed_average !== null
        ? participant.fare_question_displayed_average.toFixed(2)
        : "N/A",
      participant.fare_question_second_answer,
      participant.extroversion !== null ? participant.extroversion.toFixed(2) : "N/A",
      participant.agreeableness !== null ? participant.agreeableness.toFixed(2) : "N/A",
      participant.conscientiousness !== null ? participant.conscientiousness.toFixed(2) : "N/A",
      participant.negative_emotionality !== null
        ? participant.negative_emotionality.toFixed(2)
        : "N/A",
      participant.open_mindedness !== null ? participant.open_mindedness.toFixed(2) : "N/A",
      participant.created_at,
      participant.workload,
      participant.career_start,
      participant.flexibility,
      participant.star_sign,
      participant.rising_sign,
      formatPersonalityTestAnswers(participant.personality_test_answers),
    ]);

    const csvContent = headers.join(",") + "\n" + rows.map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "dissonance_test_participants.csv");
    document.body.appendChild(link); // Required for FF

    link.click();
    document.body.removeChild(link); // Clean up
  };

  return (
    <>
      <Header title="Dissonance Test Participants">
        <Box
          display="flex"
          flexDirection={isSmallScreen ? "column" : "row"}
          alignItems={isSmallScreen ? "stretch" : "center"}
          justifyContent={isSmallScreen ? "center" : "flex-start"}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleBackToDashboard}
            style={{
              marginRight: isSmallScreen ? "0" : "20px",
              marginBottom: isSmallScreen ? "10px" : "0",
              width: isSmallScreen ? "100%" : "auto",
            }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={exportToCSV}
            style={{
              marginRight: isSmallScreen ? "0" : "20px",
              marginBottom: isSmallScreen ? "10px" : "0",
              width: isSmallScreen ? "100%" : "auto",
            }}
          >
            Export as CSV
          </Button>
          <Button
            variant="contained"
            onClick={handleShowQR}
            style={{
              marginRight: isSmallScreen ? "0" : "20px",
              marginBottom: isSmallScreen ? "10px" : "0",
              width: isSmallScreen ? "100%" : "auto",
            }}
          >
            Display QR Code
          </Button>
        </Box>
      </Header>
      <>
        {showQR && (
          <div
            id="qr-backdrop"
            onClick={handleCloseQR}
            className="qrContainer"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              zIndex: 1000,
            }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
              <QRCodeCanvas
                value={`${process.env.REACT_APP_FRONTEND_BASE_URL}/dissonanceTest/${currentUserId}`}
                size={isSmallScreen ? 200 : 256}
                level={"H"}
                includeMargin={true}
              />
              <Typography
                variant="h6"
                style={{ color: "white", marginTop: "10px" }}
              >{`${process.env.REACT_APP_FRONTEND_BASE_URL}/dissonanceTest/${currentUserId}`}</Typography>
            </div>
          </div>
        )}
        <StyledTableContainer>
          {loading ? (
            <CircularProgress /> // Display a loading indicator while loading
          ) : (
            <TableContainer component={Paper} style={{ overflowX: "auto", marginTop: "50px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Education</TableCell>
                    <TableCell>Sentiment</TableCell>
                    <TableCell>Comfort Question First Answer</TableCell>
                    <TableCell>Comfort Question Displayed Average</TableCell>
                    <TableCell>Comfort Question Second Answer</TableCell>
                    <TableCell>Fare Question First Answer</TableCell>
                    <TableCell>Fare Question Displayed Average</TableCell>
                    <TableCell>Fare Question Second Answer</TableCell>
                    <TableCell>Extroversion</TableCell>
                    <TableCell>Agreeableness</TableCell>
                    <TableCell>Conscientiousness</TableCell>
                    <TableCell>Negative Emotionality</TableCell>
                    <TableCell>Open Mindedness</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Workload</TableCell>
                    <TableCell>Career Start</TableCell>
                    <TableCell>Flexibility</TableCell>
                    <TableCell>Star Sign</TableCell>
                    <TableCell>Rising Sign</TableCell>
                    <TableCell>Personality Test Answers</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>{participant.age}</TableCell>
                      <TableCell>{participant.gender}</TableCell>
                      <TableCell>{participant.education}</TableCell>
                      <TableCell>{participant.sentiment}</TableCell>
                      <TableCell>{participant.comfort_question_first_answer}</TableCell>
                      <TableCell>{participant.comfort_question_displayed_average}</TableCell>
                      <TableCell>{participant.comfort_question_second_answer}</TableCell>
                      <TableCell>{participant.fare_question_first_answer}</TableCell>
                      <TableCell>{participant.fare_question_displayed_average}</TableCell>
                      <TableCell>{participant.fare_question_second_answer}</TableCell>
                      <TableCell>
                        {participant.extroversion !== null
                          ? participant.extroversion.toFixed(2)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {participant.agreeableness !== null
                          ? participant.agreeableness.toFixed(2)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {participant.conscientiousness !== null
                          ? participant.conscientiousness.toFixed(2)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {participant.negative_emotionality !== null
                          ? participant.negative_emotionality.toFixed(2)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {participant.open_mindedness !== null
                          ? participant.open_mindedness.toFixed(2)
                          : "N/A"}
                      </TableCell>
                      <TableCell>{participant.created_at}</TableCell>
                      <TableCell>{participant.workload}</TableCell>
                      <TableCell>{participant.career_start}</TableCell>
                      <TableCell>{participant.flexibility}</TableCell>
                      <TableCell>{participant.star_sign}</TableCell>
                      <TableCell>{participant.rising_sign}</TableCell>
                      <TableCell>
                        {participant.personality_test_answers !== null
                          ? JSON.stringify(participant.personality_test_answers, null, 2).slice(
                              0,
                              20
                            ) + "..."
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleViewResults(participant.id)}
                          style={{
                            width: isSmallScreen ? "100%" : "auto",
                          }}
                        >
                          View Results
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </StyledTableContainer>
      </>
    </>
  );
};

export default DissonanceTestParticipantList;
