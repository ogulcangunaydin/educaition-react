import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Button, TextField, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Styled components
const LoginContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
});

const StyledTextField = styled(TextField)({
  margin: '10px 0',
});

const StyledButton = styled(Button)({
  marginTop: '20px',
});

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/authenticate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      navigate('/rooms');
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  return (
  <LoginContainer>
    <h2>Welcome to Educaition</h2> {/* Caption added */}
    <form onSubmit={handleSubmit}>
      <StyledTextField
        fullWidth
        label="Username"
        variant="outlined"
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
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
  </LoginContainer>
);
}

export default Login;
