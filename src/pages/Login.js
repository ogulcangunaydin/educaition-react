import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { Button, TextField, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Styled components
const LoginContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #001bc3 0%, #0029e8 100%)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    width: "800px",
    height: "800px",
    backgroundImage: "url(/halic_universitesi_logo.svg)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    opacity: 0.08,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 0,
  },
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

      navigate("/university-comparison");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <LoginContainer>
      <LoginForm elevation={8}>
        <Logo src="/halic_universitesi_logo.svg" alt="Haliç Üniversitesi" />
        <h2 style={{ margin: "0 0 30px 0", color: "#001bc3" }}>
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
