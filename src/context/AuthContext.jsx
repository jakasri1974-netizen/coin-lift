import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('coinlift_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiRequest('/auth/me');
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.warn('Failed to verify authentication token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        localStorage.setItem('coinlift_token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password, role) => {
    setError(null);
    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        localStorage.setItem('coinlift_token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('coinlift_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
