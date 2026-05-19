import React from 'react';
import { ThemeProvider } from '@/app/contexts/ThemeContext';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
