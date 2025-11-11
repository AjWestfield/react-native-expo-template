import { DefaultTheme } from '@react-navigation/native';

// Glassmorphic Apple-inspired Design System
export const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FFFFFF',
    background: '#000000',
    card: 'rgba(255, 255, 255, 0.05)',
    text: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.1)',
    notification: '#FFFFFF',
  },
};

export const colors = {
  // Background colors
  background: {
    primary: '#000000',      // Pure black
    secondary: '#0A0A0A',    // Near black
    tertiary: '#1A1A1A',     // Dark gray
  },

  // Solid surfaces for non-glass UI
  surface: {
    primary: '#151515',
    secondary: '#1F1F1F',
    border: '#2A2A2A',
  },

  // Glass morphic colors
  glass: {
    background: 'rgba(255, 255, 255, 0.05)',     // Glass background
    backgroundLight: 'rgba(255, 255, 255, 0.08)', // Lighter glass
    backgroundMedium: 'rgba(255, 255, 255, 0.12)', // Mid glass tone
    border: 'rgba(255, 255, 255, 0.1)',          // Glass border
    borderLight: 'rgba(255, 255, 255, 0.15)',    // Lighter glass border
    highlight: 'rgba(255, 255, 255, 0.12)',      // Glass on hover/press
    shadow: 'rgba(0, 0, 0, 0.3)',                // Glass shadow
  },

  // Text colors
  text: {
    primary: '#FFFFFF',      // Pure white
    secondary: '#A0A0A0',    // Light gray
    tertiary: '#666666',     // Medium gray
    quaternary: '#404040',   // Dark gray (subtle)
  },

  // Accent colors (subtle whites and grays)
  accent: {
    white: '#FFFFFF',
    lightGray: '#CCCCCC',
    mediumGray: '#999999',
    darkGray: '#333333',
  },

  // Gradient colors for liquid glass effect
  gradients: {
    glassWhite: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
    glassBlack: ['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.2)'],
    subtle: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)'],
  },

  // Status colors (monochrome versions)
  status: {
    success: '#FFFFFF',
    warning: '#CCCCCC',
    error: '#999999',
  },
};

// Typography system (Apple-inspired)
export const typography = {
  hero: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.3,
    lineHeight: 21,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 13,
  },
};

// Spacing system (8pt grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius system
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Shadow system for glassmorphic effect
export const shadows = {
  glass: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glassLight: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  glassHeavy: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
};
