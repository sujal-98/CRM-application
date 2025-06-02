import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timestamp to prevent caching
  params: {
    _t: Date.now()
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
  config.headers['Cache-Control'] = 'no-cache';
  config.headers['Pragma'] = 'no-cache';

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add interceptors for error handling
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

// Add request interceptor for production API
if (config.isProduction) {
  api.interceptors.request.use((config) => {
    // Add production-specific headers
    config.headers['X-Client-Version'] = process.env.REACT_APP_VERSION || '1.0.0';
    
    // Ensure we're using the correct API URL
    if (!config.url.startsWith('http')) {
      config.url = `${config.apiUrl}${config.url}`;
    }
    
    return config;
  });
}

export default api; 