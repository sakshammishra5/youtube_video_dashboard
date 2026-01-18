// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const baseURL = import.meta.env.VITE_BASE_URI;

  // Check authentication status on app load
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseURL}auth/status`, {
        withCredentials: true
      });
      
          console.log("AUTH STATUS:", response.data);
      if (response.data.authenticated) {
        // Get user data if authenticate
          setUser(response.data.user);
          setIsAuthenticated(true);
        
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OAuth callback
  const handleAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('auth');
    const error = urlParams.get('error');
    const tempId = urlParams.get('tempId');

    if (error) {
      setAuthError(error);
      setIsLoading(false);
      return;
    }

    if (success === 'success') {
      // If using session-based auth, just check status
      await checkAuthStatus();
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (tempId) {
      // If using temporary storage method
      try {
        const response = await axios.get(`${baseURL}api/auth/temp/${tempId}`);
        if (response.data.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to get temp data:', error);
        setAuthError('temp_data_fetch_failed');
      } finally {
        setIsLoading(false);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  // Login function
  const login = () => {
    window.location.href = `${baseURL}auth/google`;
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${baseURL}api/auth/logout`, {}, {
        withCredentials: true
      });
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout on client side even if server request fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    // Check if this is an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') || urlParams.get('error') || urlParams.get('tempId')) {
      handleAuthCallback();
    } else {
      // Regular page load, check auth status
      checkAuthStatus();
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    setAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};