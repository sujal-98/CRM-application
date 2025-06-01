import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

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
      // Use frontend callback URL instead of backend directly
      const callbackUrl = `${window.location.origin}/auth/callback`;
      const encodedCallback = encodeURIComponent(callbackUrl);
      window.location.href = `${API_URL}/api/auth/google?callback=${encodedCallback}`;
      return new Promise(() => {}); // This promise will never resolve due to redirect
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const handleAuthCallback = createAsyncThunk(
  'auth/handleCallback',
  async (_, { dispatch }) => {
    try {
      // Get user data from /me endpoint
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error;
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
    // Immediately redirect to login before doing anything else
    window.location.href = '/login';
    
    try {
      // Call logout endpoint with credentials and cache control
      await api.post('/api/auth/logout', {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      // Clear ALL browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear ALL cookies with proper domain and expiration
      const domain = window.location.hostname;
      const cookiesToClear = [
        'xeno.sid',
        'connect.sid',
        'session',
        'auth',
        'token',
        'google_oauth_state',
        'google_oauth_code',
        'google_oauth_token',
        'google_oauth_refresh_token'
      ];

      // Clear all cookies in the document
      document.cookie.split(";").forEach(cookie => {
        const [name] = cookie.trim().split("=");
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=www.${domain}`;
      });

      // Also clear our known cookies explicitly
      cookiesToClear.forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=www.${domain}`;
      });

      // Clear axios and any cached data
      delete api.defaults.headers.common['Authorization'];
      api.interceptors.request.handlers = [];
      api.interceptors.response.handlers = [];

      // Force clear any Google OAuth state
      if (window.gapi) {
        try {
          window.gapi.auth2.getAuthInstance().signOut();
          window.gapi.auth2.getAuthInstance().disconnect();
        } catch (e) {
          console.error('Error clearing Google auth:', e);
        }
      }

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if the server call fails, clear everything
      localStorage.clear();
      sessionStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      
      // Clear all cookies
      const domain = window.location.hostname;
      document.cookie.split(";").forEach(cookie => {
        const [name] = cookie.trim().split("=");
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=www.${domain}`;
      });
      
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