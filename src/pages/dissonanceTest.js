import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, RadioGroup, FormControlLabel, Radio, CircularProgress, Box } from '@mui/material';
import { SentimentVeryDissatisfied, SentimentDissatisfied, SentimentNeutral, SentimentSatisfied, SentimentVerySatisfied } from '@mui/icons-material';
import Header from '../components/Header';
import { CenteredContainer } from '../styles/CommonStyles';
import taxiImage from '../assets/taxi.png';
import { useNavigate, useParams } from 'react-router-dom';

const DissonanceTest = () => {
  const TAXI_COMFORT_QUESTION = 'İstanbul’da taksi hizmeti (taksi bulma kolaylığı, yolculuk konforu, sürücü davranışı vb.) genel olarak sizin beklentilerinizi ne ölçüde karşılıyor?';
  const TAXI_FARES_QUESTION = 'Sizce İstanbul’da aldığınız taksi hizmetinin kalitesi ile ücret dengesi ne ölçüde uyumlu?';

  const [step, setStep] = useState(1);
  const [sentiment, setSentiment] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('');
  const [income, setIncome] = useState('');
  const [variableQuestion, setVariableQuestion] = useState('');
  const [variableAnswer, setVariableAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [showFakeError, setShowFakeError] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  const navigate = useNavigate();
  const { participantId } = useParams();

  useEffect(() => {
    if (participantId) {
      // Fetch participant data from backend
      const fetchParticipant = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/dissonance_test_participants/${participantId}`, {
            method: 'GET',
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setParticipant(data);
          setVariableQuestion(data.question_variant);
          setStep(4); // Skip to the thank you step
        } catch (error) {
          console.error('Error fetching participant:', error);
        }
      };

      fetchParticipant();
    } else {
      // Set a random question if no participantId
      setVariableQuestion(Math.random() < 0.5 ? TAXI_COMFORT_QUESTION : TAXI_FARES_QUESTION);
    }
  }, [participantId]);

  useEffect(() => {
    if (step === 4) {
      // Automatically transition to step 5 after 5 seconds
      const timer = setTimeout(() => {
        setStep(5);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 5) {
      // Simulate HTTP Error 504: Gateway Timeout after 5 seconds
      const timer = setTimeout(() => {
        setShowFakeError(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const participantData = {
        email,
        age: parseInt(age, 10),
        gender,
        education,
        income: parseInt(income, 10),
        sentiment: parseInt(sentiment, 10),
        question_variant: variableQuestion,
        first_answer: parseInt(variableAnswer, 10),
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/dissonance_test_participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participantData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLoading(false);

      // Redirect to personality test with type as participant
      navigate(`/personalitytest/participant/${data.id}`);
    } catch (error) {
      console.error('Error submitting dissonance test:', error);
      setLoading(false);
    }
  };

  const handleSecondSubmit = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/dissonance_test_participants/${participantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ second_answer: parseInt(variableAnswer, 10) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowFinalMessage(true);
      setStep(6);
    } catch (error) {
      console.error('Error updating participant:', error);
    }
  };

  const sentimentIcons = [
    <SentimentVeryDissatisfied />,
    <SentimentVeryDissatisfied />,
    <SentimentDissatisfied />,
    <SentimentDissatisfied />,
    <SentimentNeutral />,
    <SentimentNeutral />,
    <SentimentSatisfied />,
    <SentimentSatisfied />,
    <SentimentVerySatisfied />,
    <SentimentVerySatisfied />
  ];

  return (
    <>
      <Header title="" />
      <CenteredContainer>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <Typography variant="h6">How are you feeling today?</Typography>
              <RadioGroup row value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
                {[...Array(10).keys()].map((num) => (
                  <FormControlLabel
                    key={num + 1}
                    value={(num + 1).toString()}
                    control={<Radio icon={sentimentIcons[num]} checkedIcon={sentimentIcons[num]} />}
                    label={num + 1}
                  />
                ))}
              </RadioGroup>
              <Box mt={2}>
                <Button variant="contained" color="primary" onClick={handleNext} disabled={!sentiment}>
                  Next
                </Button>
              </Box>
            </>
          )}

          {step === 2 && (
            <>
              <Typography variant="h6">Your email address:</Typography>
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Typography variant="h6">Your age:</Typography>
              <TextField
                fullWidth
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputProps={{ min: 0 }}
              />

              <Typography variant="h6">Your gender:</Typography>
              <TextField
                fullWidth
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />

              <Typography variant="h6">Your education:</Typography>
              <TextField
                fullWidth
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />

              <Typography variant="h6">Your income (₺):</Typography>
              <TextField
                fullWidth
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                inputProps={{ min: 0 }}
              />

              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={!email || !age || !education || !income}
                >
                  Next
                </Button>
              </Box>
            </>
          )}

          {step === 3 && (
            <>
              <img src={taxiImage} alt="Taxi" style={{ width: '500px', height: '500px', marginBottom: '20px' }} />
              <Typography variant="h6">{variableQuestion}</Typography>
              <RadioGroup row value={variableAnswer} onChange={(e) => setVariableAnswer(e.target.value)}>
                {[...Array(10).keys()].map((num) => (
                  <FormControlLabel key={num + 1} value={(num + 1).toString()} control={<Radio />} label={num + 1} />
                ))}
              </RadioGroup>
              <Box mt={2}>
                <Button type="submit" variant="contained" color="primary" disabled={loading || !variableAnswer}>
                  {loading ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
              </Box>
            </>
          )}

          {step === 4 && participant && (
            <>
              <Typography variant="h6">Thank you for your participation!</Typography>
              <Typography variant="body1">Random average result: 8.02 (102 votes)</Typography>
              <Typography variant="body1">Your answers are being submitted, please wait...</Typography>
            </>
          )}

          {step === 5 && (
            <>
              {showFakeError ? (
                <>
                  <Typography variant="h6">{variableQuestion}</Typography>
                  <RadioGroup row value={variableAnswer} onChange={(e) => setVariableAnswer(e.target.value)}>
                    {[...Array(10).keys()].map((num) => (
                      <FormControlLabel key={num + 1} value={(num + 1).toString()} control={<Radio />} label={num + 1} />
                    ))}
                  </RadioGroup>
                  <Box mt={2}>
                    <Button variant="contained" color="primary" onClick={handleSecondSubmit} disabled={!variableAnswer}>
                      Submit
                    </Button>
                  </Box>
                </>
              ) : (
                <><Typography variant="h6" color="error">HTTP Error 504: Gateway Timeout</Typography>
                  <Typography variant="body2" color="error">The server was unable to complete your request within the allotted time.</Typography>
                  <Typography variant="body2" color="error">Timestamp: {new Date().toLocaleString()}</Typography>
                  <Typography variant="body2" color="error">Request ID: {Math.random().toString(36)}</Typography></>
              )}
            </>
          )}

          {step === 6 && (
            <>
              <Typography variant="h6">Your answers are submitted correctly.</Typography>
              <Box mt={2}>
                <Button variant="contained" color="primary" onClick={() => navigate(`/dissonanceTestResult/${participantId}`)}>
                  Please click for personality test results
                </Button>
              </Box>
            </>
          )}
        </form>
      </CenteredContainer>
    </>
  );
};

export default DissonanceTest;