import React, { useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import theme from './theme';
import { initializeAuth } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Segments from './pages/Segments';
import CreateSegment from './pages/CreateSegment';
import RuleBuilder from './pages/RuleBuilder';
import Campaigns from './pages/Campaigns';
import CampaignHistory from './pages/CampaignHistory';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import axios from 'axios';
import ErrorBoundary from './components/ErrorBoundary';
import { Sidebar } from './components/layout/Sidebar';
import { FlowSegmentBuilder } from './components/segments/FlowSegmentBuilder';

const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status when app loads
    dispatch(initializeAuth());
    // Configure axios defaults
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }, [dispatch]);

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
              />
              
              {/* Auth callback route */}
              <Route 
                path="/auth/callback"
                element={<AuthCallback />}
              />
              
              {/* Root route - redirect based on auth status */}
              <Route 
                path="/" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
              />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/segments" element={<Segments />} />
                  <Route path="/segments/create" element={<CreateSegment />} />
                  <Route path="/rule-builder" element={<RuleBuilder />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/campaign-history" element={<CampaignHistory />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
