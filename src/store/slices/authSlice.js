import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://crm-backend-y93k.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // Important for sessions
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Async thunks
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      // Redirect to Google OAuth
      window.location.href = `${API_URL}/api/auth/google`;
      return new Promise(() => {}); // This promise will never resolve due to redirect
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const handleAuthCallback = createAsyncThunk(
  'auth/handleCallback',
  async (_, { rejectWithValue }) => {
    try {
      // Get user data from /me endpoint
      const response = await api.get('/api/auth/me', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No user data received');
      }

      // Store user data in Redux state
      return response.data;
    } catch (error) {
      console.error('Auth callback error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to authenticate'
      );
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Authentication check failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call the logout endpoint with credentials
      await api.post('/api/auth/logout', {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Clear all local storage
      localStorage.clear();
      
      // Clear all session storage
      sessionStorage.clear();
      
      // Clear axios defaults
      delete api.defaults.headers.common['Authorization'];
      
      // Clear cookies with proper domain and path
      const domain = window.location.hostname;
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/;domain=${domain}`);
      });
      
      // Force reload to clear any remaining state
      window.location.href = '/login';
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the server call fails, we should still clear local state
      localStorage.clear();
      sessionStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      
      // Force reload to clear any remaining state
      window.location.href = '/login';
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to logout'
      );
    }
  }
);

// Add a thunk to initialize auth state
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    await dispatch(checkAuth());
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  initialized: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.loading = false;
        state.initialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        state.initialized = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
        state.initialized = true;
      })
      // Handle Callback
      .addCase(handleAuthCallback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleAuthCallback.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(handleAuthCallback.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer; 