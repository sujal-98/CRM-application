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
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 1000;
    let retryCount = 0;

    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handling... Attempt:', retryCount + 1);
        
        // Initial delay to ensure session is set
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        
        const result = await dispatch(handleAuthCallback()).unwrap();
        console.log('Auth callback result:', result);
        
        if (result && result.email) {
          console.log('Authentication successful, redirecting to dashboard...');
          navigate(config.auth.dashboardPath, { replace: true });
        } else {
          console.error('No user data in result:', result);
          
          // If we haven't exceeded max retries, try again
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
            setTimeout(handleCallback, RETRY_DELAY);
            return;
          }
          
          navigate(config.auth.loginPath, { 
            replace: true,
            state: { error: 'Authentication failed. Please try again.' }
          });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        console.error('Error details:', {
          response: error.response?.data,
          status: error.response?.status,
          message: error.message
        });
        
        // If we get a 401 and haven't exceeded max retries, try again
        if ((error.response?.status === 401 || error.response?.status === 403) && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Session not ready, retrying... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
          setTimeout(handleCallback, RETRY_DELAY);
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