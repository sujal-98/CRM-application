const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'https://crm-application-ictu.onrender.com',
  frontendUrl: process.env.REACT_APP_FRONTEND_URL || 'https://crm-application-ictu.onrender.com',
  isProduction: process.env.NODE_ENV === 'production',
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  cookieDomain: process.env.REACT_APP_COOKIE_DOMAIN || '.onrender.com',
  auth: {
    callbackPath: '/auth/callback',
    loginPath: '/login',
    dashboardPath: '/dashboard'
  }
};

// Validate production URLs
if (config.isProduction && window.location.hostname === 'localhost') {
  console.warn('Running in production mode but on localhost');
}

export default config; 