import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { StyledTableContainer } from '../styles/CommonStyles';
import fetchWithAuth from '../utils/fetchWithAuth';
import { QRCodeCanvas } from 'qrcode.react';

const DissonanceTestParticipantList = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetchWithAuth(`${process.env.REACT_APP_BACKEND_BASE_URL}/dissonance_test_participants`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setParticipants(data); // Update the participants state with the fetched data
        setLoading(false);
      } catch (error) {
        console.error('Error fetching participants:', error);
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
    if (e.target.id === 'qr-backdrop') {
      setShowQR(false);
    }
  };

  const handleViewResults = (participantId) => {
    navigate(`/dissonanceTestResult/${participantId}`);
  };

  return (
    <>
      <Header title="Dissonance Test Participants">
        <Button
          variant="contained"
          onClick={handleShowQR}
          style={{
            marginRight: '20px',
          }}
        >
          Display QR Code
        </Button>
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
                value={`${process.env.REACT_APP_FRONTEND_BASE_URL}/dissonanceTest`}
                size={256}
                level={"H"}
                includeMargin={true}
              />
              <Typography variant="h6" style={{ color: 'white' }}>{`${process.env.REACT_APP_FRONTEND_BASE_URL}/dissonanceTest`}</Typography>
            </div>
          </div>
        )}
        <StyledTableContainer>
          {loading ? (
            <CircularProgress /> // Display a loading indicator while loading
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Education</TableCell>
                    <TableCell>Income (₺)</TableCell>
                    <TableCell>Sentiment</TableCell>
                    <TableCell>Question Variant</TableCell>
                    <TableCell>First Answer</TableCell>
                    <TableCell>Second Answer</TableCell>
                    <TableCell>Actions</TableCell> {/* New column header for the button */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.email}>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>{participant.age}</TableCell>
                      <TableCell>{participant.gender}</TableCell>
                      <TableCell>{participant.education}</TableCell>
                      <TableCell>{participant.income}</TableCell>
                      <TableCell>{participant.sentiment}</TableCell>
                      <TableCell>{participant.question_variant}</TableCell>
                      <TableCell>{participant.first_answer}</TableCell>
                      <TableCell>{participant.second_answer}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleViewResults(participant.id)}
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