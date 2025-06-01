import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const GoogleAuth = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      // Redirect to backend Google OAuth flow
      window.location.href = `${API_URL}/api/auth/google`;
    } catch (error) {
      console.error('Authentication error:', error);
      // TODO: Show error message to user
    }
  };

  const handleError = () => {
    console.error('Login Failed');
    // TODO: Show error message to user
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: theme.palette.primary.main, mb: 3 }}
        >
          Welcome to XenoCRM
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
          Sign in with your Google account to access the CRM platform
        </Typography>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
          theme="filled_blue"
          shape="rectangular"
          text="signin_with"
          size="large"
          width="280"
        />
      </Paper>
    </Box>
  );
};

export default GoogleAuth; 