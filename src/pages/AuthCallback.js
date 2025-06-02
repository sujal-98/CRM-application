import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { handleAuthCallback } from '../store/slices/authSlice';
import { Box, CircularProgress, Typography } from '@mui/material';
import config from '../config';

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handling...');
        
        // Add a small delay to ensure the session is properly set
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get user data from /me endpoint
        const result = await dispatch(handleAuthCallback()).unwrap();
        console.log('Auth callback result:', result);
        
        if (result && result.email) {
          console.log('Authentication successful, redirecting to dashboard...');
          // Successful authentication
          navigate(config.auth.dashboardPath, { replace: true });
        } else {
          console.error('No user data in result:', result);
          // Authentication failed
          navigate(config.auth.loginPath, { 
            replace: true,
            state: { error: 'Authentication failed. No user data received.' }
          });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        console.error('Error details:', {
          response: error.response?.data,
          status: error.response?.status,
          message: error.message
        });
        
        // If we get a 401, the session might not be ready yet, try again
        if (error.response?.status === 401) {
          console.log('Session not ready, retrying...');
          setTimeout(() => handleCallback(), 1000);
          return;
        }
        
        navigate(config.auth.loginPath, { 
          replace: true,
          state: { 
            error: error.response?.data?.message || 
                  error.message || 
                  'Authentication failed. Please try again.' 
          }
        });
      }
    };

    handleCallback();
  }, [dispatch, navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="h6" color="text.secondary">
        Completing authentication...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we set up your session...
      </Typography>
    </Box>
  );
};

export default AuthCallback; 