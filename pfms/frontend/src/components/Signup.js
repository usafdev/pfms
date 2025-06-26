import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Typography, Button, Container, Box, Fade } from '@mui/material';
// Inputs
const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/auth/signup', {
        username,
        password
      });

      // Redirecting to login page
      navigate('/login');
    } catch (error) {
      console.error('Signup failed', error);
    }
  };

  return (
    <Fade in>
      <Container maxWidth="sm">
        <Box mt={8}>
          <Typography variant="h4" align="center" gutterBottom>Signup</Typography>
          <form onSubmit={handleSignup}>
            <Box mb={2}>
              <TextField
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
            <Box mb={2}>
              <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
              />
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Signup
            </Button>
          </form>
        </Box>
      </Container>
    </Fade>
  );
};

export default Signup;