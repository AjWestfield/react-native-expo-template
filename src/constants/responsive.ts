/**
 * Responsive layout constants for web adaptation
 */

export const SIDEBAR = {
  collapsedWidth: 64,
  expandedWidth: 240,
  transitionDuration: 250, // milliseconds
  zIndex: 1000,
} as const;

export const CONTENT_MAX_WIDTHS = {
  small: 700, // Forms, single-column content (increased from 600)
  medium: 900, // Two-column layouts
  large: 1200, // Three-column layouts (standard desktop constraint)
  extraLarge: 1400, // Full-width with max constraint
} as const;

export const GRID_COLUMNS = {
  mobile: {
    explore: 1,
    templates: 2,
  },
  tablet: {
    explore: 2,
    templates: 3,
  },
  desktop: {
    explore: 3, // Increased from 2 for better desktop use
    templates: 4,
  },
  large: {
    explore: 4, // Increased from 3 for large displays
    templates: 5,
  },
} as const;

export const RESPONSIVE_SPACING = {
  mobile: {
    horizontal: 16,
    vertical: 16,
    gap: 12,
    cardGap: 12,
  },
  tablet: {
    horizontal: 24,
    vertical: 24,
    gap: 16,
    cardGap: 16,
  },
  desktop: {
    horizontal: 32,
    vertical: 32,
    gap: 24, // Increased from 20
    cardGap: 20, // Increased grid spacing
  },
} as const;

// Typography scaling for desktop (1.25x scale)
export const TYPOGRAPHY_SCALE = {
  mobile: 1,
  desktop: 1.25,
} as const;
