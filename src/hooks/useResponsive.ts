import { Platform, useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  large: 1440,
} as const;

export interface ResponsiveInfo {
  width: number;
  height: number;
  isWeb: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  shouldUseSidebar: boolean;
}

/**
 * Hook to detect screen size and platform for responsive layouts
 *
 * Breakpoints:
 * - Mobile: < 768px (bottom navigation)
 * - Tablet/Desktop: >= 768px (sidebar navigation on web)
 *
 * @returns Responsive information including screen dimensions and platform flags
 */
export const useResponsive = (): ResponsiveInfo => {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop && width < BREAKPOINTS.large;
  const isLargeDesktop = width >= BREAKPOINTS.large;

  // Use sidebar only on web platform AND when screen is tablet size or larger
  const shouldUseSidebar = isWeb && width >= BREAKPOINTS.tablet;

  return {
    width,
    height,
    isWeb,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    shouldUseSidebar,
  };
};
