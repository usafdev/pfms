import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Typography, Button, Container, Box, Fade } from '@mui/material';
// Inputs
const Login = ({ setUsername }) => {
  const [username, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password
      });

      // Store token, username, and userId in local storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', response.data.userId); // Store userId

      // Update App.js state with logged in username
      setUsername(username);

      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <Fade in>
      <Container maxWidth="sm">
        <Box mt={8}>
          <Typography variant="h4" align="center" gutterBottom>Login</Typography>
          <form onSubmit={handleLogin}>
            <Box mb={2}>
              <TextField
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                fullWidth
              />
            </Box>
            <Box mb={2}>
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </form>
        </Box>
      </Container>
    </Fade>
  );
};

export default Login;