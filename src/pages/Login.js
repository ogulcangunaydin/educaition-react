import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { Button, TextField, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUniversity } from "../contexts/UniversityContext";

// Always use Haliç branding
const HALIC_LOGO = "/halic_universitesi_logo.svg";
const HALIC_PRIMARY_COLOR = "#001bc3";
const HALIC_GRADIENT_START = "#001bc3";
const HALIC_GRADIENT_END = "#0029e8";

// Styled components
const LoginContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${HALIC_GRADIENT_START} 0%, ${HALIC_GRADIENT_END} 100%)`,
  position: "relative",
  overflow: "hidden",
});

const LoginForm = styled(Paper)({
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  backgroundColor: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(10px)",
  zIndex: 1,
  minWidth: "400px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const Logo = styled("img")({
  width: "120px",
  height: "auto",
  marginBottom: "20px",
});

const StyledTextField = styled(TextField)({
  margin: "10px 0",
});

const StyledButton = styled(Button)({
  marginTop: "20px",
});

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUniversityFromUsername } = useUniversity();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/authenticate`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("current_user_id", data.current_user_id);
      localStorage.setItem("username", username);

      // Set university based on username suffix
      setUniversityFromUsername(username);

      navigate("/university-comparison");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  // Background logo component - always use Haliç logo
  const BackgroundLogo = styled(Box)({
    position: "absolute",
    width: "800px",
    height: "800px",
    backgroundImage: `url(${HALIC_LOGO})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    opacity: 0.08,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 0,
  });

  return (
    <LoginContainer>
      <BackgroundLogo />
      <LoginForm elevation={8}>
        <Logo src={HALIC_LOGO} alt="Haliç Üniversitesi" />
        <h2 style={{ margin: "0 0 30px 0", color: HALIC_PRIMARY_COLOR }}>
          Welcome to Educaition
        </h2>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <StyledTextField
            fullWidth
            label="Username"
            variant="outlined"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
          <StyledTextField
            fullWidth
            label="Password"
            variant="outlined"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
          <StyledButton
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Login
          </StyledButton>
        </form>
      </LoginForm>
    </LoginContainer>
  );
}

export default Login;
