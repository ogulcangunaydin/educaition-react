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
import Header from "../components/Header";
import { StyledTableContainer } from "../styles/CommonStyles";
import fetchWithAuth from "../utils/fetchWithAuth";
import { QRCodeCanvas } from "qrcode.react";

const DissonanceTestParticipantList = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/dissonance_test_participants`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setParticipants(data); // Update the participants state with the fetched data
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

  const exportToCSV = () => {
    const headers = [
      "Email",
      "Age",
      "Gender",
      "Education",
      "Sentiment",
      "Comfort Question First Answer",
      "Comfort Question Second Answer",
      "Fare Question First Answer",
      "Fare Question Second Answer",
    ];

    const rows = participants.map((participant) => [
      participant.email,
      participant.age,
      participant.gender,
      participant.education,
      participant.sentiment,
      participant.comfort_question_first_answer,
      participant.comfort_question_second_answer,
      participant.fare_question_first_answer,
      participant.fare_question_second_answer,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dissonance_test_participants.csv");
    document.body.appendChild(link); // Required for FF

    link.click();
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
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <QRCodeCanvas
                value={`${process.env.REACT_APP_FRONTEND_BASE_URL}/dissonanceTest`}
                size={isSmallScreen ? 200 : 256}
                level={"H"}
                includeMargin={true}
              />
              <Typography
                variant="h6"
                style={{ color: "white", marginTop: "10px" }}
              >{`${process.env.REACT_APP_FRONTEND_BASE_URL}/dissonanceTest`}</Typography>
            </div>
          </div>
        )}
        <StyledTableContainer>
          {loading ? (
            <CircularProgress /> // Display a loading indicator while loading
          ) : (
            <TableContainer
              component={Paper}
              style={{ overflowX: "auto", marginTop: "50px" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Education</TableCell>
                    <TableCell>Sentiment</TableCell>
                    <TableCell>Comfort Question First Answer</TableCell>
                    <TableCell>Comfort Question Second Answer</TableCell>
                    <TableCell>Fare Question First Answer</TableCell>
                    <TableCell>Fare Question Second Answer</TableCell>
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
                      <TableCell>
                        {participant.comfort_question_first_answer}
                      </TableCell>
                      <TableCell>
                        {participant.comfort_question_second_answer}
                      </TableCell>
                      <TableCell>
                        {participant.fare_question_first_answer}
                      </TableCell>
                      <TableCell>
                        {participant.fare_question_second_answer}
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
