import React, { useState, useEffect } from 'react';
import bigFiveTestQuestions from './BigFiveTest.txt';
import Header from '../../components/Header';
import { CenteredContainer } from '../../styles/CommonStyles';
import { useTheme, useMediaQuery, Grid, Typography, Card, CardContent, CardActions, RadioGroup, FormControlLabel, Radio, Button, TextField, Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';


const PersonalityTest = () => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [playerId, setPlayerId] = useState(null); // Updated to use useState
  const [isPlayerInfoSaved, setIsPlayerInfoSaved] = useState(false); // New state variable
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const validator = require('validator');

  const { roomId } = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(bigFiveTestQuestions);
        const text = await response.text();
        const questionsArray = text.split('\n').filter(Boolean);
        setQuestions(questionsArray);
      } catch (error) {
        console.error('Failed to fetch questions', error);
      }
    };

    fetchQuestions();
  }, []);

  const handleOptionChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    // Automatically move to the next question if not the last question
    if (index < questions.length - 1) {
      setCurrentQuestionIndex(index + 1);
    }
  };

  const handleNext = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleBack = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleSavePlayer = async (event) => {
    event.preventDefault();
    setNameError('');

    try {
      const createPlayerForm = new FormData();
      const sanitized_name = validator.escape(name);
      const cleaned_name = sanitized_name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');

      createPlayerForm.append('player_name', cleaned_name);
      createPlayerForm.append('room_id', roomId);

      const createPlayerResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/players`, {
        method: 'POST',
        body: createPlayerForm,
      });
      if (!createPlayerResponse.ok) {
        throw new Error('Player Name is already taken. Please choose a different name.');
      }

      const data = await createPlayerResponse.json();
      setPlayerId(data.id); // Update playerId state
      setIsPlayerInfoSaved(true); // Set flag to true as player info is now saved
    } catch (error) {
      if (error.message.includes('Player Name')) {
        setNameError(error.message);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting answers:', JSON.stringify(answers));
      const formBody = new FormData();
      formBody.append('answers', JSON.stringify(answers));

      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/players/${playerId}/personality`, {
        method: 'POST',
        body: formBody
      });
      if (!response.ok) {
        throw new Error('Failed to save survey.');
      }
      navigate(`/tacticpreparation/${roomId}`, { state: { playerId: playerId } });
    } catch (error) {
      console.error('Failed to save survey: ' + error.message);
    }
  };

  const handleSkip = () => {
    navigate(`/tacticpreparation/${roomId}`, { state: { playerId: playerId } });
  };

  return (
    <>
      <Header title={"Personality Test"} />
      <CenteredContainer>
        {!isPlayerInfoSaved ? (
          <form onSubmit={handleSavePlayer}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              margin="normal"
              fullWidth
              error={!!nameError}
              helperText={nameError}
            />
            <Button type="submit" variant="contained" color="primary">
              Save My Name
            </Button>
          </form>
        ) : (
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="center" marginBottom={isSmallScreen ? "10px" : "20px"}>
                <Typography variant={isSmallScreen ? "h6" : "h5"} component="h2">
                  {questions[currentQuestionIndex]}
                </Typography>
              </Box>
              <Grid container alignItems="center" spacing={isSmallScreen ? 1 : 2}>
                <Grid item xs={12} sm={2} style={{ display: 'flex', justifyContent: 'flex-start' }}> {/* Adjust for small screens */}
                  <Typography align="left">Completely Disagree</Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Box display="flex" justifyContent="center">
                    <RadioGroup
                      row
                      aria-label={`question-${currentQuestionIndex}`}
                      name={`question-${currentQuestionIndex}`}
                      value={answers[currentQuestionIndex] || ''}
                      onChange={(event) => handleOptionChange(currentQuestionIndex, event.target.value)}
                      style={{ justifyContent: "center", display: "flex", flexWrap: "wrap" }}
                    >
                      {[1, 2, 3, 4, 5].map((option) => (
                        <FormControlLabel key={option} value={option.toString()} control={<Radio />} label={option.toString()} />
                      ))}
                    </RadioGroup>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2} style={{ display: 'flex', justifyContent: 'flex-end' }}> {/* Adjust for small screens */}
                  <Typography align="right">Completely Agree</Typography>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions style={{ justifyContent: 'space-between' }}>
              {currentQuestionIndex > 0 ? (
                <Button variant="contained" onClick={handleBack}>
                  Back
                </Button>
              ) : (
                <div style={{ flex: 1 }}></div> // Spacer element
              )}
              {currentQuestionIndex === questions.length - 1 ? (
                answers[currentQuestionIndex] && (
                  <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Submit
                  </Button>
                )
              ) : (
                answers[currentQuestionIndex] && (
                  <Button variant="contained" color="primary" onClick={handleNext}>
                    Next
                  </Button>
                )
              )}
              <Button variant="contained" onClick={handleSkip}>
                Skip to Tactic Preparation
              </Button>
            </CardActions>
          </Card>
        )}
      </CenteredContainer>
    </>
  );
};

export default PersonalityTest;
