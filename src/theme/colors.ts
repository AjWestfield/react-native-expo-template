import { DefaultTheme } from '@react-navigation/native';

export const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366f1',
    background: '#0f172a',
    card: '#111827',
    text: '#f3f4f6',
    border: '#1f2937',
    notification: '#6366f1',
  },
};

export const colors = {
  background: '#0f172a',
  card: '#111827',
  cardHover: '#1f2937',
  text: {
    primary: '#f3f4f6',
    secondary: '#9ca3af',
    muted: '#6b7280',
  },
  border: '#1f2937',
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  accent: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};
