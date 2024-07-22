import React, { useState, useEffect } from 'react';
import bigFiveTestQuestions from './BigFiveTest.txt';
import Header from '../../components/Header';
import { CenteredContainer } from '../../styles/CommonStyles';
import { Grid, Typography, Card, CardContent, CardActions, RadioGroup, FormControlLabel, Radio, Button, TextField, Box } from '@mui/material';
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
              <Box display="flex" justifyContent="center" marginBottom={"20px"}>
                <Typography variant="h5" component="h2">
                  {questions[currentQuestionIndex]}
                </Typography>
              </Box>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={2}>
                  <Typography>Completely Disagree</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Box display="flex" justifyContent="center">
                    <RadioGroup
                      row
                      aria-label={`question-${currentQuestionIndex}`}
                      name={`question-${currentQuestionIndex}`}
                      value={answers[currentQuestionIndex] || ''}
                      onChange={(event) => handleOptionChange(currentQuestionIndex, event.target.value)}
                      style={{ justifyContent: "center", display: "flex", flexWrap: "wrap" }} // Added styles to center the options
                    >
                      {[1, 2, 3, 4, 5].map((option) => (
                        <FormControlLabel key={option} value={option.toString()} control={<Radio />} label={option.toString()} />
                      ))}
                    </RadioGroup>
                  </Box>
                </Grid>
                <Grid item xs={2}>
                  <Typography>Completely Agree</Typography>
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
            </CardActions>
          </Card>
        )}
      </CenteredContainer>
    </>
  );
};

export default PersonalityTest;
