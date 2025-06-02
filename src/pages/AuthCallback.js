import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { handleAuthCallback } from '../store/slices/authSlice';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get user data from /me endpoint
        const result = await dispatch(handleAuthCallback()).unwrap();
        
        if (result) {
          // Successful authentication
          navigate('/dashboard', { replace: true });
        } else {
          // Authentication failed
          navigate('/login', { 
            replace: true,
            state: { error: 'Authentication failed. Please try again.' }
          });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { 
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
    </Box>
  );
};

export default AuthCallback; 