'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isOnline: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = 'spendy_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Initialize theme from storage / system preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState(prefersDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', prefersDark);
      }
    } catch {
      setThemeState('dark');
      document.documentElement.classList.add('dark');
    }

    // Network status listener
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    } catch {
      // safe fallback
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isOnline }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
