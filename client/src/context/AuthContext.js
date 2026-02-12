import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jobconnect_token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await apiGet('/auth/me');
      setUser(data.user || data);
    } catch (err) {
      console.error('Failed to load user:', err);
      localStorage.removeItem('jobconnect_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const data = await apiPost('/auth/login', { email, password });
    const newToken = data.token;
    const loggedInUser = data.user;
    localStorage.setItem('jobconnect_token', newToken);
    setToken(newToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (formData) => {
    const data = await apiPost('/auth/register', formData);
    const newToken = data.token;
    const newUser = data.user;
    localStorage.setItem('jobconnect_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('jobconnect_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
