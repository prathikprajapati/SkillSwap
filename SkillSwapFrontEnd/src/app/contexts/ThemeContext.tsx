import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('dark');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load saved theme from localStorage
    const savedThemeName = localStorage.getItem('skillswap-theme-name') as ThemeName;
    const savedThemeVariant = localStorage.getItem('skillswap-theme-variant') as ThemeVariant;

    if (savedThemeName) setThemeName(savedThemeName);
    if (savedThemeVariant === 'light' || savedThemeVariant === 'dark') {
      setThemeVariant(savedThemeVariant);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Apply the selected theme: e.g. "electric-coral-dark"
    const themeString = `${themeName}-${themeVariant}`;
    document.documentElement.setAttribute('data-theme', themeString);

    // Enable theme transitions once the theme is applied (themes.css gates on this class)
    document.body.classList.add('theme-loaded');

    localStorage.setItem('skillswap-theme-name', themeName);
    localStorage.setItem('skillswap-theme-variant', themeVariant);
  }, [themeName, themeVariant, isMounted]);

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const getCSSVariable = (variable: string): string => {
    if (!isMounted || typeof document === 'undefined') return '';
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
  };

  const getThemeColors = (): ThemeColors => {
    if (!isMounted) {
      return {
        '--background': '',
        '--foreground': '',
        '--surface': '',
        '--card': '',
        '--card-foreground': '',
        '--border': '',
        '--primary': '',
        '--primary-foreground': '',
        '--accent': '',
        '--text-primary': '',
        '--text-secondary': '',
        '--muted': '',
        '--muted-foreground': ''
      };
    }
    
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
