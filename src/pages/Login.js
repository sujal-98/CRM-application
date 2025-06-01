import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, Container, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { loginWithGoogle } from '../store/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();

  const handleGoogleLogin = () => {
    dispatch(loginWithGoogle());
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          XenoCRM
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ mt: 3, mb: 2 }}
          >
            Sign in with Google
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 