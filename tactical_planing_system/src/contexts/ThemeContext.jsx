/**
 * ThemeContext - Global theme management (Dark/Light mode)
 * 
 * Manages application theme state and provides functions to toggle
 * between light and dark color schemes.
 * 
 * Features:
 * - Dark/Light mode toggle
 * - Persistent theme preference (localStorage)
 * - System preference detection
 */

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = () => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default to light
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  /**
   * Toggle between dark and light theme
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  /**
   * Set theme explicitly
   * 
   * @param {string} newTheme - 'light' or 'dark'
   */
  const setThemeExplicit = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    theme,
    toggleTheme,
    setTheme: setThemeExplicit,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme - Hook to access ThemeContext
 * 
 * @returns {Object} Theme context with theme state and toggle functions
 * @throws {Error} If used outside of ThemeProvider
 * 
 * Usage:
 * const { theme, toggleTheme, isDark } = useTheme();
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

