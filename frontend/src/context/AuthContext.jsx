import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/client';
import { AuthContext } from './ContextBase';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Initialize Auth Sync
  useEffect(() => {
    const bootstrapAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        if (storedToken && storedUsername) {
          setUser({ token: storedToken, username: storedUsername }); 
        }
      } catch (e) {
        console.error("Auth hydration failed:", e);
      } finally {
        setLoading(false);
      }
    };
    bootstrapAuth();
  }, [token]);

  const login = useCallback(async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const res = await api.post('/login', formData);
    const newToken = res.data.access_token;
    const userProfile = { token: newToken, username: res.data.username };
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', res.data.username);
    
    setToken(newToken);
    setUser(userProfile);
    return res.data;
  }, []);

  const signup = useCallback(async (username, password) => {
    await api.post(`/signup?username=${username}&password=${password}`);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    login,
    signup,
    logout,
    loading
  }), [user, token, login, signup, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
