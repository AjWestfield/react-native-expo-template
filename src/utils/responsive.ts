import { Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { CONTENT_MAX_WIDTHS, RESPONSIVE_SPACING, GRID_COLUMNS, TYPOGRAPHY_SCALE } from '../constants/responsive';
import { ResponsiveInfo } from '../hooks/useResponsive';

/**
 * Get responsive spacing based on screen size
 */
export const getResponsiveSpacing = (responsive: ResponsiveInfo) => {
  if (responsive.isDesktop || responsive.isLargeDesktop) {
    return RESPONSIVE_SPACING.desktop;
  }
  if (responsive.isTablet) {
    return RESPONSIVE_SPACING.tablet;
  }
  return RESPONSIVE_SPACING.mobile;
};

/**
 * Get responsive grid columns for different screen types
 */
export const getGridColumns = (
  screen: 'explore' | 'templates',
  responsive: ResponsiveInfo
): number => {
  if (responsive.isLargeDesktop) {
    return GRID_COLUMNS.large[screen];
  }
  if (responsive.isDesktop) {
    return GRID_COLUMNS.desktop[screen];
  }
  if (responsive.isTablet) {
    return GRID_COLUMNS.tablet[screen];
  }
  return GRID_COLUMNS.mobile[screen];
};

/**
 * Create a container style with max-width for centered content
 */
export const createCenteredContainer = (
  maxWidth: keyof typeof CONTENT_MAX_WIDTHS,
  responsive: ResponsiveInfo
): StyleProp<ViewStyle> => {
  const spacing = getResponsiveSpacing(responsive);

  return {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTHS[maxWidth],
    marginHorizontal: 'auto',
    paddingHorizontal: spacing.horizontal,
    alignSelf: 'center',
  };
};

/**
 * Merge styles conditionally based on platform or screen size
 */
export const responsiveStyle = <T extends ViewStyle | TextStyle>(
  baseStyle: T,
  webStyle?: Partial<T>,
  tabletStyle?: Partial<T>,
  desktopStyle?: Partial<T>
): StyleProp<T> => {
  const styles: any = { ...baseStyle };

  // Apply web-specific styles
  if (Platform.OS === 'web' && webStyle) {
    Object.assign(styles, webStyle);
  }

  // Note: For screen-size based styles, use the responsive info from useResponsive hook
  // and conditionally apply tabletStyle or desktopStyle in components

  return styles;
};

/**
 * Calculate item width for grid layouts
 */
export const calculateGridItemWidth = (
  containerWidth: number,
  columns: number,
  gap: number
): number => {
  const totalGap = gap * (columns - 1);
  return (containerWidth - totalGap) / columns;
};

/**
 * Get responsive padding for screens with sidebar on web
 */
export const getContentPadding = (responsive: ResponsiveInfo) => {
  // Sidebar now pushes content, no extra padding needed
  return {
    paddingLeft: 0,
    paddingRight: 0,
  };
};

/**
 * Scale font size for desktop (1.25x scaling)
 */
export const getResponsiveFontSize = (baseFontSize: number, responsive: ResponsiveInfo): number => {
  if (responsive.isDesktop || responsive.isLargeDesktop) {
    return Math.round(baseFontSize * TYPOGRAPHY_SCALE.desktop);
  }
  return baseFontSize;
};

/**
 * Create responsive text style with scaled typography for desktop
 */
export const createResponsiveTextStyle = (
  baseFontSize: number,
  responsive: ResponsiveInfo,
  additionalStyles?: Partial<TextStyle>
): TextStyle => {
  return {
    fontSize: getResponsiveFontSize(baseFontSize, responsive),
    ...additionalStyles,
  };
};

/**
 * Get responsive header button size (larger on desktop)
 */
export const getHeaderButtonSize = (responsive: ResponsiveInfo): number => {
  if (responsive.isDesktop || responsive.isLargeDesktop) {
    return 48; // Larger on desktop
  }
  return 44; // Mobile size
};

/**
 * Get responsive icon size (larger on desktop)
 */
export const getIconSize = (baseSize: number, responsive: ResponsiveInfo): number => {
  if (responsive.isDesktop || responsive.isLargeDesktop) {
    return Math.round(baseSize * 1.15); // Slightly larger on desktop
  }
  return baseSize;
};
