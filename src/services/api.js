import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptors for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
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
    // Add any production-specific headers
    config.headers['X-Client-Version'] = process.env.REACT_APP_VERSION || '1.0.0';
    return config;
  });
}

export default api; 