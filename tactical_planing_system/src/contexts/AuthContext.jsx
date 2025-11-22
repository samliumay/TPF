/**
 * AuthContext - Authentication state management
 * 
 * Manages user authentication state and provides login/logout functionality.
 * Currently uses localStorage for persistence, but can be easily replaced
 * with backend API calls.
 */

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // TODO: Replace with actual backend API call
    // For now, simple validation (in production, this should call your backend)
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Simulate API call
    // In production, replace this with:
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    // const data = await response.json();
    // if (!response.ok) throw new Error(data.message);
    
    // Mock user data for now
    const mockUser = {
      id: 1,
      email: email,
      name: email.split('@')[0], // Use email prefix as name
      token: 'mock-token-' + Date.now(),
    };

    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
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

