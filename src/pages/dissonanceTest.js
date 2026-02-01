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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { useNavigate, useParams } from "react-router-dom";
import careerImage from "../assets/career.jpeg";

const DissonanceTest = () => {
  const TAXI_COMFORT_QUESTION =
    "İstanbul’da taksi hizmeti (taksi bulma kolaylığı, yolculuk konforu, sürücü davranışı vb.) genel olarak sizin beklentilerinizi ne ölçüde karşılıyor?";
  const TAXI_FARES_QUESTION =
    "Sizce İstanbul’da aldığınız taksi hizmetinin kalitesi ile ücret dengesi ne ölçüde uyumlu?";

  const educationOptions = [
    "lise mezunu",
    "lise öğrencisi",
    "üniversite öğrencisi",
    "üniversite mezunu",
    "y.lisans öğrencisi ve üzeri",
  ];

  const starSignOptions = [
    "Koç",
    "Boğa",
    "İkizler",
    "Yengeç",
    "Aslan",
    "Başak",
    "Terazi",
    "Akrep",
    "Yay",
    "Oğlak",
    "Kova",
    "Balık",
  ];

  const { currentUserId } = useParams();

  const [step, setStep] = useState(1);
  const [sentiment, setSentiment] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [education, setEducation] = useState("");
  const [workload, setWorkload] = useState(5);
  const [careerStart, setCareerStart] = useState(5);
  const [flexibility, setFlexibility] = useState(5);
  const [starSign, setStarSign] = useState("");
  const [risingSign, setRisingSign] = useState("");

  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [showFakeError, setShowFakeError] = useState(false);

  const [comfortQuestionFirstAnswer, setComfortQuestionFirstAnswer] = useState(0);
  const [comfortQuestionSecondAnswer, setComfortQuestionSecondAnswer] = useState(0);
  const [fareQuestionFirstAnswer, setFareQuestionFirstAnswer] = useState(0);
  const [fareQuestionSecondAnswer, setFareQuestionSecondAnswer] = useState(0);

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
      const comfortAvg = getRandomAverage(parseInt(comfortQuestionFirstAnswer, 10));
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

  const comfortMarks = [
    {
      value: parseFloat(comfortQuestionAverage),
      label: `Ort: ${comfortQuestionAverage}`,
    },
  ];

  const fareMarks = [
    {
      value: parseFloat(fareQuestionAverage),
      label: `Ort: ${fareQuestionAverage}`,
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
        user_id: parseInt(currentUserId, 10),
        workload: parseInt(workload, 10),
        career_start: parseInt(careerStart, 10),
        flexibility: parseInt(flexibility, 10),
        star_sign: starSign,
        rising_sign: risingSign,
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
            comfort_question_second_answer: parseInt(comfortQuestionSecondAnswer, 10),
            fare_question_second_answer: parseInt(fareQuestionSecondAnswer, 10),
            comfort_question_displayed_average: parseFloat(comfortQuestionAverage, 10),
            fare_question_displayed_average: parseFloat(fareQuestionAverage, 10),
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

    const randomValue = ranges[answer][Math.floor(Math.random() * ranges[answer].length)];
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
                <Box textAlign="center" mb={4}>
                  <img
                    src={careerImage}
                    alt="Career"
                    style={{
                      width: "100%",
                      maxWidth: "500px",
                      height: "auto",
                      marginBottom: "20px",
                    }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Kariyer yolculuğunuz için eğlenceli bir keşfe çıkın! Yaşınız, kişilik
                    özellikleriniz ve burcunuzdan yola çıkarak, size en uygun meslekler üzerine
                    beyin fırtınası yapacak, keyifli bir plan oluşturacağız! Unutmayın, sonuçlar
                    ilham verici ancak iddialı değil!
                  </Typography>
                </Box>
                <Typography variant="h6">
                  Sizce İstanbul'daki taksi sorunu ne kadar önemli?
                </Typography>
                <RadioGroup row value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
                  {[...Array(10).keys()].map((num) => (
                    <FormControlLabel
                      key={num + 1}
                      value={(num + 1).toString()}
                      control={
                        <Radio icon={sentimentIcons[num]} checkedIcon={sentimentIcons[num]} />
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
              <Box mt={30}>
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
                <TextField fullWidth value={gender} onChange={(e) => setGender(e.target.value)} />

                <Typography variant="h6">Eğitim durumunuz:</Typography>
                <FormControl fullWidth>
                  <InputLabel id="education-label">Eğitim Durumu</InputLabel>
                  <Select
                    labelId="education-label"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    label="Eğitim Durumu"
                  >
                    {educationOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="h6">Burcunuz:</Typography>
                <FormControl fullWidth>
                  <InputLabel id="star-sign-label">Burç</InputLabel>
                  <Select
                    labelId="star-sign-label"
                    value={starSign}
                    onChange={(e) => setStarSign(e.target.value)}
                    label="Burç"
                  >
                    {starSignOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="h6">Yükselen Burcunuz:</Typography>
                <FormControl fullWidth>
                  <InputLabel id="rising-sign-label">Yükselen Burç</InputLabel>
                  <Select
                    labelId="rising-sign-label"
                    value={risingSign}
                    onChange={(e) => setRisingSign(e.target.value)}
                    label="Yükselen Burç"
                  >
                    {starSignOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="h6" gutterBottom>
                  Beni motive edecek çalışma temposu:
                </Typography>
                <Slider
                  value={workload}
                  onChange={(e, newValue) => setWorkload(newValue)}
                  aria-labelledby="workload-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks={[
                    { value: 1, label: "Rahat" },
                    { value: 10, label: "Yoğun" },
                  ]}
                  min={1}
                  max={10}
                />

                <Typography variant="h6" gutterBottom>
                  Kariyerim ilk başlarda nasıl olsun:
                </Typography>
                <Slider
                  value={careerStart}
                  onChange={(e, newValue) => setCareerStart(newValue)}
                  aria-labelledby="career-start-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks={[
                    { value: 1, label: "Kolay" },
                    { value: 10, label: "Zor" },
                  ]}
                  min={1}
                  max={10}
                />

                <Typography variant="h6" gutterBottom>
                  Seçeceğim mesleğimin esnekliği nasıl olsun:
                </Typography>
                <Slider
                  value={flexibility}
                  onChange={(e, newValue) => setFlexibility(newValue)}
                  aria-labelledby="flexibility-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks={[
                    { value: 1, label: "Katı" },
                    { value: 10, label: "Esnek" },
                  ]}
                  min={1}
                  max={10}
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
              </Box>
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
                  onChange={(e, newValue) => setComfortQuestionFirstAnswer(Number(newValue))}
                  aria-labelledby="comfort-question-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={10}
                />
                <Typography variant="h6">{TAXI_FARES_QUESTION}</Typography>
                <Slider
                  value={fareQuestionFirstAnswer}
                  onChange={(e, newValue) => setFareQuestionFirstAnswer(Number(newValue))}
                  aria-labelledby="fare-question-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={10}
                />
                <Box mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !comfortQuestionFirstAnswer || !fareQuestionFirstAnswer}
                  >
                    Kaydet
                  </Button>
                </Box>
              </>
            )}

            {step === 4 && (
              <>
                <Box textAlign="center" mt={4}>
                  <Typography variant="h6">Katılımınız için teşekkür ederiz!</Typography>
                  <Box mt={2} mb={2}>
                    <Typography variant="h4" color="primary" style={{ fontWeight: "bold" }}>
                      Cevap ortalamaları:
                    </Typography>
                    <Typography variant="h5" color="primary" style={{ fontWeight: "bold" }}>
                      Taksi Hizmeti Konforu: {comfortQuestionAverage} (102 oy)
                    </Typography>
                    <Typography variant="h5" color="primary" style={{ fontWeight: "bold" }}>
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
                    <Typography variant="h6">{TAXI_COMFORT_QUESTION}</Typography>
                    <Box textAlign="center" mb={2}>
                      <Typography variant="h5" color="primary" style={{ fontWeight: "bold" }}>
                        Ortalama: {comfortQuestionAverage} (102 oy)
                      </Typography>
                    </Box>
                    <Slider
                      value={comfortQuestionSecondAnswer}
                      onChange={(e, newValue) => setComfortQuestionSecondAnswer(Number(newValue))}
                      aria-labelledby="comfort-question-second-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks={comfortMarks}
                      min={1}
                      max={10}
                      style={{
                        width: isSmallScreen ? "80%" : "100%",
                        padding: isSmallScreen ? "20px" : "20px",
                      }}
                    />
                    <Typography variant="h6">{TAXI_FARES_QUESTION}</Typography>
                    <Box textAlign="center" mb={2}>
                      <Typography variant="h5" color="primary" style={{ fontWeight: "bold" }}>
                        Ortalama: {fareQuestionAverage} (102 oy)
                      </Typography>
                    </Box>
                    <Slider
                      value={fareQuestionSecondAnswer}
                      onChange={(e, newValue) => setFareQuestionSecondAnswer(Number(newValue))}
                      aria-labelledby="fare-question-second-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks={fareMarks}
                      min={1}
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
                        disabled={!comfortQuestionSecondAnswer || !fareQuestionSecondAnswer}
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
                        Server ilk sorunuzun cevabını kaydedemedi. Tekrar cevaplandırabilir misiniz?
                      </Typography>
                    </Box>
                  </>
                )}
              </>
            )}

            {step === 6 && (
              <>
                <Typography variant="h6">Cevaplarınız doğru şekilde kaydedildi.</Typography>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/personalitytest/participant/${participant.id}`)}
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
