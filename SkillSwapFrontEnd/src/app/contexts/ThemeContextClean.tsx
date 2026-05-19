import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'electric-coral' | 'deep-sapphire' | 'modern-violet';
export type ThemeVariant = 'light' | 'dark';

interface ThemeColors {
  '--background': string;
  '--foreground': string;
  '--surface': string;
  '--card': string;
  '--card-foreground': string;
  '--border': string;
  '--primary': string;
  '--primary-foreground': string;
  '--accent': string;
  '--text-primary': string;
  '--text-secondary': string;
  '--muted': string;
  '--muted-foreground': string;
}

interface ThemeContextType {
  themeName: ThemeName;
  themeVariant: ThemeVariant;
  setThemeName: (name: ThemeName) => void;
  setThemeVariant: (variant: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('electric-coral');
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('light');

  useEffect(() => {
    // Apply theme to document
    const themeString = `${themeName}-${themeVariant}`;
    document.documentElement.setAttribute('data-theme', themeString);
    
    // Save to localStorage
    localStorage.setItem('skillswap-theme-name', themeName);
    localStorage.setItem('skillswap-theme-variant', themeVariant);
  }, [themeName, themeVariant]);

  const value: ThemeContextType = {
    themeName,
    themeVariant,
    setThemeName,
    setThemeVariant
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for theme-specific utilities
export function useThemeUtils() {
  const { themeName, themeVariant } = useTheme();
  
  const getCSSVariable = (variable: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
  };

  const getThemeColors = (): ThemeColors => {
    return {
      '--background': getCSSVariable('--background'),
      '--foreground': getCSSVariable('--foreground'),
      '--surface': getCSSVariable('--surface'),
      '--card': getCSSVariable('--card'),
      '--card-foreground': getCSSVariable('--card-foreground'),
      '--border': getCSSVariable('--border'),
      '--primary': getCSSVariable('--primary'),
      '--primary-foreground': getCSSVariable('--primary-foreground'),
      '--accent': getCSSVariable('--accent'),
      '--text-primary': getCSSVariable('--text-primary'),
      '--text-secondary': getCSSVariable('--text-secondary'),
      '--muted': getCSSVariable('--muted'),
      '--muted-foreground': getCSSVariable('--muted-foreground')
    };
  };

  const isDarkMode = themeVariant === 'dark';
  const isLightMode = themeVariant === 'light';

  return {
    getCSSVariable,
    getThemeColors,
    isDarkMode,
    isLightMode,
    themeName,
    themeVariant
  };
}
