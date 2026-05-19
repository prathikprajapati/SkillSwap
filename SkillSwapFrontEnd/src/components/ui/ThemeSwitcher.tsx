import { useMemo, useState } from 'react';
import { useTheme, type ThemeName, type ThemeVariant } from '@/app/contexts/ThemeContext';
import { Palette, Sun, Moon, ChevronDown } from 'lucide-react';

interface ThemeSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'grid' | 'compact';
}

type ThemeConfig = {
  displayName: string;
  description: string;
  previewColors: {
    background: string;
    primary: string;
    accent: string;
  };
};

// Local, crash-proof defaults.
// This component previously depended on theme context exports that are not present
// in the current ThemeContext.tsx, causing `availableThemes.map(...)` to throw.
const THEME_CONFIGS: Record<ThemeName, { light: ThemeConfig; dark: ThemeConfig }> = {
  'electric-coral': {
    light: {
      displayName: 'Electric Coral',
      description: 'Bright coral accent with clean neutrals.',
      previewColors: {
        background: '#fff7f6',
        primary: '#ff6b6b',
        accent: '#ffa07a',
      },
    },
    dark: {
      displayName: 'Electric Coral (Dark)',
      description: 'Coral accents with deep, high-contrast surfaces.',
      previewColors: {
        background: '#0f0a10',
        primary: '#ff6b6b',
        accent: '#b63b3b',
      },
    },
  },
  'deep-sapphire': {
    light: {
      displayName: 'Deep Sapphire',
      description: 'Sapphire primary with calm, readable surfaces.',
      previewColors: {
        background: '#f6f9ff',
        primary: '#1d4ed8',
        accent: '#3b82f6',
      },
    },
    dark: {
      displayName: 'Deep Sapphire (Dark)',
      description: 'Sapphire accents with dark, cinematic contrast.',
      previewColors: {
        background: '#070a12',
        primary: '#3b82f6',
        accent: '#1d4ed8',
      },
    },
  },
  'modern-violet': {
    light: {
      displayName: 'Modern Violet',
      description: 'Violet highlights for a modern, friendly UI.',
      previewColors: {
        background: '#fbf9ff',
        primary: '#7c3aed',
        accent: '#a78bfa',
      },
    },
    dark: {
      displayName: 'Modern Violet (Dark)',
      description: 'Violet energy with deep, comfortable dark mode.',
      previewColors: {
        background: '#0b0610',
        primary: '#a78bfa',
        accent: '#7c3aed',
      },
    },
  },
};

export function ThemeSwitcher({ className = '', variant = 'dropdown' }: ThemeSwitcherProps) {
  const { themeName, themeVariant, setThemeName, setThemeVariant } = useTheme();

  const availableThemes = useMemo(() => Object.keys(THEME_CONFIGS) as ThemeName[], []);

  const toggleThemeVariant = () => {
    setThemeVariant(themeVariant === 'light' ? 'dark' : 'light');
  };

  const getThemeConfig = (name: ThemeName, variant: ThemeVariant): ThemeConfig => {
    return THEME_CONFIGS[name][variant];
  };
  
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (name: ThemeName, variant: ThemeVariant) => {
    setThemeName(name);
    setThemeVariant(variant);
    setIsOpen(false);
  };

  const ThemePreview = ({ 
    name, 
    variant, 
    size = 'small' 
  }: { 
    name: ThemeName; 
    variant: ThemeVariant; 
    size?: 'small' | 'medium' | 'large' 
  }) => {
    const config = getThemeConfig(name, variant);
    const sizeClasses = {
      small: 'w-6 h-6',
      medium: 'w-8 h-8',
      large: 'w-12 h-12'
    };

    return (
      <div className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700`}>
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: config.previewColors.background }}
        />
        <div 
          className="absolute top-0 left-0 w-1/2 h-full"
          style={{ backgroundColor: config.previewColors.primary }}
        />
        <div 
          className="absolute top-0 right-0 w-1/2 h-full"
          style={{ backgroundColor: config.previewColors.accent }}
        />
      </div>
    );
  };

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-3 gap-4 p-4 ${className}`}>
        {availableThemes.map((theme) => (
          <div key={theme} className="space-y-2">
            <div className="flex justify-center gap-2">
              <ThemePreview name={theme} variant="light" size="medium" />
              <ThemePreview name={theme} variant="dark" size="medium" />
            </div>
            <div className="text-center">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {THEME_CONFIGS[theme].displayName}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {THEME_CONFIGS[theme].description}
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleThemeSelect(theme, 'light')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  themeName === theme && themeVariant === 'light'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => handleThemeSelect(theme, 'dark')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  themeName === theme && themeVariant === 'dark'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={toggleThemeVariant}
          className="p-2 rounded-lg bg-surface border border-border hover:bg-surface-elevated transition-colors touch-target"
          aria-label="Toggle dark mode"
        >
          {themeVariant === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>
        
        <div className="flex gap-1">
          {availableThemes.map((theme) => (
            <button
              key={theme}
              onClick={() => setThemeName(theme)}
              className={`p-1 rounded transition-colors touch-target ${
                themeName === theme 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : 'hover:bg-surface'
              }`}
              aria-label={`Switch to ${THEME_CONFIGS[theme].displayName} theme`}
            >
              <ThemePreview name={theme} variant={themeVariant} size="small" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg hover:bg-surface-elevated transition-colors touch-target"
        aria-label="Select theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">
          {THEME_CONFIGS[themeName].displayName}
        </span>
        <span className="text-xs text-text-muted">
          ({themeVariant})
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg z-20">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-sm text-text-primary mb-1">
                Select Theme
              </h3>
              <p className="text-xs text-text-muted">
                Choose your preferred color scheme and lighting
              </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {availableThemes.map((theme) => (
                <div key={theme} className="p-3 border-b border-border last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm text-text-primary">
                        {THEME_CONFIGS[theme].displayName}
                      </h4>
                      <p className="text-xs text-text-muted">
                        {THEME_CONFIGS[theme].description}
                      </p>
                    </div>
                    <ThemePreview name={theme} variant={themeVariant} size="medium" />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleThemeSelect(theme, 'light')}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors touch-target ${
                        themeName === theme && themeVariant === 'light'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Sun className="w-3 h-3" />
                      Light
                    </button>
                    <button
                      onClick={() => handleThemeSelect(theme, 'dark')}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors touch-target ${
                        themeName === theme && themeVariant === 'dark'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Moon className="w-3 h-3" />
                      Dark
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeSwitcher;
