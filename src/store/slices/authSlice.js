import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://crm-backend-y93k.onrender.com';
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'https://crm-application-ictu.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // Important for sessions
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  // Add timestamp to prevent caching
  config.params = {
    ...config.params,
    _t: Date.now()
  };
  
  // Add credentials
  config.withCredentials = true;
  
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Auth error detected, clearing state...');
      // Clear local state on auth errors
      localStorage.clear();
      sessionStorage.clear();
    }
    return Promise.reject(error);
  }
);

// Async thunks
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      // Redirect to Google OAuth with correct redirect URL
      window.location.href = `${API_URL}/api/auth/google?redirect_uri=${encodeURIComponent(FRONTEND_URL + '/auth/callback')}`;
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
      console.log('Making /me request...');
      
      // Get user data from /me endpoint with retry logic
      const maxRetries = 3;
      let lastError;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          const response = await api.get('/api/auth/me', {
            withCredentials: true
          });

          console.log('Response from /me:', response.data);

          // Check if user data is valid
          if (!response.data || !response.data.email) {
            console.error('Invalid user data received:', response.data);
            throw new Error('Invalid user data received');
          }

          // Read user data from cookie if available
          const userCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('user='));
          
          let userData = response.data;
          if (userCookie) {
            try {
              const cookieData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
              userData = { ...userData, ...cookieData };
            } catch (cookieError) {
              console.error('Error parsing user cookie:', cookieError);
            }
          }

          return userData;
        } catch (error) {
          console.error(`Auth callback attempt ${i + 1} failed:`, error);
          lastError = error;
          
          if (error.response?.status === 401 && i < maxRetries - 1) {
            console.log('Session not ready, waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw error;
        }
      }
      
      throw lastError;
    } catch (error) {
      console.error('Auth callback error in thunk:', error);
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
    console.log('Initializing auth state...');
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
      state.error = null;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
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
        console.log('Auth callback pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(handleAuthCallback.fulfilled, (state, action) => {
        console.log('Auth callback fulfilled:', action.payload);
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(handleAuthCallback.rejected, (state, action) => {
        console.error('Auth callback rejected:', action.payload);
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