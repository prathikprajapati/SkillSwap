/**
 * Design System Constants
 * Standardized spacing, typography, and theme values
 */

// Standardized Spacing Scale (8px base)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Typography Scale
export const typography = {
  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 42,
    "6xl": 56,
    "7xl": 64,
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

// Border Radius Scale
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 9999,
} as const;

// Shadow Scale
export const shadows = {
  none: "none",
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  md: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
  lg: "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
  xl: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
  "2xl": "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
  glow: "0 0 20px var(--primary)",
  "neon-glow": "var(--neon-glow)",
} as const;

// Animation Durations
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 1000,
} as const;

// Z-Index Scale
export const zIndex = {
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
} as const;

// Breakpoints (for reference)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// Container Max Widths
export const containers = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1200,
  "2xl": 1400,
} as const;

// Transition defaults
export const transitions = {
  default: "all 0.3s ease",
  fast: "all 0.15s ease",
  slow: "all 0.5s ease",
} as const;

// Helper function to get spacing value
export const getSpacing = (key: keyof typeof spacing): number => {
  return spacing[key];
};

// Helper function to get typography value
export const getTypography = (
  key: keyof typeof typography.fontSize,
): number => {
  return typography.fontSize[key];
};

export default {
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
  zIndex,
  breakpoints,
  containers,
  transitions,
  getSpacing,
  getTypography,
};
