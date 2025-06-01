const config = {
  apiUrl:  'https://crm-backend-y93k.onrender.com',
  isProduction: process.env.NODE_ENV === 'production',
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  cookieDomain: process.env.REACT_APP_COOKIE_DOMAIN || '.onrender.com'
};

export default config; 