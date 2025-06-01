import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 