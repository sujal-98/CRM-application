import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiUrl || 'https://crm-backend-y93k.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0'
  }
});

// Add request interceptor
api.interceptors.request.use((config) => {
  // Add timestamp to prevent caching
  config.params = {
    ...config.params,
    _t: Date.now()
  };

  // Add CORS headers
  config.withCredentials = true;

  // Ensure we're using the correct API URL by removing any 'undefined' segments
  if (config.url) {
    // Remove any 'undefined' segments from the URL
    config.url = config.url.replace(/\/undefined\//g, '/').replace(/\/+/g, '/');
    
    // Ensure the URL starts with /api/
    if (!config.url.startsWith('/api/') && !config.url.startsWith('http')) {
      config.url = `/api/${config.url.replace(/^\/+/, '')}`;
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      // Handle unauthorized access
      const currentPath = window.location.hash.substring(1);
      if (currentPath !== '/login' && !currentPath.includes('/auth/callback')) {
        window.location.href = '/#/login';
      }
    } else if (!error.response && error.message === 'Network Error') {
      console.error('API Connection Error:', error);
      // Show user-friendly error message
      window.dispatchEvent(new CustomEvent('showError', { 
        detail: 'Unable to connect to the server. Please check your internet connection.' 
      }));
    }
    return Promise.reject(error);
  }
);

// Production-specific configuration
if (config.isProduction) {
  api.interceptors.request.use((config) => {
    // Ensure we're using the correct API URL
    if (!config.url.startsWith('http')) {
      config.url = config.url.replace(/\/+/g, '/'); // Remove duplicate slashes
    }
    
    return config;
  });
}

export default api; 