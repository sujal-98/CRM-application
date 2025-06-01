import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing session on app load
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUser(res.data.user);
      }).catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('userEmail', email);
    setUser({ email });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 