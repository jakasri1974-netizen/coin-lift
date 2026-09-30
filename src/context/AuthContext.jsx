import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, getToken, setToken, removeToken, getCurrentUser, setCurrentUser, removeCurrentUser } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Auto connect/disconnect socket based on auth lifecycle
  useEffect(() => {
    if (user && token) {
      connectSocket();
    } else if (!token) {
      disconnectSocket();
    }
  }, [user, token]);

  // Restore session on page load/refresh by fetching /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          setProfile(res.data.profile || null);
          setCurrentUser(res.data.user);
          connectSocket();
        } else {
          // Token invalid/expired
          authService.logout();
          setUser(null);
          setProfile(null);
          setTokenState(null);
          disconnectSocket();
        }
      } catch (err) {
        console.warn('[Auth System] Token validation failed:', err.message);
        authService.logout();
        setUser(null);
        setProfile(null);
        setTokenState(null);
        disconnectSocket();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        setTokenState(res.data.token);
        
        // Fetch full verified profile via /api/auth/me
        try {
          const meRes = await authService.getMe();
          if (meRes.success && meRes.data?.user) {
            setUser(meRes.data.user);
            setProfile(meRes.data.profile || null);
            setCurrentUser(meRes.data.user);
          } else {
            setUser(res.data);
            setCurrentUser(res.data);
          }
        } catch (meErr) {
          setUser(res.data);
          setCurrentUser(res.data);
        }

        connectSocket();
        return res;
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid credentials');
      throw err;
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        setTokenState(res.data.token);
        
        // Fetch full verified profile via /api/auth/me
        try {
          const meRes = await authService.getMe();
          if (meRes.success && meRes.data?.user) {
            setUser(meRes.data.user);
            setProfile(meRes.data.profile || null);
            setCurrentUser(meRes.data.user);
          } else {
            setUser(res.data);
            setCurrentUser(res.data);
          }
        } catch (meErr) {
          setUser(res.data);
          setCurrentUser(res.data);
        }

        connectSocket();
        return res;
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    disconnectSocket();
    authService.logout();
    setUser(null);
    setProfile(null);
    setTokenState(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        authError,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
