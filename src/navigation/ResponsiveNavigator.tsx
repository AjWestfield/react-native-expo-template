import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { SidebarNavigator } from './SidebarNavigator';
import { MainTabNavigator } from './MainTabNavigator';

/**
 * ResponsiveNavigator - Conditionally renders sidebar or bottom tabs
 *
 * Logic:
 * - Mobile (iOS/Android): Always uses bottom tab navigation
 * - Web < 768px: Uses bottom tab navigation (mobile experience)
 * - Web >= 768px: Uses sidebar navigation (desktop experience)
 *
 * This ensures mobile platforms remain unchanged while web gets
 * responsive sidebar navigation on larger screens.
 */
export const ResponsiveNavigator: React.FC = () => {
  const { shouldUseSidebar } = useResponsive();

  // Use sidebar only on web platform with screen width >= 768px
  if (shouldUseSidebar) {
    return <SidebarNavigator />;
  }

  // Default to bottom tab navigation for mobile and small screens
  return <MainTabNavigator />;
};
