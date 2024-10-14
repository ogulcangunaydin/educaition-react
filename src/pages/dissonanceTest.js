import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Box,
  useMediaQuery,
  useTheme,
  Slider,
} from "@mui/material";
import {
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
} from "@mui/icons-material";
import Header from "../components/Header";
import { CenteredContainer } from "../styles/CommonStyles";
import taxiImage from "../assets/taxi.png";
import { useNavigate } from "react-router-dom";

const DissonanceTest = () => {
  const TAXI_COMFORT_QUESTION =
    "İstanbul’da taksi hizmeti (taksi bulma kolaylığı, yolculuk konforu, sürücü davranışı vb.) genel olarak sizin beklentilerinizi ne ölçüde karşılıyor?";
  const TAXI_FARES_QUESTION =
    "Sizce İstanbul’da aldığınız taksi hizmetinin kalitesi ile ücret dengesi ne ölçüde uyumlu?";

  const [step, setStep] = useState(1);
  const [sentiment, setSentiment] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [education, setEducation] = useState("");
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [showFakeError, setShowFakeError] = useState(false);

  const [comfortQuestionFirstAnswer, setComfortQuestionFirstAnswer] =
    useState(5);
  const [comfortQuestionSecondAnswer, setComfortQuestionSecondAnswer] =
    useState(comfortQuestionFirstAnswer);
  const [fareQuestionFirstAnswer, setFareQuestionFirstAnswer] = useState(5);
  const [fareQuestionSecondAnswer, setFareQuestionSecondAnswer] = useState(
    fareQuestionFirstAnswer
  );

  const [comfortQuestionAverage, setComfortQuestionAverage] = useState("");
  const [fareQuestionAverage, setFareQuestionAverage] = useState("");

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleNext = useCallback(() => {
    setStep(step + 1);
  }, [step]);

  useEffect(() => {
    if (step === 4) {
      const comfortAvg = getRandomAverage(
        parseInt(comfortQuestionFirstAnswer, 10)
      );
      const fareAvg = getRandomAverage(parseInt(fareQuestionFirstAnswer, 10));
      setComfortQuestionAverage(comfortAvg);
      setFareQuestionAverage(fareAvg);

      const timer = setTimeout(() => {
        handleNext();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [step, comfortQuestionFirstAnswer, fareQuestionFirstAnswer, handleNext]);

  useEffect(() => {
    if (step === 5) {
      // Simulate HTTP Error 504: Gateway Timeout after 5 seconds
      const timer = setTimeout(() => {
        setShowFakeError(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    setComfortQuestionSecondAnswer(comfortQuestionFirstAnswer);
    setFareQuestionSecondAnswer(fareQuestionFirstAnswer);
  }, [comfortQuestionFirstAnswer, fareQuestionFirstAnswer]);

  const comfortMarks = [
    {
      value: parseFloat(comfortQuestionAverage),
      label: `Ortalama: ${comfortQuestionAverage}`,
    },
  ];

  const fareMarks = [
    {
      value: parseFloat(fareQuestionAverage),
      label: `Ortalama: ${fareQuestionAverage}`,
    },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const participantData = {
        email,
        age: parseInt(age, 10),
        gender,
        education,
        sentiment: parseInt(sentiment, 10),
        comfort_question_first_answer: parseInt(comfortQuestionFirstAnswer, 10),
        fare_question_first_answer: parseInt(fareQuestionFirstAnswer, 10),
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/dissonance_test_participants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(participantData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setParticipant(data);

      handleNext();
    } catch (error) {
      console.error("Error submitting dissonance test:", error);
      setLoading(false);
    }
  };

  const handleSecondSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/dissonance_test_participants/${participant.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comfort_question_second_answer: parseInt(
              comfortQuestionSecondAnswer,
              10
            ),
            fare_question_second_answer: parseInt(fareQuestionSecondAnswer, 10),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      handleNext();
    } catch (error) {
      console.error("Error updating participant:", error);
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
    <SentimentVerySatisfied />,
  ];

  const getRandomAverage = (answer) => {
    const ranges = {
      1: [4, 5, 6, 7],
      2: [5, 6, 7, 8],
      3: [6, 7, 8, 9],
      4: [7, 8, 9, 1],
      5: [8, 9, 1, 2],
      6: [9, 1, 2, 3],
      7: [1, 2, 3, 4],
      8: [2, 3, 4, 5],
      9: [3, 4, 5, 6],
      10: [4, 5, 6, 7],
    };

    const randomValue =
      ranges[answer][Math.floor(Math.random() * ranges[answer].length)];
    const randomDigit = (Math.random() * 0.49 + 0.51).toFixed(2).slice(2);
    return `${randomValue}.${randomDigit}`;
  };

  return (
    <>
      <Header title="" />
      {loading ? (
        <CenteredContainer>
          <CircularProgress />
        </CenteredContainer>
      ) : (
        <CenteredContainer>
          <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
            {step === 1 && (
              <>
                <Typography variant="h6">
                  Kendinizi bugün nasıl hissediyorsunuz?
                </Typography>
                <RadioGroup
                  row
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
                >
                  {[...Array(10).keys()].map((num) => (
                    <FormControlLabel
                      key={num + 1}
                      value={(num + 1).toString()}
                      control={
                        <Radio
                          icon={sentimentIcons[num]}
                          checkedIcon={sentimentIcons[num]}
                        />
                      }
                      label={num + 1}
                    />
                  ))}
                </RadioGroup>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={!sentiment}
                  >
                    Sonraki
                  </Button>
                </Box>
              </>
            )}

            {step === 2 && (
              <>
                <Typography variant="h6">Email adresiniz:</Typography>
                <TextField
                  fullWidth
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Typography variant="h6">Yaşınız:</Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  inputProps={{ min: 0 }}
                />

                <Typography variant="h6">Cinsiyetiniz:</Typography>
                <TextField
                  fullWidth
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />

                <Typography variant="h6">Eğitim durumunuz:</Typography>
                <TextField
                  fullWidth
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />

                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={!email || !age || !education}
                  >
                    Sonraki
                  </Button>
                </Box>
              </>
            )}

            {step === 3 && (
              <>
                <img
                  src={taxiImage}
                  alt="Taxi"
                  style={{
                    width: isSmallScreen ? "100%" : "500px",
                    height: "auto",
                    marginBottom: "20px",
                  }}
                />
                <Typography variant="h6">{TAXI_COMFORT_QUESTION}</Typography>
                <Slider
                  value={comfortQuestionFirstAnswer}
                  onChange={(e, newValue) =>
                    setComfortQuestionFirstAnswer(Number(newValue))
                  }
                  aria-labelledby="comfort-question-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={10}
                />
                <Typography variant="h6">{TAXI_FARES_QUESTION}</Typography>
                <Slider
                  value={fareQuestionFirstAnswer}
                  onChange={(e, newValue) =>
                    setFareQuestionFirstAnswer(Number(newValue))
                  }
                  aria-labelledby="fare-question-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={10}
                />
                <Box mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={
                      loading ||
                      !comfortQuestionFirstAnswer ||
                      !fareQuestionFirstAnswer
                    }
                  >
                    Kaydet
                  </Button>
                </Box>
              </>
            )}

            {step === 4 && (
              <>
                <Box textAlign="center" mt={4}>
                  <Typography variant="h6">
                    Katılımınız için teşekkür ederiz!
                  </Typography>
                  <Box mt={2} mb={2}>
                    <Typography
                      variant="h4"
                      color="primary"
                      style={{ fontWeight: "bold" }}
                    >
                      Cevap ortalamaları:
                    </Typography>
                    <Typography
                      variant="h5"
                      color="primary"
                      style={{ fontWeight: "bold" }}
                    >
                      Taksi Hizmeti Konforu: {comfortQuestionAverage} (102 oy)
                    </Typography>
                    <Typography
                      variant="h5"
                      color="primary"
                      style={{ fontWeight: "bold" }}
                    >
                      Taksi Ücret Dengesi: {fareQuestionAverage} (102 oy)
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    Cevaplarınız kaydediliyor lütfen bekleyiniz...
                  </Typography>
                </Box>
              </>
            )}

            {step === 5 && (
              <>
                {showFakeError ? (
                  <>
                    <img
                      src={taxiImage}
                      alt="Taxi"
                      style={{
                        width: isSmallScreen ? "100%" : "500px",
                        height: "auto",
                        marginBottom: "20px",
                      }}
                    />
                    <Typography variant="h6">
                      {TAXI_COMFORT_QUESTION}
                    </Typography>
                    <Slider
                      value={comfortQuestionSecondAnswer}
                      onChange={(e, newValue) =>
                        setComfortQuestionSecondAnswer(Number(newValue))
                      }
                      aria-labelledby="comfort-question-second-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks={comfortMarks}
                      min={0}
                      max={10}
                      style={{
                        width: isSmallScreen ? "80%" : "100%",
                        padding: isSmallScreen ? "20px" : "20px",
                      }}
                    />
                    <Typography variant="h6">{TAXI_FARES_QUESTION}</Typography>
                    <Slider
                      value={fareQuestionSecondAnswer}
                      onChange={(e, newValue) =>
                        setFareQuestionSecondAnswer(Number(newValue))
                      }
                      aria-labelledby="fare-question-second-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks={fareMarks}
                      min={0}
                      max={10}
                      style={{
                        width: isSmallScreen ? "80%" : "100%",
                        padding: isSmallScreen ? "20px" : "20px",
                      }}
                    />
                    <Box mt={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSecondSubmit}
                        disabled={
                          !comfortQuestionSecondAnswer ||
                          !fareQuestionSecondAnswer
                        }
                      >
                        Submit
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box mb={2}>
                      <Typography variant="h6" color="error">
                        HTTP Error 504: Gateway Timeout
                      </Typography>
                      <Typography variant="body2" color="error">
                        Timestamp: {new Date().toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="error">
                        Request ID: {Math.random().toString(36)}
                      </Typography>
                    </Box>
                    <Box mt={4}>
                      <Typography variant="h5" color="textPrimary">
                        Server ilk sorunuzun cevabını kaydedemedi. Tekrar
                        cevaplandırabilir misiniz?
                      </Typography>
                    </Box>
                  </>
                )}
              </>
            )}

            {step === 6 && (
              <>
                <Typography variant="h6">
                  Cevaplarınız doğru şekilde kaydedildi.
                </Typography>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      navigate(`/personalitytest/participant/${participant.id}`)
                    }
                  >
                    Kişilik testini çözmek için tıklayın
                  </Button>
                </Box>
              </>
            )}
          </form>
        </CenteredContainer>
      )}
    </>
  );
};

export default DissonanceTest;
